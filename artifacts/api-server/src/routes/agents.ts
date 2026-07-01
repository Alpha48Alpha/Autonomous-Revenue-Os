import { Router, Request, Response, NextFunction } from "express";
import { db, leads, messages, transactions, startupProfiles, activities } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getAutopilotStatus, startAutopilot, stopAutopilot, runNow } from "../autopilot";
import OpenAI from "openai";

export const agentsRouter = Router();

function getOpenAI() {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy";
  if (!baseURL) throw new Error("AI_INTEGRATIONS_OPENAI_BASE_URL not set");
  return new OpenAI({ baseURL, apiKey });
}

type LeadRow = typeof leads.$inferSelect;
type ProfileRow = typeof startupProfiles.$inferSelect;

// Default outreach message for Autonomous Revenue OS. Fully editable by the
// owner in the app — this is only used until a custom campaign message is saved.
const DEFAULT_SMS_CAMPAIGN =
  "{name}, imagine waking up to income that worked all night without you. Autonomous Revenue OS is the AI that runs your money on autopilot — and the ones who move first are already pulling ahead. This door won't stay open long. Tap in before it closes 👉 [PASTE YOUR LINK]. Reply STOP to opt out.";

// Replaces personalization tokens with the lead's details. Supports {name},
// {firstName} (first name) and {fullName} (full name). Unknown tokens are left as-is.
function personalizeMessage(template: string, lead: LeadRow): string {
  const first = (lead.name || "").trim().split(/\s+/)[0] || "there";
  return template
    .replace(/\{\s*first\s*name\s*\}/gi, first)
    .replace(/\{\s*name\s*\}/gi, first)
    .replace(/\{\s*full\s*name\s*\}/gi, (lead.name || "").trim() || first);
}

// Sends one SMS to a lead using the saved campaign message (or an explicitly
// provided body), records message/transaction/activity, and returns the outcome.
// Shared by the single and bulk SMS routes.
async function sendSmsToLead(
  lead: LeadRow,
  profile: ProfileRow | undefined,
  providedBody?: string | null,
): Promise<{
  success: boolean;
  transactionId: number;
  provider: string;
  providerId: string | null;
  body: string;
  error: string | null;
  recipient: string | null;
}> {
  // The campaign message is the single source of truth for what gets sent.
  // No AI generation, no generic fallback — what the owner writes is exactly what goes out.
  const template = (providedBody && providedBody.trim())
    || (profile?.smsCampaignMessage && profile.smsCampaignMessage.trim())
    || DEFAULT_SMS_CAMPAIGN;
  let body: string = personalizeMessage(template, lead);

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  let providerId: string | null = null;
  let success = false;
  let errorMsg: string | null = null;
  const sentAt = new Date();
  const useTwilio = !!(accountSid && authToken && fromNumber);

  if (useTwilio) {
    try {
      const twilio = (await import("twilio")).default;
      const client = twilio(accountSid, authToken);
      const appBase = process.env.APP_URL
        || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null);
      const msgOptions: any = { body, from: fromNumber, to: lead.phone };
      if (appBase) msgOptions.statusCallback = `${appBase}/api/agents/sms-status`;
      const result = await client.messages.create(msgOptions);
      providerId = result.sid;
      success = true;
    } catch (err: any) {
      errorMsg = err.message;
      success = false;
    }
  } else {
    errorMsg = "Twilio credentials not configured — SMS simulated";
    success = true;
    providerId = `sim_SM${Date.now()}`;
  }

  const [msg] = await db.insert(messages).values({
    subject: "SMS",
    body,
    channel: "sms",
    status: success ? "sent" : "bounced",
    leadId: lead.id,
    agentTeam: "outreach",
    sentAt,
  }).returning();

  const [txn] = await db.insert(transactions).values({
    type: "sms",
    provider: useTwilio ? "twilio" : "simulated",
    status: success ? (useTwilio ? "sent" : "delivered") : "failed",
    providerId,
    leadId: lead.id,
    messageId: msg.id,
    recipient: lead.phone,
    body,
    cost: useTwilio ? 0.0075 : null,
    deliveredAt: success && !useTwilio ? sentAt : null,
  }).returning();

  if (success) {
    await db.update(leads).set({ status: "contacted", updatedAt: new Date() }).where(eq(leads.id, lead.id));
  }

  await db.insert(activities).values({
    agentTeam: "outreach",
    type: "message_sent",
    description: `SMS ${success ? "sent" : "failed"} to ${lead.name} at ${lead.phone}`,
    relatedEntityType: "lead",
    relatedEntityId: lead.id,
  });

  return {
    success,
    transactionId: txn.id,
    provider: useTwilio ? "twilio" : "simulated",
    providerId,
    body,
    error: errorMsg,
    recipient: lead.phone,
  };
}

