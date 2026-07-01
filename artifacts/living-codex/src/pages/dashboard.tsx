import { useGetDashboardMetrics, useGetProofOfWork, useGetDashboardRecentActivity, useGetSetup, useListTransactions } from "@workspace/api-client-react";
import { DollarSign, Target, Zap, Briefcase, ArrowRight, TrendingUp, MessageSquare, Settings, Mail, CheckCircle2, XCircle, Clock, Receipt, Power, Cpu, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useState, useEffect, useCallback } from "react";

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string; icon: any; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 space-y-3 ${accent ? "" : "bg-card border border-border"}`}
      style={accent ? {
        background: "linear-gradient(135deg, #ff7832 0%, #d45e10 100%)",
        boxShadow: "0 8px 32px rgba(255,120,50,0.25)",
      } : {}}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${accent ? "text-white/60" : "text-muted-foreground"}`}>{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-white/15" : "bg-muted"}`}>
          <Icon className={`w-4.5 h-4.5 ${accent ? "text-white" : "text-muted-foreground"}`} />
        </div>
      </div>
      <div>
        <div className={`font-serif text-4xl font-bold tracking-tight ${accent ? "text-white" : "text-foreground"}`}>{value}</div>
        {sub && <div className={`text-xs mt-1.5 font-medium ${accent ? "text-white/60" : "text-muted-foreground"}`}>{sub}</div>}
      </div>
    </div>
  );
}

const agentColors: Record<string, string> = {
  revenue_ops: "bg-emerald-500/15 text-emerald-400",
  outreach: "bg-primary/15 text-primary",
  strategy: "bg-purple-500/15 text-purple-400",
  sales: "bg-blue-500/15 text-blue-400",
  research: "bg-amber-500/15 text-amber-400",
  crm: "bg-pink-500/15 text-pink-400",
  opportunity: "bg-cyan-500/15 text-cyan-400",
};

function TxnStatusBadge({ status }: { status: string }) {
  if (status === "delivered") return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 uppercase tracking-wide">
      <CheckCircle2 className="w-2.5 h-2.5" /> delivered
    </span>
  );
  if (status === "failed" || status === "bounced") return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 uppercase tracking-wide">
      <XCircle className="w-2.5 h-2.5" /> {status}
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wide">
      <Clock className="w-2.5 h-2.5" /> {status}
    </span>
  );
}

interface AutopilotStatus {
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  totalLeadsGenerated: number;
  totalSmsSent: number;
  lastError: string | null;
  cycleCount: number;
}

