import { Router } from "express";
import { db, transactions } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

export const transactionsRouter = Router();

transactionsRouter.get("/", async (req, res) => {
  const { type, status } = req.query as { type?: string; status?: string };
  const filters: any[] = [];
  if (type) filters.push(eq(transactions.type, type));
  if (status) filters.push(eq(transactions.status, status));

  const rows = await db
    .select()
    .from(transactions)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(transactions.createdAt));
  res.json(rows);
});
