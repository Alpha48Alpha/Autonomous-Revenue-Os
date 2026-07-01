import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let extraClasses = "bg-muted/50 text-muted-foreground border-border";

  if (["hot", "qualified", "closed_won", "replied", "accepted"].includes(normalized)) {
    extraClasses = "bg-primary/10 text-primary border-primary/20";
  } else if (["warm", "contacted", "proposal", "sent", "viewed", "negotiation"].includes(normalized)) {
    extraClasses = "bg-blue-500/10 text-blue-500 border-blue-500/20";
  } else if (["cold", "disqualified", "closed_lost", "bounced", "rejected"].includes(normalized)) {
    extraClasses = "bg-destructive/10 text-destructive border-destructive/20";
  } else if (["new", "draft", "discovery"].includes(normalized)) {
    extraClasses = "bg-accent text-accent-foreground border-border";
  }

  return (
    <Badge 
      variant={variant} 
      className={cn("rounded-sm font-mono text-[10px] uppercase tracking-wider px-2 py-0.5", extraClasses, className)}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
