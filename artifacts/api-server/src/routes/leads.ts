import { Router } from "express";
import { db, leads } from "@workspace/db";
import { eq, sql, and, ilike, or } from "drizzle-orm";
import {
  ListLeadsQueryParams,
  CreateLeadBody,
  UpdateLeadParams,
  UpdateLeadBody,
  DeleteLeadParams,
  GetLeadParams,
} from "@workspace/api-zod";

export const leadsRouter = Router();

// Normalize a raw US phone string to E.164 (+1XXXXXXXXXX). Returns null if invalid.
function normalizeUsPhone(raw: string): string | null {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

leadsRouter.get("/", async (req, res) => {
  const query = ListLeadsQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Invalid query params" });

  const { status, agentTeam, search } = query.data;
  const filters: any[] = [];
  if (status) filters.push(eq(leads.status, status));
  if (agentTeam) filters.push(eq(leads.agentTeam, agentTeam));
  if (search) filters.push(or(ilike(leads.name, `%${search}%`), ilike(leads.email, `%${search}%`), ilike(leads.company, `%${search}%`)));

  const rows = await db.select().from(leads).where(filters.length ? and(...filters) : undefined).orderBy(leads.createdAt);
  res.json(rows);
});

leadsRouter.get("/summary", async (_req, res) => {
  const all = await db.select().from(leads);
  const byStatus = ["new", "contacted", "qualified", "disqualified", "converted"].map((s) => ({
    status: s,
    count: all.filter((l) => l.status === s).length,
  }));
  const hot = all.filter((l) => l.score >= 70).length;
  const warm = all.filter((l) => l.score >= 40 && l.score < 70).length;
  const cold = all.filter((l) => l.score < 40).length;
  const totalPipelineValue = all.filter((l) => l.status === "qualified").length * 5000;

  res.json({ total: all.length, byStatus, byScore: { hot, warm, cold }, totalPipelineValue });
});

leadsRouter.post("/import", async (req, res) => {
  const contacts = req.body?.contacts;
  const source = typeof req.body?.source === "string" && req.body.source ? req.body.source : "import";
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: "contacts must be a non-empty array" });
  }
  if (contacts.length > 2000) {
    return res.status(400).json({ error: "Too many contacts in one import (max 2000). Split into smaller batches." });
  }

  // Existing phones to dedupe against.
  const existing = await db.select({ phone: leads.phone }).from(leads);
  const seen = new Set(existing.map((r) => r.phone).filter((p): p is string => !!p));

  const failures: { name: string; phone: string | null; reason: string }[] = [];
  const toInsert: { name: string; phone: string; email: string | null; source: string }[] = [];
  let skipped = 0;

  for (const c of contacts) {
    const name = typeof c?.name === "string" ? c.name.trim() : "";
    const rawPhone = typeof c?.phone === "string" ? c.phone.trim() : "";
    const email = typeof c?.email === "string" && c.email.trim() ? c.email.trim() : null;

    if (!name) {
      failures.push({ name: name || "(unnamed)", phone: rawPhone || null, reason: "Missing name" });
      continue;
    }
    const phone = normalizeUsPhone(rawPhone);
    if (!phone) {
      failures.push({ name, phone: rawPhone || null, reason: "Invalid phone number" });
      continue;
    }
    if (seen.has(phone)) {
      skipped++;
      continue;
    }
    seen.add(phone);
    toInsert.push({ name, phone, email, source });
  }

  let added = 0;
  if (toInsert.length) {
    const inserted = await db
      .insert(leads)
      .values(toInsert.map((c) => ({ name: c.name, phone: c.phone, email: c.email, source: c.source })))
      .returning({ id: leads.id });
    added = inserted.length;
  }

  res.json({
    total: contacts.length,
    added,
    skipped,
    failed: failures.length,
    failures,
  });
});

leadsRouter.get("/:id", async (req, res) => {
  const params = GetLeadParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const [lead] = await db.select().from(leads).where(eq(leads.id, params.data.id));
  if (!lead) return res.status(404).json({ error: "Not found" });
  res.json(lead);
});

leadsRouter.post("/", async (req, res) => {
  const body = CreateLeadBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const [lead] = await db.insert(leads).values(body.data).returning();
  res.status(201).json(lead);
});

leadsRouter.patch("/:id", async (req, res) => {
  const params = UpdateLeadParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateLeadBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [lead] = await db.update(leads).set({ ...body.data, updatedAt: new Date() }).where(eq(leads.id, params.data.id)).returning();
  if (!lead) return res.status(404).json({ error: "Not found" });
  res.json(lead);
});

leadsRouter.delete("/:id", async (req, res) => {
  const params = DeleteLeadParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(leads).where(eq(leads.id, params.data.id));
  res.status(204).send();
});
