import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  template: text("template").notNull(),
  sent: integer("sent").notNull().default(0),
  failed: integer("failed").notNull().default(0),
  skipped: integer("skipped").notNull().default(0),
  total: integer("total").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
});

export const campaignResults = pgTable("campaign_results", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  leadId: integer("lead_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  success: boolean("success").notNull().default(false),
  skipped: boolean("skipped").notNull().default(false),
  error: text("error"),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export const insertCampaignResultSchema = createInsertSchema(campaignResults).omit({ id: true });
export type InsertCampaignResult = z.infer<typeof insertCampaignResultSchema>;
export type CampaignResult = typeof campaignResults.$inferSelect;
