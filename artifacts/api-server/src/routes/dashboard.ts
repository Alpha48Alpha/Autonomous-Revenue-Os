import { Router } from "express";
import { db, leads, deals, messages, activities, proposals } from "@workspace/db";
import { desc } from "drizzle-orm";

export const dashboardRouter = Router();

dashboardRouter.get("/metrics", async (_req, res) => {
  const allLeads = await db.select().from(leads);
  const allDeals = await db.select().from(deals);
  const allMessages = await db.select().from(messages);
  const allActivities = await db.select().from(activities);

  const closedWon = allDeals.filter((d) => d.stage === "closed_won");
  const closedWonValue = closedWon.reduce((s, d) => s + (d.value ?? 0), 0);
  const totalPipeline = allDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const weightedPipeline = allDeals.reduce((s, d) => s + ((d.value ?? 0) * (d.probability ?? 0)) / 100, 0);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = allLeads.filter((l) => new Date(l.createdAt) >= weekAgo).length;
  const qualifiedLeads = allLeads.filter((l) => l.status === "qualified" || l.status === "converted");
  const qualifiedRate = allLeads.length > 0 ? Math.round((qualifiedLeads.length / allLeads.length) * 100) / 100 : 0;
  const hotLeads = allLeads.filter((l) => l.score >= 70).length;

  const sentMessages = allMessages.filter((m) => m.status !== "draft");
  const repliedMessages = allMessages.filter((m) => m.status === "replied");
  const replyRate = sentMessages.length > 0 ? Math.round((repliedMessages.length / sentMessages.length) * 100) / 100 : 0;
  const meetingsBooked = allActivities.filter((a) => a.type === "meeting_booked").length;

  const agentTeamCounts: Record<string, number> = {};
  for (const a of allActivities) {
    agentTeamCounts[a.agentTeam] = (agentTeamCounts[a.agentTeam] ?? 0) + 1;
  }
  const topPerformer = Object.entries(agentTeamCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "research";
  const activeAgents = new Set(allActivities.map((a) => a.agentTeam)).size;
  const conversionRate = allLeads.length > 0
    ? Math.round((allLeads.filter((l) => l.status === "converted").length / allLeads.length) * 100) / 100
    : 0;

  res.json({
    revenue: {
      closedWon: closedWonValue,
      target: 100000,
      growth: 12.4,
    },
    pipeline: {
      totalValue: totalPipeline,
      weightedValue: weightedPipeline,
      dealCount: allDeals.length,
      conversionRate,
    },
    leads: {
      total: allLeads.length,
      newThisWeek,
      qualifiedRate,
      hotLeads,
    },
    outreach: {
      sent: sentMessages.length,
      replyRate,
      meetingsBooked,
    },
    agents: {
      active: activeAgents,
      totalActivities: allActivities.length,
      topPerformer,
    },
  });
});

dashboardRouter.get("/recent-activity", async (_req, res) => {
  const rows = await db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(20);
  res.json(rows);
});
