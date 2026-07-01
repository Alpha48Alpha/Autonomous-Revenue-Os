import { useState } from "react";
import { useListTransactions } from "@workspace/api-client-react";
import { CheckCircle2, XCircle, Mail, MessageSquare, Clock, Receipt, X, Copy, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

import type { Transaction } from "@workspace/api-client-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "delivered") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-500/15 text-green-400 uppercase tracking-wide whitespace-nowrap">
      <CheckCircle2 className="w-2.5 h-2.5" /> delivered
    </span>
  );
  if (status === "failed" || status === "bounced") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 uppercase tracking-wide whitespace-nowrap">
      <XCircle className="w-2.5 h-2.5" /> {status}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wide whitespace-nowrap">
      <Clock className="w-2.5 h-2.5" /> {status}
    </span>
  );
}

function DetailPanel({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-3xl lg:rounded-2xl w-full lg:max-w-xl p-6 space-y-5 z-10 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              txn.type === "email" ? "bg-blue-500/15" : "bg-green-500/15"
            }`}>
              {txn.type === "email"
                ? <Mail className="w-5 h-5 text-blue-400" />
                : <MessageSquare className="w-5 h-5 text-green-400" />}
            </div>
            <div>
              <div className="font-bold text-base capitalize">{txn.type} Receipt</div>
              <div className={`text-sm font-semibold mt-0.5 ${txn.status === "delivered" ? "text-green-400" : txn.status === "failed" ? "text-red-400" : "text-muted-foreground"}`}>
                {txn.status === "delivered" ? "✓ Delivered" : txn.status === "failed" ? "✗ Failed" : txn.status}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <Field label="Recipient" value={txn.recipient} onCopy={() => copy(txn.recipient)} />
          {txn.subject && <Field label="Subject" value={txn.subject} onCopy={() => copy(txn.subject!)} />}
          {txn.body && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message Body</div>
              <div className="bg-background border border-border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-mono text-foreground/90">
                {txn.body}
              </div>
              <button onClick={() => copy(txn.body!)} className="text-xs text-primary font-semibold flex items-center gap-1.5">
                <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy body"}
              </button>
            </div>
          )}
          <Field label="Provider" value={txn.provider} />
          {txn.providerId && <Field label="Provider ID" value={txn.providerId} mono onCopy={() => copy(txn.providerId!)} />}
          {txn.cost != null && <Field label="Cost" value={`$${txn.cost.toFixed(4)}`} />}
          <Field label="Sent at" value={format(new Date(txn.createdAt), "MMM d yyyy, HH:mm:ss")} />
          {txn.deliveredAt && <Field label="Delivered at" value={format(new Date(txn.deliveredAt), "MMM d yyyy, HH:mm:ss")} />}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono, onCopy }: { label: string; value: string; mono?: boolean; onCopy?: () => void }) {
  return (
    <div className="flex items-start gap-3 bg-background border border-border rounded-xl px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>
        <div className={`text-sm ${mono ? "font-mono text-xs" : "font-medium"} break-all`}>{value}</div>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="shrink-0 mt-1">
          <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
}

export default function Transactions() {
  const { data: transactions, isLoading } = useListTransactions();
  const [selected, setSelected] = useState<Transaction | null>(null);

  const emailCount = transactions?.filter((t) => t.type === "email").length ?? 0;
  const smsCount = transactions?.filter((t) => t.type === "sms").length ?? 0;
  const deliveredCount = transactions?.filter((t) => t.status === "delivered").length ?? 0;
  const failedCount = transactions?.filter((t) => t.status === "failed").length ?? 0;

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Delivery Receipts</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Every email and SMS — with full proof of delivery. Tap any row to see details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: transactions?.length ?? 0, icon: Receipt, color: "text-foreground" },
          { label: "Email", value: emailCount, icon: Mail, color: "text-blue-400" },
          { label: "SMS", value: smsCount, icon: MessageSquare, color: "text-green-400" },
          { label: "Delivered", value: deliveredCount, icon: CheckCircle2, color: "text-green-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-base">All Transactions</h2>
          {failedCount > 0 && (
            <span className="text-sm font-semibold text-red-400">{failedCount} failed</span>
          )}
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : !transactions?.length ? (
          <div className="py-16 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Send your first email or SMS from the Outreach Hub.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((txn) => (
              <button
                key={txn.id}
                onClick={() => setSelected(txn)}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-accent/40 active:bg-accent/60 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  txn.type === "email" ? "bg-blue-500/10" : "bg-green-500/10"
                }`}>
                  {txn.type === "email"
                    ? <Mail className="w-5 h-5 text-blue-400" />
                    : <MessageSquare className="w-5 h-5 text-green-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm truncate">{txn.recipient}</span>
                  </div>
                  {txn.subject && (
                    <p className="text-xs text-muted-foreground truncate">{txn.subject}</p>
                  )}
                  {!txn.subject && txn.body && (
                    <p className="text-xs text-muted-foreground truncate">{txn.body}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md">
                      {txn.provider}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(txn.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusBadge status={txn.status} />
                  {txn.providerId && (
                    <span className="text-[10px] font-mono text-muted-foreground/50 truncate max-w-[80px]">
                      {txn.providerId.slice(0, 12)}…
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && <DetailPanel txn={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
