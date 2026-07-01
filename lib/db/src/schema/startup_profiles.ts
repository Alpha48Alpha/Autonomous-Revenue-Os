import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const startupProfiles = pgTable("startup_profiles", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  industry: text("industry").notNull(),
  targetMarket: text("target_market").notNull(),
  description: text("description").notNull(),
  valueProp: text("value_prop").notNull(),
  icp: text("icp").notNull(),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeSubscriptionStatus: text("stripe_subscription_status").default("none"),
  subscribedPlan: text("subscribed_plan").default("none"),
  paymentLinkGrowth: text("payment_link_growth"),
  paymentLinkScale: text("payment_link_scale"),
  paymentLinkEnterprise: text("payment_link_enterprise"),
  smsCampaignMessage: text("sms_campaign_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStartupProfileSchema = createInsertSchema(startupProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStartupProfile = z.infer<typeof insertStartupProfileSchema>;
export type StartupProfile = typeof startupProfiles.$inferSelect;
