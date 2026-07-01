import { Router } from "express";
import { db, proposals } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListProposalsQueryParams,
  CreateProposalBody,
  GetProposalParams,
  UpdateProposalParams,
  UpdateProposalBody,
} from "@workspace/api-zod";

export const proposalsRouter = Router();

proposalsRouter.get("/", async (req, res) => {
  const query = ListProposalsQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Invalid query" });

  const filters: any[] = [];
  if (query.data.status) filters.push(eq(proposals.status, query.data.status));

  const rows = await db.select().from(proposals).where(filters.length ? and(...filters) : undefined).orderBy(proposals.createdAt);
  res.json(rows);
});

proposalsRouter.get("/:id", async (req, res) => {
  const params = GetProposalParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const [proposal] = await db.select().from(proposals).where(eq(proposals.id, params.data.id));
  if (!proposal) return res.status(404).json({ error: "Not found" });
  res.json(proposal);
});

proposalsRouter.post("/", async (req, res) => {
  const body = CreateProposalBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const [proposal] = await db.insert(proposals).values(body.data).returning();
  res.status(201).json(proposal);
});

proposalsRouter.patch("/:id", async (req, res) => {
  const params = UpdateProposalParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateProposalBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [proposal] = await db.update(proposals).set(body.data).where(eq(proposals.id, params.data.id)).returning();
  if (!proposal) return res.status(404).json({ error: "Not found" });
  res.json(proposal);
});
