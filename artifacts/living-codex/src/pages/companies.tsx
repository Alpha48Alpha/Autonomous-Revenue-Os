import { useListCompanies } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Companies() {
  const { data: companies, isLoading } = useListCompanies();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="font-serif italic text-3xl font-bold tracking-tight text-white">Account Intelligence</h2>
          <p className="text-sm text-muted-foreground">Monitored organizations and target accounts.</p>
        </div>
      </div>

      <div className="border border-border/50 rounded-sm bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Organization</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Industry</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider">Size</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-right">Leads</TableHead>
              <TableHead className="font-mono text-[10px] uppercase tracking-wider text-right">Deals</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Loading accounts...</TableCell>
              </TableRow>
            ) : companies?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No accounts found.</TableCell>
              </TableRow>
            ) : (
              companies?.map((company) => (
                <TableRow key={company.id} className="group border-border/50 hover:bg-accent/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-muted-foreground">{company.domain || "-"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{company.industry || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">{company.size || "-"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">{company.leadCount || 0}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono">{company.dealCount || 0}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {company.website && (
                      <Button variant="ghost" size="icon" className="rounded-sm opacity-0 group-hover:opacity-100" asChild>
                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
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
