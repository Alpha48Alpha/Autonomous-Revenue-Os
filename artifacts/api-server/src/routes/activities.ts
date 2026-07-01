import { Router } from "express";
import { db, activities, messages, leads, deals, proposals } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import {
  ListActivitiesQueryParams,
  CreateActivityBody,
} from "@workspace/api-zod";

export const activitiesRouter = Router();

activitiesRouter.get("/", async (req, res) => {
  const query = ListActivitiesQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Invalid query" });

  const filters: any[] = [];
  if (query.data.agentTeam) filters.push(eq(activities.agentTeam, query.data.agentTeam));
  const limit = query.data.limit ?? 50;

  const rows = await db
    .select()
    .from(activities)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(activities.createdAt))
    .limit(limit);
  res.json(rows);
});

activitiesRouter.get("/proof-of-work", async (_req, res) => {
  const all = await db.select().from(activities);
  const allMessages = await db.select().from(messages);
  const allLeads = await db.select().from(leads);
  const allDeals = await db.select().from(deals);
  const allProposals = await db.select().from(proposals);

  const sent = allMessages.filter((m) => m.status !== "draft");
  const replied = allMessages.filter((m) => m.status === "replied");
  const closedWon = allDeals.filter((d) => d.stage === "closed_won");
  const proposalsSent = allProposals.filter((p) => p.status !== "draft");
  const meetingActivities = all.filter((a) => a.type === "meeting_booked");

  const agentTeams = ["research", "opportunity", "outreach", "sales", "crm", "strategy", "revenue_ops"];
  const activeAgents = new Set(all.map((a) => a.agentTeam)).size;

  const totalRevenue = closedWon.reduce((s, d) => s + (d.value ?? 0), 0);
  const sourceQuality = allLeads.length > 0
    ? Math.round((allLeads.filter((l) => l.score >= 60).length / allLeads.length) * 100) / 100
    : 0;

  const phase = totalRevenue > 50000 ? "Phase 3" : totalRevenue > 0 ? "Phase 2" : "Phase 1";

  res.json({
    discovery: {
      leadsDiscovered: allLeads.length,
      opportunitiesFound: all.filter((a) => a.type === "opportunity_found").length,
      sourceQuality,
    },
    revenue: {
      meetingsBooked: meetingActivities.length,
      proposalsSent: proposalsSent.length,
      dealsWon: closedWon.length,
      revenueGenerated: totalRevenue,
    },
    outreach: {
      messagesSent: sent.length,
      repliesReceived: replied.length,
      replyRate: sent.length > 0 ? Math.round((replied.length / sent.length) * 100) / 100 : 0,
    },
    overall: {
      totalActivities: all.length,
      activeAgents,
      phase,
    },
  });
});

activitiesRouter.post("/", async (req, res) => {
  const body = CreateActivityBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.message });
  const [activity] = await db.insert(activities).values(body.data).returning();
  res.status(201).json(activity);
});
