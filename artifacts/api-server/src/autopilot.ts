/**
 * Autonomous Revenue OS — Autopilot Engine
 * Runs a background cycle every 2 hours:
 *  1. Generates fresh AI leads
 *  2. Sends SMS campaign to uncontacted leads
 *  3. Logs all activity
 */

import { db, leads, startupProfiles, messages, transactions, activities } from "@workspace/db";
import { eq, desc, and, isNotNull, ne } from "drizzle-orm";

const INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
const LEADS_PER_CYCLE = 5;
const SMS_PER_CYCLE = 10;

function buildDefaultCampaign(): string {
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  const pricingUrl = appUrl ? ` Or go to ${appUrl}/pricing to get started.` : "";
  return `{name}, the clients I work with don't chase income — they build systems that create it. If you're ready to put your business on autopilot, reply YES.${pricingUrl} — Elizabeth Rothchild`;
}

const DEFAULT_CAMPAIGN = buildDefaultCampaign();

interface AutopilotStatus {
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  totalLeadsGenerated: number;
  totalSmsSent: number;
  lastError: string | null;
  cycleCount: number;
}

const state: AutopilotStatus = {
  enabled: false,
  lastRun: null,
  nextRun: null,
  totalLeadsGenerated: 0,
  totalSmsSent: 0,
  lastError: null,
  cycleCount: 0,
};

let timer: ReturnType<typeof setInterval> | null = null;

function personalise(template: string, name: string): string {
  const first = (name || "").trim().split(/\s+/)[0] || "there";
  return template
    .replace(/\{\s*name\s*\}/gi, first)
    .replace(/\{\s*firstName\s*\}/gi, first)
    .replace(/\{\s*fullName\s*\}/gi, name || first);
}

async function generateLeads(profile: typeof startupProfiles.$inferSelect) {
  const OpenAI = (await import("openai")).default;
  // Works on any platform: standard OPENAI_API_KEY, or Replit AI integration proxy
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";
  if (!apiKey) throw new Error("OpenAI API key not configured — set OPENAI_API_KEY");
  const openai = new OpenAI({ baseURL, apiKey });

  const prompt = `Generate ${LEADS_PER_CYCLE} realistic B2B leads for outreach.
Company context: ${profile.companyName} — ${profile.valueProp}
Target: ${profile.icp || profile.targetMarket}

Return a JSON array only. Each object: name, email, company, title, phone (US +1-format), linkedinUrl, score (60-95), notes (1 sentence why they fit).`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2048,
    messages: [
      { role: "system", content: "You are a B2B lead generation AI. Return only valid JSON arrays." },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "[]";
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return 0;

  const generated: any[] = JSON.parse(match[0]);
  let count = 0;
  for (const lead of generated) {
    try {
      await db.insert(leads).values({
        name: lead.name || "Unknown",
        email: lead.email || null,
        company: lead.company || null,
        title: lead.title || null,
        phone: lead.phone || null,
        linkedinUrl: lead.linkedinUrl || null,
        score: lead.score || 70,
        source: "Autopilot",
        notes: lead.notes || null,
        agentTeam: "research",
        status: "new",
      });
      count++;
    } catch { /* skip duplicates */ }
  }

  if (count > 0) {
    await db.insert(activities).values({
      agentTeam: "research",
      type: "leads_generated",
      description: `Autopilot generated ${count} new leads from AI discovery cycle`,
    });
  }

  return count;
}

async function sendSmsOutreach(profile: typeof startupProfiles.$inferSelect) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !fromNumber) return 0;

  const template =
    (profile.smsCampaignMessage && profile.smsCampaignMessage.trim()) || DEFAULT_CAMPAIGN;

  // Get uncontacted leads with phone numbers
  const uncontacted = await db
    .select()
    .from(leads)
    .where(
      and(
        isNotNull(leads.phone),
        ne(leads.status, "contacted"),
        ne(leads.status, "qualified"),
        ne(leads.status, "converted"),
      )
    )
    .orderBy(desc(leads.score))
    .limit(SMS_PER_CYCLE);

  if (uncontacted.length === 0) return 0;

  const twilio = (await import("twilio")).default;
  const client = twilio(accountSid, authToken);
  let sent = 0;

  for (const lead of uncontacted) {
    if (!lead.phone) continue;
    const body = personalise(template, lead.name || "there");

    try {
      const result = await client.messages.create({ body, from: fromNumber, to: lead.phone });

      await db.insert(messages).values({
        subject: "SMS",
        body,
        channel: "sms",
        status: "sent",
        leadId: lead.id,
        agentTeam: "outreach",
        sentAt: new Date(),
      });

      await db.insert(transactions).values({
        type: "sms",
        provider: "twilio",
        status: "sent",
        providerId: result.sid,
        leadId: lead.id,
        recipient: lead.phone,
        body,
        cost: 0.0075,
      });

      await db.update(leads)
        .set({ status: "contacted", updatedAt: new Date() })
        .where(eq(leads.id, lead.id));

      sent++;
    } catch (err: any) {
      await db.insert(activities).values({
        agentTeam: "outreach",
        type: "message_failed",
        description: `Autopilot SMS failed to ${lead.name}: ${err.message}`,
        relatedEntityType: "lead",
        relatedEntityId: lead.id,
      });
    }
  }

  if (sent > 0) {
    await db.insert(activities).values({
      agentTeam: "outreach",
      type: "bulk_sms_sent",
      description: `Autopilot sent ${sent} SMS messages to uncontacted leads`,
    });
  }

  return sent;
}

