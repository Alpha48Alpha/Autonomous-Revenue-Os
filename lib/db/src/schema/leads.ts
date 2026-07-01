import { pgTable, serial, text, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companies } from "./companies";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  title: text("title"),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  status: text("status").notNull().default("new"),
  score: integer("score").notNull().default(50),
  agentTeam: text("agent_team").notNull().default("research"),
  source: text("source"),
  notes: text("notes"),
  companyId: integer("company_id").references(() => companies.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