// ── Subscription gate middleware ───────────────────────────────────────────────
async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  const rawKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE;
  const secretKey = (rawKey && (rawKey.startsWith("sk_test_") || rawKey.startsWith("sk_live_") || rawKey.startsWith("rk_test_") || rawKey.startsWith("rk_live_"))) ? rawKey : null;

  if (!secretKey) return next();

  try {
    const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);

    if (!profile) return next();

    const status = profile.stripeSubscriptionStatus;
    if (status && status !== "none" && status !== "canceled" && status !== "past_due") {
      return next();
    }

    if (profile.stripeSubscriptionId) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(secretKey);
      const sub = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId);

      await db.update(startupProfiles)
        .set({ stripeSubscriptionStatus: sub.status, updatedAt: new Date() })
        .where(eq(startupProfiles.id, profile.id));

      if (sub.status === "active" || sub.status === "trialing") {
        return next();
      }
    }

    return res.status(402).json({
      error: "Active subscription required. Visit the Billing page to subscribe.",
      code: "SUBSCRIPTION_REQUIRED",
    });
  } catch (err: any) {
    console.error("requireActiveSubscription error:", err.message);
    return res.status(503).json({
      error: "Subscription check temporarily unavailable. Please try again.",
      code: "SUBSCRIPTION_CHECK_FAILED",
    });
  }
}

// ── Delivery Config / Setup Status ────────────────────────────────────────────
agentsRouter.get("/delivery-config", async (_req, res) => {
  const resendKey = process.env.RESEND_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "outreach@blackman-whatley.ai";

  const result: {
    resend: {
      configured: boolean;
      fromEmail: string;
      domain: string | null;
      domainVerified: boolean;
      domainStatus: string | null;
      dnsRecords: Array<{ type: string; name: string; value: string; ttl?: string | number; priority?: number }>;
    };
    twilio: {
      configured: boolean;
      fromNumber: string | null;
    };
  } = {
    resend: {
      configured: !!resendKey,
      fromEmail,
      domain: null,
      domainVerified: false,
      domainStatus: null,
      dnsRecords: [],
    },
    twilio: {
      configured: !!(twilioSid && twilioToken && twilioFrom),
      fromNumber: twilioFrom || null,
    },
  };

  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      const domainPart = fromEmail.split("@")[1] || "blackman-whatley.ai";
      result.resend.domain = domainPart;

      const listResult = await resend.domains.list();
      const domains = (listResult as any)?.data?.data ?? (listResult as any)?.data ?? [];
      const match = Array.isArray(domains)
        ? domains.find((d: any) => d.name === domainPart)
        : null;

      if (match) {
        result.resend.domainStatus = match.status ?? null;
        result.resend.domainVerified = match.status === "verified";

        // domains.list() doesn't include DNS records — fetch full detail
        try {
          const detail = await resend.domains.get(match.id);
          const domainDetail = (detail as any)?.data ?? detail;
          const records = domainDetail?.records ?? domainDetail?.dnsRecords ?? match.records ?? [];
          if (Array.isArray(records)) {
            result.resend.dnsRecords = records.map((r: any) => ({
              type: r.type ?? r.record_type ?? "",
              name: r.name ?? r.host ?? "",
              value: r.value ?? r.data ?? "",
              ttl: r.ttl ?? "Auto",
              priority: r.priority ?? undefined,
            }));
          }
        } catch (detailErr: any) {
          console.error("Resend domains.get error:", detailErr.message);
        }
      } else {
        // Domain not yet in Resend — create it now so DNS records are generated
        try {
          const createResult = await resend.domains.create({ name: domainPart });
          const created = (createResult as any)?.data ?? createResult;
          result.resend.domainStatus = created?.status ?? "pending";
          result.resend.domainVerified = false;

          const createdRecords = created?.records ?? created?.dnsRecords ?? [];
          if (Array.isArray(createdRecords)) {
            result.resend.dnsRecords = createdRecords.map((r: any) => ({
              type: r.type ?? r.record_type ?? "",
              name: r.name ?? r.host ?? "",
              value: r.value ?? r.data ?? "",
              ttl: r.ttl ?? "Auto",
              priority: r.priority ?? undefined,
            }));
          }
          console.log(`Resend: domain "${domainPart}" created, status=${result.resend.domainStatus}, ${result.resend.dnsRecords.length} DNS records returned`);
        } catch (createErr: any) {
          // Domain may already exist under a different API key or creation failed
          console.error("Resend domain create error:", createErr.message);
          result.resend.domainStatus = "not_found";
        }
      }
    } catch (err: any) {
      console.error("delivery-config Resend check error:", err.message);
      result.resend.domainStatus = "error";
    }
  }

  res.json(result);
});

