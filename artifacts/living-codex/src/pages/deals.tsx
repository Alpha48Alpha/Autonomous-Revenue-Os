import { useState } from "react";
import { useGetDealsPipeline, useListDeals, useUpdateDeal } from "@workspace/api-client-react";
import { DollarSign, Briefcase, ChevronRight, Loader2, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const STAGES = [
  { key: "discovery", label: "Discovery", color: "bg-slate-500/15 text-slate-300" },
  { key: "qualified", label: "Qualified", color: "bg-blue-500/15 text-blue-300" },
  { key: "proposal", label: "Proposal", color: "bg-amber-500/15 text-amber-300" },
  { key: "negotiation", label: "Negotiation", color: "bg-orange-500/15 text-orange-300" },
  { key: "closed_won", label: "Closed Won", color: "bg-green-500/15 text-green-400" },
  { key: "closed_lost", label: "Closed Lost", color: "bg-red-500/15 text-red-400" },
] as const;

type StageKey = typeof STAGES[number]["key"];

const STAGE_ORDER: StageKey[] = ["discovery", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];

function nextStage(current: StageKey): StageKey | null {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx >= STAGE_ORDER.length - 2) return null;
  return STAGE_ORDER[idx + 1];
}

function StageTag({ stage }: { stage: StageKey }) {
  const s = STAGES.find(x => x.key === stage);
  if (!s) return null;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${s.color}`}>
      {s.label}
    </span>
  );
}

export default function Deals() {
  const { data: pipeline, isLoading: pipelineLoading } = useGetDealsPipeline();
  const { data: deals, isLoading: dealsLoading } = useListDeals();
  const { mutateAsync: updateDeal } = useUpdateDeal();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [advancing, setAdvancing] = useState<number | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const advanceStage = async (dealId: number, currentStage: StageKey) => {
    const next = nextStage(currentStage);
    if (!next) return;
    setAdvancing(dealId);
    try {
      await updateDeal({ id: dealId, data: { stage: next } });
      queryClient.invalidateQueries();
      const nextLabel = STAGES.find(s => s.key === next)?.label;
      toast({ title: "Stage advanced", description: `Deal moved to ${nextLabel}` });
    } catch {
      toast({ title: "Error", description: "Failed to advance stage", variant: "destructive" });
    } finally {
      setAdvancing(null);
    }
  };

  if (pipelineLoading || dealsLoading) {
    return (
      <div className="px-4 lg:px-8 py-6 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-card rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif italic text-3xl font-bold tracking-tight text-white">Deal Pipeline</h1>
          <p className="text-sm text-white/40 mt-1 font-medium">
            {deals?.length ?? 0} active deals · tap a card to advance stage
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "kanban" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { label: "Total Pipeline", value: `$${(pipeline?.totalValue ?? 0).toLocaleString()}`, icon: Briefcase },
          { label: "Weighted Value", value: `$${(pipeline?.weightedValue ?? 0).toLocaleString()}`, icon: TrendingUp },
          { label: "Closed Won", value: `$${(pipeline?.closedWonValue ?? 0).toLocaleString()}`, icon: DollarSign },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</span>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban — horizontal scroll on mobile */}
      {view === "kanban" ? (
        <div className="overflow-x-auto -mx-4 px-4 pb-4">
          <div className="flex gap-3" style={{ minWidth: `${STAGES.length * 220}px` }}>
            {STAGES.map(({ key, label, color }) => {
              const stageDeals = deals?.filter(d => d.stage === key) || [];
              const stageValue = stageDeals.reduce((s, d) => s + (d.value ?? 0), 0);
              return (
                <div key={key} className="w-52 flex-shrink-0 flex flex-col bg-muted/30 rounded-2xl border border-border/60 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/60">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${color}`}>{label}</span>
                      <span className="text-xs font-bold text-muted-foreground">{stageDeals.length}</span>
                    </div>
                    <div className="text-sm font-bold">${(stageValue / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="flex-1 p-2 space-y-2">
                    {stageDeals.map(deal => {
                      const next = nextStage(deal.stage as StageKey);
                      const isAdvancing = advancing === deal.id;
                      return (
                        <div key={deal.id} className="bg-card border border-border rounded-xl p-3 space-y-2">
                          <div className="font-semibold text-xs leading-tight">{deal.title}</div>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-primary">${(deal.value ?? 0).toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">{deal.probability ?? 0}%</span>
                          </div>
                          {next && (
                            <button
                              onClick={() => advanceStage(deal.id, deal.stage as StageKey)}
                              disabled={isAdvancing}
                              className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 rounded-lg py-1.5 hover:bg-primary/20 active:scale-95 transition-all"
                            >
                              {isAdvancing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>Move to {STAGES.find(s => s.key === next)?.label} <ChevronRight className="w-3 h-3" /></>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {stageDeals.length === 0 && (
                      <div className="py-6 text-center text-xs text-muted-foreground/50 font-semibold uppercase tracking-wider">Empty</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {deals?.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No deals yet</div>
            )}
            {deals?.map(deal => {
              const next = nextStage(deal.stage as StageKey);
              const isAdvancing = advancing === deal.id;
              return (
                <div key={deal.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{deal.title}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StageTag stage={deal.stage as StageKey} />
                      <span className="text-xs text-muted-foreground">{deal.probability ?? 0}% probability</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-primary">${(deal.value ?? 0).toLocaleString()}</div>
                    {next && (
                      <button
                        onClick={() => advanceStage(deal.id, deal.stage as StageKey)}
                        disabled={isAdvancing}
                        className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        {isAdvancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Advance <ChevronRight className="w-3 h-3" /></>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
