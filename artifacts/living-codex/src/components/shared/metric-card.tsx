import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ElementType;
  className?: string;
}

export function MetricCard({ title, value, trend, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn("bg-card border-border/50", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">{title}</p>
            <div className="text-3xl font-light tracking-tight">{value}</div>
          </div>
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-sm border border-primary/20">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2 text-sm font-mono">
            <span className={trend.value >= 0 ? "text-green-500" : "text-destructive"}>
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