// ── Generate Leads via AI ──────────────────────────────────────────────────────
agentsRouter.post("/generate-leads", requireActiveSubscription, async (req, res) => {
  const { count = 5, industry, targetRole } = req.body;

  const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  if (!profile) {
    return res.status(400).json({ error: "Company profile not configured. Go to Company Setup first." });
  }

  const profileContext = `Company: ${profile.companyName}
Industry: ${profile.industry}
Target Market: ${profile.targetMarket}
Value Proposition: ${profile.valueProp}
Ideal Customer Profile: ${profile.icp}`;

  const systemPrompt = `You are a B2B lead generation AI agent for an AI revenue automation company. Generate realistic, plausible B2B leads in JSON format. Each lead must have realistic names, corporate email addresses, company names, and LinkedIn URLs. Do NOT use generic placeholders — create believable people at real-sounding companies.`;

  const userPrompt = `Generate ${count} B2B leads for outreach.
${profileContext ? `\nContext about our company:\n${profileContext}` : ""}
${industry ? `Focus on the ${industry} industry.` : ""}
${targetRole ? `Target role: ${targetRole}` : "Target decision-makers (VP, Director, CTO, CEO, Head of)."}

Return a JSON array with exactly ${count} leads. Each object must have:
- name (string): Full name
- email (string): Work email
- company (string): Company name
- title (string): Job title
- phone (string): US phone number like +1-555-xxx-xxxx
- linkedinUrl (string): https://linkedin.com/in/firstname-lastname
- score (integer): 50-95
- source (string): "AI Agent"
- notes (string): 1-2 sentences on why they're a good fit

Return ONLY the JSON array, no other text.`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawText = completion.choices[0]?.message?.content || "[]";
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: "AI did not return valid JSON" });

    const generatedLeads: any[] = JSON.parse(jsonMatch[0]);
    const inserted: any[] = [];

    for (const lead of generatedLeads) {
      const [row] = await db.insert(leads).values({
        name: lead.name,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        phone: lead.phone,
        linkedinUrl: lead.linkedinUrl,
        score: lead.score || 70,
        source: "AI Agent",
        notes: lead.notes,
        agentTeam: "research",
        status: "new",
      }).returning();
      inserted.push(row);
    }

    await db.insert(activities).values({
      agentTeam: "research",
      type: "lead_discovered",
      description: `AI agent generated ${inserted.length} new leads via intelligence scan`,
      relatedEntityType: "lead",
    });

    res.json({ generated: inserted.length, leads: inserted });
  } catch (err: any) {
    console.error("generate-leads error:", err);
    res.status(500).json({ error: err.message || "AI lead generation failed" });
  }
});

