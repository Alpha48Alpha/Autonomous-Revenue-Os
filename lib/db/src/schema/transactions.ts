import { pgTable, serial, text, integer, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leads } from "./leads";
import { messages } from "./messages";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("pending"),
  providerId: text("provider_id"),
  leadId: integer("lead_id").references(() => leads.id),
  messageId: integer("message_id").references(() => messages.id),
  recipient: text("recipient").notNull(),
  subject: text("subject"),
  body: text("body"),
  cost: real("cost"),
  metadata: jsonb("metadata"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
