import { useGetBillingStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface SubscriptionGateProps {
  children: React.ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { data: billing, isLoading } = useGetBillingStatus();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!billing?.configured) return <>{children}</>;

  if (billing?.active) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Lock className="w-7 h-7 text-primary" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-extrabold tracking-tight">Subscription Required</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          An active Autonomous Revenue OS™ subscription is required to use this feature. Choose a plan to unlock AI lead generation, real outreach, and the full revenue OS.
        </p>
      </div>
      <Button size="lg" className="gap-2 px-8" onClick={() => navigate("/billing")}>
        <Zap className="w-4 h-4" />
        View Plans
      </Button>
    </div>
  );
}