// ── Send Email via Resend ──────────────────────────────────────────────────────
agentsRouter.post("/send-email/:leadId", requireActiveSubscription, async (req, res) => {
  const leadId = parseInt(req.params.leadId);
  if (isNaN(leadId)) return res.status(400).json({ error: "Invalid lead ID" });

  const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  if (!profile) return res.status(400).json({ error: "Company profile not configured. Go to Company Setup first." });

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  let { subject, body } = req.body;

  if (!subject || !body) {
    try {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        max_completion_tokens: 1024,
        messages: [
          {
            role: "system",
            content: `You are an expert B2B sales email writer for ${profile?.companyName || "an AI revenue automation company"}. Write concise, personalized cold outreach emails that feel human and get replies. No generic templates.`,
          },
          {
            role: "user",
            content: `Write a cold outreach email to:
Name: ${lead.name}
Title: ${lead.title || "Decision Maker"}
Company: ${lead.company || "their company"}
${profile ? `\nFrom: ${profile.companyName}\nValue Prop: ${profile.valueProp}` : ""}

Return JSON: { "subject": "...", "body": "..." }
Keep body under 150 words. No HTML. Professional but warm tone. Return ONLY JSON.`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        subject = parsed.subject;
        body = parsed.body;
      }
    } catch (aiErr) {
      console.error("AI email compose error:", aiErr);
    }
  }

  subject = subject || (profile?.companyName ? `Partnership opportunity from ${profile.companyName}` : "Partnership opportunity");
  body = body || `Hi ${lead.name.split(" ")[0]},\n\nI wanted to reach out about a potential partnership opportunity. We help companies like yours streamline their revenue operations with AI.\n\nWould you be open to a 15-minute call this week?\n\nBest regards,\nThe Team`;

  const resendKey = process.env.RESEND_API_KEY;
  let providerId: string | null = null;
  let success = false;
  let errorMsg: string | null = null;
  const sentAt = new Date();

  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "outreach@blackman-whatley.ai";
      const result = await resend.emails.send({
        from: fromEmail,
        to: lead.email,
        subject,
        text: body,
      });
      providerId = result.data?.id || null;
      success = !result.error;
      if (result.error) errorMsg = result.error.message;
    } catch (err: any) {
      errorMsg = err.message;
      success = false;
    }
  } else {
    errorMsg = "RESEND_API_KEY not configured — email simulated";
    success = true;
    providerId = `sim_${Date.now()}`;
  }

  const [msg] = await db.insert(messages).values({
    subject,
    body,
    channel: "email",
    status: success ? "sent" : "bounced",
    leadId: lead.id,
    agentTeam: "outreach",
    sentAt,
  }).returning();

  const [txn] = await db.insert(transactions).values({
    type: "email",
    provider: resendKey ? "resend" : "simulated",
    status: success ? (resendKey ? "sent" : "delivered") : "failed",
    providerId,
    leadId: lead.id,
    messageId: msg.id,
    recipient: lead.email,
    subject,
    body,
    deliveredAt: success && !resendKey ? sentAt : null,
  }).returning();

  await db.update(leads).set({ status: "contacted", updatedAt: new Date() }).where(eq(leads.id, leadId));

  await db.insert(activities).values({
    agentTeam: "outreach",
    type: "message_sent",
    description: `Email sent to ${lead.name} at ${lead.company || "their company"} — "${subject}"`,
    relatedEntityType: "lead",
    relatedEntityId: leadId,
  });

  res.json({
    success,
    transactionId: txn.id,
    provider: txn.provider,
    providerId,
    recipient: lead.email,
    type: "email",
    subject,
    body,
    sentAt: sentAt.toISOString(),
    error: errorMsg,
  });
});

