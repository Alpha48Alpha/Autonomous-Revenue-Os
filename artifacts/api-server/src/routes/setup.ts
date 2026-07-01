import { Router } from "express";
import { db, startupProfiles } from "@workspace/db";
import { desc } from "drizzle-orm";

export const setupRouter = Router();

setupRouter.get("/", async (_req, res) => {
  const [profile] = await db.select().from(startupProfiles).orderBy(desc(startupProfiles.createdAt)).limit(1);
  if (!profile) return res.status(200).json(null);
  res.json(profile);
});

setupRouter.post("/", async (req, res) => {
  const { companyName, industry, targetMarket, description, valueProp, icp, website, linkedinUrl } = req.body;
  if (!companyName || !industry || !targetMarket || !description || !valueProp || !icp) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existing = await db.select().from(startupProfiles).limit(1);
  if (existing.length > 0) {
    const { eq } = await import("drizzle-orm");
    const [updated] = await db
      .update(startupProfiles)
      .set({ companyName, industry, targetMarket, description, valueProp, icp, website, linkedinUrl, updatedAt: new Date() })
      .where(eq(startupProfiles.id, existing[0].id))
      .returning();
    return res.json(updated);
  }

  const [profile] = await db.insert(startupProfiles).values({ companyName, industry, targetMarket, description, valueProp, icp, website, linkedinUrl }).returning();
  res.json(profile);
});
