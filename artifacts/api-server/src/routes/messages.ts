import { Router } from "express";
import { db, messages } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListMessagesQueryParams,
  CreateMessageBody,
  GetMessageParams,
  UpdateMessageParams,
  UpdateMessageBody,
} from "@workspace/api-zod";

export const messagesRouter = Router();

messagesRouter.get("/", async (req, res) => {
  const query = ListMessagesQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Invalid query" });

  const filters: any[] = [];
  if (query.data.status) filters.push(eq(messages.status, query.data.status));
  if (query.data.leadId) filters.push(eq(messages.leadId, query.data.leadId));

  const rows = await db.select().from(messages).where(filters.length ? and(...filters) : undefined).orderBy(messages.createdAt);
  res.json(rows);
});

messagesRouter.get("/stats", async (_req, res) => {
  const all = await db.select().from(messages);
  const sent = all.filter((m) => m.status !== "draft");
  const replied = all.filter((m) => m.status === "replied");
  const channels = ["email", "linkedin", "sms", "other"];
  const byChannel = channels.map((channel) => ({
    channel,
    sent: all.filter((m) => m.channel === channel && m.status !== "draft").length,
    replied: all.filter((m) => m.channel === channel && m.status === "replied").length,
  }));
  res.json({
    totalSent: sent.length,
    totalReplied: replied.length,
    replyRate: sent.length > 0 ? Math.round((replied.length / sent.length) * 100) / 100 : 0,
    byChannel,
  });
});

messagesRouter.get("/:id", async (req, res) => {
  const params = GetMessageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) return res.status(400).json({ error: "Invalid id" });
  const [msg] = await db.select().from(messages).where(eq(messages.id, params.data.id));
  if (!msg) return res.status(404).json({ error: "Not found" });
  res.json(msg);
});

messagesRouter.post("/", async (req, res) => {
  const body = CreateMessageBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const [msg] = await db.insert(messages).values(body.data).returning();
  res.status(201).json(msg);
});

messagesRouter.patch("/:id", async (req, res) => {
  const params = UpdateMessageParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateMessageBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid input" });
  const [msg] = await db.update(messages).set(body.data).where(eq(messages.id, params.data.id)).returning();
  if (!msg) return res.status(404).json({ error: "Not found" });
  res.json(msg);
});
