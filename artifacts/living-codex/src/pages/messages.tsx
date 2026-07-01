import { useListMessages, useGetMessageStats } from "@workspace/api-client-react";
import { MetricCard } from "@/components/shared/metric-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Mail, MessageSquare, Smartphone, Send, Reply, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Messages() {
  const { data: stats, isLoading: statsLoading } = useGetMessageStats();
  const { data: messages, isLoading: messagesLoading } = useListMessages();

  if (statsLoading || messagesLoading) {
    return <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card rounded-sm" />)}
      </div>
    </div>;
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'linkedin': return <MessageSquare className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      default: return <Send className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-light tracking-tight">Outreach Center</h2>
          <p className="text-sm text-muted-foreground">Autonomous communication logs and reply analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="Total Sent" 
          value={stats?.totalSent || 0}
          icon={Send}
        />
        <MetricCard 
          title="Total Replied" 
          value={stats?.totalReplied || 0}
          icon={Reply}
        />
        <MetricCard 
          title="Reply Rate" 
          value={`${stats?.replyRate || 0}%`}
          icon={Zap}
        />
      </div>

      <div className="border border-border/50 rounded-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-mono text-[10px] uppercase tracking-wider w-16">Ch</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Subject</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Agent</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Sent At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No outreach activity found.</TableCell>
              </TableRow>
            ) : (
              messages?.map((msg) => (
                <TableRow key={msg.id} className="group border-border/50 hover:bg-accent/50 cursor-pointer">
                  <TableCell>
                    <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm text-muted-foreground">
                      {getChannelIcon(msg.channel)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{msg.subject}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-md">{msg.body}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={msg.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-mono uppercase bg-accent px-1.5 py-0.5 rounded-sm border border-border/50">
                      {msg.agentTeam}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {msg.sentAt ? format(new Date(msg.sentAt), 'MMM d, HH:mm') : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