function AutopilotPanel() {
  const [status, setStatus] = useState<AutopilotStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [runningNow, setRunningNow] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/autopilot");
      if (res.ok) setStatus(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 15_000);
    return () => clearInterval(t);
  }, [fetchStatus]);

  const toggle = async () => {
    if (!status) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agents/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !status.enabled }),
      });
      if (res.ok) setStatus(await res.json());
    } finally { setLoading(false); }
  };

  const triggerNow = async () => {
    setRunningNow(true);
    try {
      const res = await fetch("/api/agents/autopilot/run", { method: "POST" });
      if (res.ok) setStatus(await res.json());
    } finally { setRunningNow(false); }
  };

  const on = status?.enabled ?? false;

  return (
    <div className="rounded-2xl overflow-hidden" style={on ? {
      border: "1px solid rgba(52,211,153,0.25)",
      background: "linear-gradient(135deg, rgba(52,211,153,0.04) 0%, rgba(0,0,0,0) 60%)",
    } : { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
      <div className="px-5 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${on ? "bg-emerald-500/15" : "bg-white/5"}`}>
            <Cpu className={`w-5 h-5 ${on ? "text-emerald-400" : "text-white/30"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-lg font-semibold text-white">Autopilot Engine</h2>
              {on && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
            <p className="text-xs text-white/40 mt-0.5 font-medium">
              {on
                ? status?.nextRun
                  ? `Next cycle ${format(new Date(status.nextRun), "h:mm a")}`
                  : "Running autonomously"
                : "Off — system is idle"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {on && (
            <button
              onClick={triggerNow}
              disabled={runningNow}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningNow ? "animate-spin" : ""}`} />
              Run now
            </button>
          )}
          <button
            onClick={toggle}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={on ? {
              background: "linear-gradient(135deg, #34d399, #059669)",
              boxShadow: "0 4px 16px rgba(52,211,153,0.3)",
              color: "white",
            } : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}
          >
            <Power className="w-4 h-4" />
            {on ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {status && (on || status.cycleCount > 0) && (
        <div className="grid grid-cols-3 divide-x" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            { label: "Cycles run", value: status.cycleCount },
            { label: "Leads found", value: status.totalLeadsGenerated },
            { label: "SMS sent", value: status.totalSmsSent },
          ].map((s) => (
            <div key={s.label} className="px-5 py-3 text-center">
              <div className="font-serif text-2xl font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-white/35 mt-0.5 uppercase tracking-wider font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {status?.lastError && (
        <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)" }}>
          <p className="text-xs text-red-400 font-medium">⚠ {status.lastError}</p>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading: ml } = useGetDashboardMetrics();
  const { data: pow, isLoading: pl } = useGetProofOfWork();
  const { data: activity, isLoading: al } = useGetDashboardRecentActivity();
  const { data: profile } = useGetSetup();
  const { data: transactions } = useListTransactions();

  if (ml || pl || al) {
    return (
      <div className="px-4 pt-6 pb-4 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-card rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-card rounded-2xl" />)}
        </div>
        <div className="h-24 bg-card rounded-2xl" />
        <div className="h-52 bg-card rounded-2xl" />
        <div className="h-64 bg-card rounded-2xl" />
      </div>
    );
  }

  const recentTxns = (transactions ?? []).slice(0, 5);

  return (
    <div className="px-4 lg:px-8 pt-6 pb-6 space-y-6 max-w-5xl mx-auto w-full">

      {!profile && (
        <Link href="/setup">
          <div className="flex items-center gap-4 rounded-2xl border border-primary/40 bg-primary/8 px-5 py-4 cursor-pointer active:scale-[0.98] transition-transform group">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground">Activate your AI agents</p>
              <p className="text-xs text-muted-foreground mt-0.5">Set up your company profile to start generating leads</p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary shrink-0" />
          </div>
        </Link>
      )}

      <div>
        <h1 className="font-serif italic text-3xl lg:text-4xl font-bold tracking-tight text-white">
          {profile?.companyName || "Command Center"}
        </h1>
        <p className="text-sm text-white/40 mt-1.5 font-medium tracking-wide">
          AI agents running autonomously — live results below
        </p>
      </div>

      {/* ── AUTOPILOT ENGINE ── */}
      <AutopilotPanel />

      {/* ── STAT GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Revenue" value={`$${((metrics?.revenue.closedWon ?? 0) / 1000).toFixed(0)}K`} sub={`+${metrics?.revenue.growth ?? 0}% this month`} icon={DollarSign} accent />
        <StatCard label="Pipeline" value={`$${((metrics?.pipeline.totalValue ?? 0) / 1000).toFixed(0)}K`} sub={`${metrics?.pipeline.dealCount ?? 0} deals`} icon={Briefcase} />
        <StatCard label="Leads" value={metrics?.leads.total ?? 0} sub={`${metrics?.leads.hotLeads ?? 0} hot targets`} icon={Target} />
        <StatCard label="Reply Rate" value={`${Math.round((metrics?.outreach.replyRate ?? 0) * 100)}%`} sub={`${metrics?.outreach.sent ?? 0} sent`} icon={Zap} />
      </div>

      {/* ── AGENT PROOF OF WORK ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold">What your agents did</h2>
            <p className="text-xs text-white/40 mt-0.5">Autonomous work completed</p>
          </div>
          <Link href="/activities" className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            Full log <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {[
            { section: "Discovery", emoji: "🔍", stats: [
              { label: "Leads found", value: pow?.discovery.leadsDiscovered ?? 0 },
              { label: "Opportunities", value: pow?.discovery.opportunitiesFound ?? 0 },
            ]},
            { section: "Outreach", emoji: "📤", stats: [
              { label: "Sent", value: pow?.outreach.messagesSent ?? 0 },
              { label: "Replies", value: pow?.outreach.repliesReceived ?? 0 },
            ]},
            { section: "Conversion", emoji: "🤝", stats: [
              { label: "Meetings", value: pow?.revenue.meetingsBooked ?? 0 },
              { label: "Proposals", value: pow?.revenue.proposalsSent ?? 0 },
            ]},
            { section: "Revenue", emoji: "💰", stats: [
              { label: "Deals won", value: pow?.revenue.dealsWon ?? 0 },
              { label: "Generated", value: `$${((pow?.revenue.revenueGenerated ?? 0) / 1000).toFixed(0)}K` },
            ]},
          ].map((col) => (
            <div key={col.section} className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{col.emoji}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{col.section}</span>
              </div>
              {col.stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE ACTIVITY FEED ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="font-serif text-lg font-semibold">Live Agent Feed</h2>
        </div>
        <div className="divide-y divide-border/60">
          {(!activity || activity.length === 0) ? (
            <div className="px-5 py-10 text-center text-muted-foreground">No activity yet — turn on Autopilot above</div>
          ) : (
            activity.slice(0, 8).map((act) => (
              <div key={act.id} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${agentColors[act.agentTeam] ?? "bg-muted text-muted-foreground"}`}>
                    {act.agentTeam.replace("_", " ")}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(new Date(act.createdAt), "MMM d, HH:mm")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-medium">{act.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── RECENT OUTREACH ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-serif text-lg font-semibold">Recent Outreach</h2>
          </div>
          <Link href="/transactions" className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            All receipts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {recentTxns.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            No messages sent yet — Autopilot will send automatically when enabled.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${txn.type === "email" ? "bg-blue-500/10" : "bg-green-500/10"}`}>
                  {txn.type === "email" ? <Mail className="w-4 h-4 text-blue-400" /> : <MessageSquare className="w-4 h-4 text-green-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{txn.recipient}</div>
                  <div className="text-xs text-muted-foreground truncate">{txn.subject || txn.body?.slice(0, 60) || "—"}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <TxnStatusBadge status={txn.status} />
                  <span className="text-[10px] text-muted-foreground/60">{format(new Date(txn.createdAt), "MMM d, HH:mm")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Quick Actions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[
            { href: "/leads", icon: Target, label: "View All Leads", desc: `${metrics?.leads.total ?? 0} prospects in pipeline`, color: "text-orange-400" },
            { href: "/comms", icon: MessageSquare, label: "Send Outreach", desc: "AI email & SMS to your leads", color: "text-blue-400" },
            { href: "/deals", icon: TrendingUp, label: "Deal Pipeline", desc: `${metrics?.pipeline.dealCount ?? 0} deals tracked`, color: "text-emerald-400" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card active:scale-[0.97] transition-transform cursor-pointer group hover:border-primary/40">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
