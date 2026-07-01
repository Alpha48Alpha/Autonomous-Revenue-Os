import { pgTable, serial, text, integer, timestamp, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { leads } from "./leads";
import { companies } from "./companies";

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  stage: text("stage").notNull().default("discovery"),
  value: real("value").notNull().default(0),
  probability: integer("probability").notNull().default(25),
  expectedCloseDate: date("expected_close_date"),
  leadId: integer("lead_id").references(() => leads.id),
  companyId: integer("company_id").references(() => companies.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;
