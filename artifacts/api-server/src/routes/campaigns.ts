import { Router } from "express";
import { db, leads, messages, startupProfiles, campaigns, campaignResults } from "@workspace/db";
import { isNotNull, desc, and, eq, gte } from "drizzle-orm";
import { randomUUID } from "crypto";

export const campaignsRouter = Router();

const DEFAULT_SMS_CAMPAIGN =
  "{name}, imagine waking up to income that worked all night without you. Autonomous Revenue OS is the AI that runs your money on autopilot — and the ones who move first are already pulling ahead. This door won't stay open long. Tap in before it closes 👉 [PASTE YOUR LINK]. Reply STOP to opt out.";

const DEFAULT_COOLDOWN_DAYS = 7;

function personalizeMessage(template: string, name: string): string {
  const firstName = name.split(" ")[0] || name;
  return template
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{name\}/g, firstName)
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{firstName\}/g, firstName)
    .replace(/\{\{fullName\}\}/g, name)
    .replace(/\{fullName\}/g, name);
}

type JobStatus = "pending" | "running" | "done" | "error";
interface JobResult {
  leadId: number;
  name: string;
  phone: string | null;
  success: boolean;
  skipped: boolean;
  alreadyContacted: boolean;
  error: string | null;
}

interface Job {
  id: string;
  campaignDbId?: number;
  status: JobStatus;
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  alreadyContacted: number;
  processed: number;
  cooldownDays: number;
  results: JobResult[];
  startedAt: string;
  finishedAt?: string;
}

const jobs = new Map<string, Job>();

async function runCampaignJob(jobId: string, template: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = "running";

  try {
    const allLeads = await db.select().from(leads);

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    const useTwilio = !!(accountSid && authToken && fromNumber);

    const cooldownMs = job.cooldownDays * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - cooldownMs);

    job.total = allLeads.length;

    for (const lead of allLeads) {
      if (!lead.phone) {
        job.results.push({ leadId: lead.id, name: lead.name, phone: null, success: false, skipped: true, alreadyContacted: false, error: null });
        job.skipped++;
        job.processed++;
        continue;
      }

      const recentMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .where(
          and(
            eq(messages.leadId, lead.id),
            eq(messages.channel, "sms"),
            gte(messages.sentAt, cutoff)
          )
        )
        .limit(1);

      if (recentMessages.length > 0) {
        job.results.push({ leadId: lead.id, name: lead.name, phone: lead.phone, success: false, skipped: false, alreadyContacted: true, error: null });
        job.alreadyContacted++;
        job.processed++;
        continue;
      }

      const body = personalizeMessage(template, lead.name);
      let success = false;
      let errorMsg: string | null = null;

      if (useTwilio) {
        try {
          const twilio = (await import("twilio")).default;
          const client = twilio(accountSid!, authToken!);
          await client.messages.create({ to: lead.phone, from: fromNumber!, body });
          success = true;
        } catch (err: any) {
          errorMsg = err.message || "Twilio error";
        }
      } else {
        success = true;
      }

      if (success) {
        job.sent++;
        await db.insert(messages).values({
          subject: "SMS Campaign",
          body,
          status: "sent",
          channel: "sms",
          leadId: lead.id,
          sentAt: new Date(),
        });
      } else {
        job.failed++;
      }
      job.processed++;

      job.results.push({ leadId: lead.id, name: lead.name, phone: lead.phone, success, skipped: false, alreadyContacted: false, error: errorMsg });

      await new Promise((r) => setTimeout(r, 250));
    }

    job.status = "done";
    job.finishedAt = new Date().toISOString();

    const [saved] = await db.insert(campaigns).values({
      template,
      sent: job.sent,
      failed: job.failed,
      skipped: job.skipped,
      total: job.total,
      startedAt: new Date(job.startedAt),
      finishedAt: new Date(job.finishedAt),
    }).returning();

    job.campaignDbId = saved.id;

    if (job.results.length > 0) {
      await db.insert(campaignResults).values(
        job.results.map((r) => ({
          campaignId: saved.id,
          leadId: r.leadId,
          name: r.name,
          phone: r.phone ?? null,
          success: r.success,
          skipped: r.skipped,
          error: r.error ?? null,
        }))
      );
    }
  } catch (err: any) {
    job.status = "error";
    job.finishedAt = new Date().toISOString();
  }
}

campaignsRouter.post("/sms", async (req, res) => {
  const raw = typeof req.body?.template === "string" ? req.body.template.trim() : "";
  const template = raw || DEFAULT_SMS_CAMPAIGN;

  const cooldownDays = typeof req.body?.cooldownDays === "number" && req.body.cooldownDays > 0
    ? Math.floor(req.body.cooldownDays)
    : DEFAULT_COOLDOWN_DAYS;

  const allLeads = await db.select({ id: leads.id }).from(leads);
  const withPhone = await db.select({ id: leads.id }).from(leads).where(isNotNull(leads.phone));

  const jobId = randomUUID();
  const job: Job = {
    id: jobId,
    status: "pending",
    total: allLeads.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    alreadyContacted: 0,
    processed: 0,
    cooldownDays,
    results: [],
    startedAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);

  runCampaignJob(jobId, template).catch(() => {});

  res.json({ jobId, total: allLeads.length, withPhone: withPhone.length });
});

campaignsRouter.get("/sms/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

campaignsRouter.get("/sms-preview", async (_req, res) => {
  const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  const template = profile?.smsCampaignMessage?.trim() || DEFAULT_SMS_CAMPAIGN;
  const [firstLead] = await db.select().from(leads).limit(1);
  const withPhone = await db.select({ id: leads.id }).from(leads).where(isNotNull(leads.phone));
  const total = await db.select({ id: leads.id }).from(leads);
  res.json({
    template,
    previewName: firstLead?.name || "Alex",
    totalContacts: total.length,
    withPhone: withPhone.length,
    defaultCooldownDays: DEFAULT_COOLDOWN_DAYS,
  });
});

campaignsRouter.get("/history", async (_req, res) => {
  const history = await db
    .select()
    .from(campaigns)
    .orderBy(desc(campaigns.startedAt))
    .limit(50);
  res.json(history);
});

campaignsRouter.post("/sms-status", (req, res) => {
  res.sendStatus(200);
});

campaignsRouter.get("/history/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });

  const results = await db
    .select()
    .from(campaignResults)
    .where(eq(campaignResults.campaignId, id));

  res.json({ ...campaign, results });
});
