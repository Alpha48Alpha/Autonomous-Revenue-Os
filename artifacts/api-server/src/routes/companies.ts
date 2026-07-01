import { Router } from "express";
import { db, leads, deals, companies } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateCompanyBody,
  GetCompanyParams,
  UpdateCompanyParams,
  UpdateCompanyBody,
  DeleteCompanyParams,
} from "@workspace/api-zod";

export const companiesRouter = Router();

companiesRouter.get("/", async (_req, res) => {
  const rows = await db.select().from(companies).orderBy(companies.createdAt);
  const allLeads = await db.select({ id: leads.id, companyId: leads.companyId }).from(leads);
  const allDeals = await db.select({ id: deals.id, companyId: deals.companyId }).from(deals);
  const result = rows.map((c) => ({
    ...c,
    leadCount: allLeads.filter((l) => l.companyId === c.id).length,
    dealCount: allDeals.filter((d) => d.companyId === c.id).length,
  }));
  res.json(result);
});

companiesRouter.get("/:id", async (req, res) => {
  const params = GetCompanyParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const [company] = await db.select().from(companies).where(eq(companies.id, params.data.id));
  if (!company) return res.status(404).json({ error: "Not found" });
  const leadCount = (await db.select().from(leads).where(eq(leads.companyId, company.id))).length;
  const dealCount = (await db.select().from(deals).where(eq(deals.companyId, company.id))).length;
  res.json({ ...company, leadCount, dealCount });
});

companiesRouter.post("/", async (req, res) => {
  const body = CreateCompanyBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const [company] = await db.insert(companies).values(body.data).returning();
  res.status(201).json({ ...company, leadCount: 0, dealCount: 0 });
});

companiesRouter.patch("/:id", async (req, res) => {
  const params = UpdateCompanyParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateCompanyBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [company] = await db.update(companies).set(body.data).where(eq(companies.id, params.data.id)).returning();
  if (!company) return res.status(404).json({ error: "Not found" });
  const leadCount = (await db.select().from(leads).where(eq(leads.companyId, company.id))).length;
  const dealCount = (await db.select().from(deals).where(eq(deals.companyId, company.id))).length;
  res.json({ ...company, leadCount, dealCount });
});

companiesRouter.delete("/:id", async (req, res) => {
  const params = DeleteCompanyParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(companies).where(eq(companies.id, params.data.id));
  res.status(204).send();
});
