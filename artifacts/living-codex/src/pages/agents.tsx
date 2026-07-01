import { useGetProofOfWork } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, ShieldAlert, Zap, Network } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Agents() {
  const { data: pow, isLoading } = useGetProofOfWork();

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 bg-card rounded-sm" />)}
    </div>;
  }

  const agents = [
    {
      team: "Research",
      role: "Lead Generation & Intelligence",
      govLevel: "L0 AUTO",
      status: "ACTIVE",
      metrics: [
        { label: "Leads Discovered", value: pow?.discovery.leadsDiscovered },
        { label: "Source Quality", value: `${pow?.discovery.sourceQuality}%` }
      ]
    },
    {
      team: "Opportunity",
      role: "Qualification & Scoring",
      govLevel: "L0 AUTO",
      status: "ACTIVE",
      metrics: [
        { label: "Opps Found", value: pow?.discovery.opportunitiesFound }
      ]
    },
    {
      team: "Outreach",
      role: "Messaging & Follow-ups",
      govLevel: "L1 REVIEW",
      status: "ACTIVE",
      metrics: [
        { label: "Messages Sent", value: pow?.outreach.messagesSent },
        { label: "Reply Rate", value: `${pow?.outreach.replyRate}%` }
      ]
    },
    {
      team: "Sales",
      role: "Negotiation & Closing",
      govLevel: "L2 AUTH",
      status: "STANDBY",
      metrics: [
        { label: "Meetings Booked", value: pow?.revenue.meetingsBooked },
        { label: "Deals Won", value: pow?.revenue.dealsWon }
      ]
    },
    {
      team: "CRM",
      role: "Data Enrichment & Logging",
      govLevel: "L0 AUTO",
      status: "ACTIVE",
      metrics: [
        { label: "Total Activities", value: pow?.overall.totalActivities }
      ]
    },
    {
      team: "Strategy",
      role: "Campaign Optimization",
      govLevel: "L1 REVIEW",
      status: "ANALYZING",
      metrics: [
        { label: "Phase", value: pow?.overall.phase }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-light tracking-tight">Agent Command</h2>
          <p className="text-sm text-muted-foreground">Manage and govern autonomous agent teams.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-sm text-xs font-mono text-primary">
          <Network className="w-4 h-4" />
          {pow?.overall.activeAgents} AGENTS ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.team} className="bg-card border-border/50 rounded-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className={`absolute top-0 left-0 w-full h-1 ${agent.status === 'ACTIVE' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-light tracking-tight flex items-center gap-2">
                    <Cpu className={`w-5 h-5 ${agent.status === 'ACTIVE' ? 'text-primary' : 'text-muted-foreground'}`} />
                    {agent.team}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{agent.role}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${agent.status === 'ACTIVE' ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-muted-foreground border-border bg-accent'}`}>
                    {agent.status}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                    <ShieldAlert className="w-3 h-3" />
                    {agent.govLevel}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agent.metrics.map(m => (
                  <div key={m.label} className="flex justify-between items-end border-b border-border/50 pb-2 last:border-0">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{m.label}</span>
                    <span className="text-lg font-light">{m.value !== undefined ? m.value : '-'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