async function runCycle() {
  state.lastRun = new Date().toISOString();
  state.nextRun = new Date(Date.now() + INTERVAL_MS).toISOString();
  state.cycleCount++;
  state.lastError = null;

  try {
    const [profile] = await db
      .select()
      .from(startupProfiles)
      .orderBy(desc(startupProfiles.createdAt))
      .limit(1);

    if (!profile) {
      state.lastError = "No company profile configured — go to Setup first";
      return;
    }

    await db.insert(activities).values({
      agentTeam: "strategy",
      type: "autopilot_cycle",
      description: `Autopilot cycle #${state.cycleCount} started — generating leads and sending outreach`,
    });

    const [newLeads, smsSent] = await Promise.allSettled([
      generateLeads(profile),
      sendSmsOutreach(profile),
    ]);

    const leadsCount = newLeads.status === "fulfilled" ? newLeads.value : 0;
    const smsCount = smsSent.status === "fulfilled" ? smsSent.value : 0;

    if (newLeads.status === "rejected") state.lastError = String(newLeads.reason);
    if (smsSent.status === "rejected") state.lastError = String(smsSent.reason);

    state.totalLeadsGenerated += leadsCount;
    state.totalSmsSent += smsCount;

    await db.insert(activities).values({
      agentTeam: "strategy",
      type: "autopilot_cycle",
      description: `Autopilot cycle #${state.cycleCount} complete — ${leadsCount} leads found, ${smsCount} messages sent`,
    });
  } catch (err: any) {
    state.lastError = err.message;
    console.error("[Autopilot] Cycle error:", err.message);
  }
}

export function startAutopilot() {
  if (timer) return;
  state.enabled = true;
  state.nextRun = new Date(Date.now() + 30_000).toISOString(); // first run in 30s
  console.log("[Autopilot] Started — first cycle in 30 seconds, then every 2 hours");

  // First run after 30 seconds so server is fully ready
  setTimeout(() => {
    runCycle().catch(console.error);
    timer = setInterval(() => runCycle().catch(console.error), INTERVAL_MS);
  }, 30_000);
}

export function stopAutopilot() {
  state.enabled = false;
  state.nextRun = null;
  if (timer) { clearInterval(timer); timer = null; }
  console.log("[Autopilot] Stopped");
}

export function getAutopilotStatus(): AutopilotStatus {
  return { ...state };
}

export async function runNow() {
  await runCycle();
  return getAutopilotStatus();
}
