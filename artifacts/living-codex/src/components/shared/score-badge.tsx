import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  let level = "cold";
  let bg = "bg-blue-500/10";
  let text = "text-blue-500";
  let border = "border-blue-500/20";

  if (score >= 70) {
    level = "hot";
    bg = "bg-primary/10";
    text = "text-primary";
    border = "border-primary/20";
  } else if (score >= 40) {
    level = "warm";
    bg = "bg-yellow-500/10";
    text = "text-yellow-500";
    border = "border-yellow-500/20";
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className={cn("px-2 py-0.5 rounded-sm border text-xs font-mono font-medium", bg, text, border)}>
        {score}
      </div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{level}</span>
    </div>
  );
}
