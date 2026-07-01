import { useListActivities } from "@workspace/api-client-react";
import { Activity, Zap, CheckCircle2, Search, Mail, Target, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function Activities() {
  const { data: activities, isLoading } = useListActivities({ limit: 100 });

  const getIcon = (type: string) => {
    switch(type) {
      case 'lead_discovered': return <Search className="w-4 h-4" />;
      case 'message_sent': return <Mail className="w-4 h-4" />;
      case 'reply_received': return <Zap className="w-4 h-4" />;
      case 'meeting_booked': return <Calendar className="w-4 h-4" />;
      case 'proposal_sent': return <FileText className="w-4 h-4" />;
      case 'deal_closed': return <CheckCircle2 className="w-4 h-4" />;
      case 'opportunity_found': return <Target className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="font-serif italic text-3xl font-bold tracking-tight text-white">Proof-of-Work Log</h2>
          <p className="text-sm text-muted-foreground">Chronological cryptographic record of agent actions.</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Syncing logs...</div>
        ) : activities?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No activities found.</div>
        ) : (
          <div className="divide-y divide-border/50">
            {activities?.map((act) => (
              <div key={act.id} className="p-4 hover:bg-accent/50 transition-colors flex gap-6">
                <div className="w-16 shrink-0 text-right pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {format(new Date(act.createdAt), 'HH:mm:ss')}
                  </span>
                </div>
                <div className="w-8 shrink-0 flex justify-center pt-1">
                  <div className="w-8 h-8 bg-accent/50 border border-border rounded-sm flex items-center justify-center text-muted-foreground">
                    {getIcon(act.type)}
                  </div>
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded-sm border border-primary/20">
                      {act.agentTeam}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      {act.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{act.description}</p>
                  {act.value && (
                    <div className="mt-2 text-xs font-mono text-primary">
                      Value: ${act.value.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
