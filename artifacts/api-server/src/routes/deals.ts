import { Router } from "express";
import { db, deals } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListDealsQueryParams,
  CreateDealBody,
  GetDealParams,
  UpdateDealParams,
  UpdateDealBody,
  DeleteDealParams,
} from "@workspace/api-zod";

export const dealsRouter = Router();

const STAGES = ["discovery", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];

dealsRouter.get("/", async (req, res) => {
  const query = ListDealsQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Invalid query" });

  const filters: any[] = [];
  if (query.data.stage) filters.push(eq(deals.stage, query.data.stage));

  const rows = await db.select().from(deals).where(filters.length ? and(...filters) : undefined).orderBy(deals.createdAt);
  res.json(rows);
});

dealsRouter.get("/pipeline", async (_req, res) => {
  const all = await db.select().from(deals);
  const totalValue = all.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const weightedValue = all.reduce((sum, d) => sum + ((d.value ?? 0) * (d.probability ?? 0)) / 100, 0);
  const closedWonValue = all.filter((d) => d.stage === "closed_won").reduce((sum, d) => sum + (d.value ?? 0), 0);
  const stages = STAGES.map((stage) => {
    const stageDeals = all.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  });
  res.json({ totalValue, weightedValue, closedWonValue, stages });
});

dealsRouter.get("/:id", async (req, res) => {
  const params = GetDealParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const [deal] = await db.select().from(deals).where(eq(deals.id, params.data.id));
  if (!deal) return res.status(404).json({ error: "Not found" });
  res.json(deal);
});

dealsRouter.post("/", async (req, res) => {
  const body = CreateDealBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const [deal] = await db.insert(deals).values(body.data).returning();
  res.status(201).json(deal);
});

dealsRouter.patch("/:id", async (req, res) => {
  const params = UpdateDealParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateDealBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [deal] = await db.update(deals).set({ ...body.data, updatedAt: new Date() }).where(eq(deals.id, params.data.id)).returning();
  if (!deal) return res.status(404).json({ error: "Not found" });
  res.json(deal);
});

dealsRouter.delete("/:id", async (req, res) => {
  const params = DeleteDealParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  await db.delete(deals).where(eq(deals.id, params.data.id));
  res.status(204).send();
});