// ── Send SMS via Twilio ────────────────────────────────────────────────────────
agentsRouter.post("/send-sms/:leadId", requireActiveSubscription, async (req, res) => {
  const leadId = parseInt(req.params.leadId);
  if (isNaN(leadId)) return res.status(400).json({ error: "Invalid lead ID" });

  const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  if (!profile) return res.status(400).json({ error: "Company profile not configured. Go to Company Setup first." });

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  if (!lead.phone) return res.status(400).json({ error: "Lead has no phone number" });

  const { body: providedBody } = req.body || {};
  const result = await sendSmsToLead(lead, profile, providedBody);

  res.json({
    success: result.success,
    transactionId: result.transactionId,
    provider: result.provider,
    providerId: result.providerId,
    recipient: result.recipient,
    type: "sms",
    subject: null,
    body: result.body,
    sentAt: new Date().toISOString(),
    error: result.error,
  });
});

// ── Campaign message — the exact text every SMS sends ─────────────────────────
agentsRouter.get("/campaign-message", async (_req, res) => {
  const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  const saved = profile?.smsCampaignMessage?.trim();
  return res.json({
    message: saved || DEFAULT_SMS_CAMPAIGN,
    isDefault: !saved,
    defaultMessage: DEFAULT_SMS_CAMPAIGN,
  });
});

agentsRouter.post("/campaign-message", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Message cannot be empty." });
  if (message.length > 1000) return res.status(400).json({ error: "Message is too long (max 1000 characters)." });

  const [existing] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  if (!existing) return res.status(400).json({ error: "Set up your company profile first." });

  const [updated] = await db
    .update(startupProfiles)
    .set({ smsCampaignMessage: message, updatedAt: new Date() })
    .where(eq(startupProfiles.id, existing.id))
    .returning();

  return res.json({ message: updated.smsCampaignMessage, isDefault: false, defaultMessage: DEFAULT_SMS_CAMPAIGN });
});

// ── Bulk SMS — send to many leads with pacing ─────────────────────────────────
agentsRouter.post("/send-sms-bulk", requireActiveSubscription, async (req, res) => {
  const { leadIds, body: sharedBody } = req.body || {};
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ error: "leadIds must be a non-empty array" });
  }

  const MAX_PER_BATCH = 50;
  const ids = leadIds
    .slice(0, MAX_PER_BATCH)
    .map((n: any) => parseInt(n))
    .filter((n: number) => !isNaN(n));

  if (ids.length === 0) {
    return res.status(400).json({ error: "No valid lead IDs provided" });
  }

  const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  if (!profile) return res.status(400).json({ error: "Company profile not configured. Go to Company Setup first." });

  const results: {
    leadId: number;
    name: string;
    recipient: string | null;
    success: boolean;
    error: string | null;
  }[] = [];

  for (const id of ids) {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    if (!lead) {
      results.push({ leadId: id, name: `#${id}`, recipient: null, success: false, error: "Lead not found" });
      continue;
    }
    if (!lead.phone) {
      results.push({ leadId: id, name: lead.name, recipient: null, success: false, error: "No phone number" });
      continue;
    }

    const r = await sendSmsToLead(lead, profile, sharedBody);
    results.push({ leadId: id, name: lead.name, recipient: r.recipient, success: r.success, error: r.error });

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  const sent = results.filter((r) => r.success).length;
  res.json({
    total: results.length,
    sent,
    failed: results.length - sent,
    results,
  });
});

