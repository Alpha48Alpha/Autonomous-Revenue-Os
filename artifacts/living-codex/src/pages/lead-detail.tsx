import { useGetLead } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBadge } from "@/components/shared/score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Building2, Mail, Phone, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function LeadDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { data: lead, isLoading } = useGetLead(id, { query: { enabled: !!id, queryKey: ['lead', id] } });

  if (isLoading) {
    return <div className="space-y-8 p-8 animate-pulse max-w-4xl mx-auto">
      <Skeleton className="h-10 w-32 bg-card rounded-sm" />
      <Skeleton className="h-64 w-full bg-card rounded-sm" />
    </div>;
  }

  if (!lead) {
    return <div className="p-8 text-center text-muted-foreground">Target not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/leads">
          <Button variant="outline" size="icon" className="rounded-sm w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h2 className="text-2xl font-light tracking-tight">Target Profile</h2>
          <p className="text-sm text-muted-foreground font-mono text-[10px] uppercase tracking-wider">ID: {lead.id.toString().padStart(5, '0')} // INTEL GATHERED BY: {lead.agentTeam}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card border-border/50 rounded-sm">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent border border-border rounded-sm flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-light tracking-tight">{lead.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{lead.title || "Unknown Title"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={lead.status} />
                <ScoreBadge score={lead.score} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {lead.email
                    ? <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                    : <span className="text-muted-foreground">No email</span>}
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {lead.linkedinUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <a href={lead.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline text-primary">LinkedIn Profile</a>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {lead.company && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{lead.company}</span>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Source</span>
                  <p className="text-sm">{lead.source || "Autonomous Discovery"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Discovered</span>
                  <p className="text-sm font-mono">{format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                </div>
              </div>
            </div>

            {lead.notes && (
              <div className="pt-6 border-t border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">Agent Notes</span>
                <p className="text-sm leading-relaxed text-muted-foreground bg-accent/30 p-4 rounded-sm border border-border/50">
                  {lead.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-sm h-fit">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-sm font-mono tracking-widest text-muted-foreground uppercase">Action Intel</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <div className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <span className="text-xs font-mono text-primary block mb-1">COMMAND:</span>
                <span className="text-sm">Initiate Outreach Sequence</span>
              </div>
              <div className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                <span className="text-xs font-mono text-primary block mb-1">COMMAND:</span>
                <span className="text-sm">Generate Proposal</span>
              </div>
              <div className="p-4 hover:bg-accent/50 transition-colors cursor-pointer text-destructive">
                <span className="text-xs font-mono text-destructive block mb-1">COMMAND:</span>
                <span className="text-sm">Disqualify Target</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
