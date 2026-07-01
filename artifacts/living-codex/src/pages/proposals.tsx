import { useListProposals } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";

export default function Proposals() {
  const { data: proposals, isLoading } = useListProposals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="font-serif italic text-3xl font-bold tracking-tight text-white">Proposal Tracker</h2>
          <p className="text-sm text-muted-foreground">Generated contracts, pitches, and active negotiations.</p>
        </div>
      </div>

      <div className="border border-border/50 rounded-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-mono text-[10px] uppercase tracking-wider w-12"></TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Title</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Value</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Sent / Viewed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading proposals...</TableCell>
              </TableRow>
            ) : proposals?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No proposals found.</TableCell>
              </TableRow>
            ) : (
              proposals?.map((proposal) => (
                <TableRow key={proposal.id} className="group border-border/50 hover:bg-accent/50 cursor-pointer">
                  <TableCell>
                    <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-sm text-primary">
                      <FileText className="w-4 h-4" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">{proposal.title}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-primary">${proposal.value.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={proposal.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs font-mono text-muted-foreground">
                      <span>S: {proposal.sentAt ? format(new Date(proposal.sentAt), 'MMM d, HH:mm') : '-'}</span>
                      <span>V: {proposal.viewedAt ? format(new Date(proposal.viewedAt), 'MMM d, HH:mm') : '-'}</span>
                    </div>
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