// ── Twilio SMS status callback (fail-closed signature validation) ─────────────
agentsRouter.post("/sms-status", async (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (accountSid && authToken) {
    const twilioSig = req.headers["x-twilio-signature"] as string | undefined;
    const appUrl = process.env.APP_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null);

    if (!twilioSig) {
      console.warn("Twilio SMS callback rejected: missing X-Twilio-Signature");
      return res.status(403).json({ error: "Missing Twilio signature" });
    }

    if (appUrl) {
      try {
        const twilio = (await import("twilio")).default;
        const callbackUrl = `${appUrl}/api/agents/sms-status`;
        const valid = twilio.validateRequest(authToken, twilioSig, callbackUrl, req.body);
        if (!valid) {
          console.warn("Twilio signature validation failed — rejecting forged callback");
          return res.status(403).json({ error: "Invalid Twilio signature" });
        }
      } catch (err: any) {
        console.error("Twilio signature verification error:", err.message);
        return res.status(503).json({ error: "Signature verification error" });
      }
    }
  }

  const { MessageSid, MessageStatus } = req.body;
  if (!MessageSid) return res.sendStatus(200);

  const STATUS_MAP: Record<string, string> = {
    delivered: "delivered",
    failed: "failed",
    undelivered: "failed",
    sent: "sent",
    queued: "pending",
    sending: "pending",
  };

  const normalizedStatus = STATUS_MAP[MessageStatus] || "sent";

  try {
    const [txn] = await db.select().from(transactions).where(eq(transactions.providerId, MessageSid)).limit(1);
    if (txn) {
      await db.update(transactions).set({
        status: normalizedStatus,
        deliveredAt: normalizedStatus === "delivered" ? new Date() : txn.deliveredAt,
      }).where(eq(transactions.id, txn.id));
    }
  } catch (err) {
    console.error("SMS status callback error:", err);
  }

  res.sendStatus(200);
});

// ── Resend email delivery webhook (cryptographic Svix verification) ────────────
agentsRouter.post("/email-status", async (req: any, res) => {
  const resendSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (resendSecret) {
    const rawBody: Buffer | undefined = req.rawBody;
    if (!rawBody) {
      return res.status(400).json({ error: "Raw body not available for verification" });
    }

    const getHeader = (h: string | string[] | undefined): string | undefined =>
      Array.isArray(h) ? h[0] : h;

    const svixId = getHeader(req.headers["svix-id"]);
    const svixTs = getHeader(req.headers["svix-timestamp"]);
    const svixSig = getHeader(req.headers["svix-signature"]);

    if (!svixId || !svixTs || !svixSig) {
      console.warn("Resend webhook rejected: missing Svix headers");
      return res.status(401).json({ error: "Missing webhook signature headers" });
    }

    try {
      const { Webhook } = await import("svix");
      const wh = new Webhook(resendSecret);
      wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTs,
        "svix-signature": svixSig,
      });
    } catch (err: any) {
      console.warn("Resend webhook signature verification failed:", err.message);
      return res.status(403).json({ error: "Invalid webhook signature" });
    }
  }

  try {
    const { type, data } = req.body;
    if (!type || !data) return res.sendStatus(200);

    const emailId: string | undefined = data.email_id;
    if (!emailId) return res.sendStatus(200);

    const STATUS_MAP: Record<string, string> = {
      "email.delivered": "delivered",
      "email.delivery_delayed": "sent",
      "email.bounced": "bounced",
      "email.complained": "bounced",
    };

    const normalizedStatus = STATUS_MAP[type];
    if (!normalizedStatus) return res.sendStatus(200);

    const [txn] = await db.select().from(transactions).where(eq(transactions.providerId, emailId)).limit(1);
    if (txn) {
      await db.update(transactions).set({
        status: normalizedStatus,
        deliveredAt: normalizedStatus === "delivered" ? new Date() : txn.deliveredAt,
      }).where(eq(transactions.id, txn.id));
    }
  } catch (err) {
    console.error("Resend email-status webhook error:", err);
  }

  res.sendStatus(200);
});

// ── Autopilot Engine ──────────────────────────────────────────────────────────
agentsRouter.get("/autopilot", (_req, res) => {
  res.json(getAutopilotStatus());
});

agentsRouter.post("/autopilot", (req, res) => {
  const { enabled } = req.body;
  if (enabled) startAutopilot(); else stopAutopilot();
  res.json(getAutopilotStatus());
});

agentsRouter.post("/autopilot/run", async (_req, res) => {
  try {
    const status = await runNow();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
