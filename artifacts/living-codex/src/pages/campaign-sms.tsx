import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  MessageSquare, ArrowLeft, Loader2, CheckCircle2,
  XCircle, AlertTriangle, Send, Users, Eye, Clock, History,
  ChevronRight, ChevronDown, ChevronUp, Save, Download,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getApiUrl(path: string) {
  return `${BASE}/api${path}`;
}

interface PreviewData {
  template: string;
  previewName: string;
  totalContacts: number;
  withPhone: number;
  defaultCooldownDays: number;
}

interface JobStatus {
  id: string;
  status: "pending" | "running" | "done" | "error";
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  alreadyContacted: number;
  processed: number;
  cooldownDays: number;
  results: { leadId: number; name: string; phone: string | null; success: boolean; skipped: boolean; alreadyContacted: boolean; error: string | null }[];
  startedAt: string;
  finishedAt?: string;
}

interface CampaignHistoryItem {
  id: number;
  template: string;
  sent: number;
  failed: number;
  skipped: number;
  total: number;
  startedAt: string;
  finishedAt: string | null;
}

interface CampaignDetail extends CampaignHistoryItem {
  results: {
    id: number;
    campaignId: number;
    leadId: number;
    name: string;
    phone: string | null;
    success: boolean;
    skipped: boolean;
    error: string | null;
  }[];
}

function personalize(template: string, name: string): string {
  const firstName = name.split(" ")[0] || name;
  return template
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{name\}/g, firstName)
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{firstName\}/g, firstName);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function HistoryRow({ item, onSelect, selected }: { item: CampaignHistoryItem; onSelect: () => void; selected: boolean }) {
  const successRate = item.total > 0 ? Math.round((item.sent / item.total) * 100) : 0;
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-colors ${
        selected
          ? "border-primary/60 bg-primary/[0.06]"
          : "border-border bg-card hover:border-border/80 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground mb-1">{formatDate(item.startedAt)}</div>
          <p className="text-sm text-foreground/80 truncate font-mono">
            {item.template.slice(0, 80)}{item.template.length > 80 ? "…" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1.5 text-xs">
            <span className="text-green-400 font-semibold">{item.sent}✓</span>
            {item.failed > 0 && <span className="text-red-400 font-semibold">{item.failed}✗</span>}
            {item.skipped > 0 && <span className="text-muted-foreground">{item.skipped} skip</span>}
          </div>
          {selected ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>
    </button>
  );
}

function exportCsv(detail: CampaignDetail) {
  const header = ["Name", "Phone", "Status", "Error"];
  const rows = detail.results.map((r) => {
    const status = r.success ? "sent" : r.skipped ? "skipped" : "failed";
    return [r.name, r.phone ?? "", status, r.error ?? ""];
  });
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date(detail.startedAt).toISOString().slice(0, 10);
  a.download = `campaign-${detail.id}-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function CampaignDetailPanel({ campaignId }: { campaignId: number }) {
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(getApiUrl(`/campaigns/history/${campaignId}`))
      .then((r) => r.json())
      .then((d) => { setDetail(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading results…
      </div>
    );
  }
  if (!detail) return null;

  const failed = detail.results.filter((r) => !r.success && !r.skipped);
  const skipped = detail.results.filter((r) => r.skipped);
  const sent = detail.results.filter((r) => r.success);

  return (
    <div className="mt-2 space-y-3 pl-2">
      {sent.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-green-400">Sent ({sent.length})</div>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {sent.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                <span className="font-medium truncate">{r.name}</span>
                <span className="text-muted-foreground ml-auto font-mono truncate">{r.phone}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {failed.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-red-400">Failed ({failed.length})</div>
          <div className="max-h-36 overflow-y-auto space-y-1">
            {failed.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-red-500/10">
                <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                <span className="font-medium truncate">{r.name}</span>
                <span className="text-muted-foreground ml-auto font-mono truncate">{r.phone}</span>
                {r.error && <span className="text-red-400/70 truncate">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {skipped.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground">Skipped — no phone ({skipped.length})</div>
          <div className="max-h-24 overflow-y-auto space-y-0.5">
            {skipped.map((r) => (
              <div key={r.id} className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                {r.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-1">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => exportCsv(detail)}
        >
          <Download className="w-3.5 h-3.5" />
          Download CSV
        </Button>
      </div>
    </div>
  );
}

export default function CampaignSms() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [template, setTemplate] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [cooldownDays, setCooldownDays] = useState(7);

  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [launching, setLaunching] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);
  const phase: "compose" | "sending" | "done" =
    !jobId ? "compose" : job?.status === "done" || job?.status === "error" ? "done" : "sending";

  const [history, setHistory] = useState<CampaignHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(getApiUrl("/campaigns/sms-preview"))
      .then((r) => r.json())
      .then((data: PreviewData) => {
        setPreview(data);
        setTemplate(data.template);
        setCharCount(data.template.length);
        setCooldownDays(data.defaultCooldownDays ?? 7);
      })
      .catch(() => {});
  }, []);

  const loadHistory = () => {
    setHistoryLoading(true);
    fetch(getApiUrl("/campaigns/history"))
      .then((r) => r.json())
      .then((data: CampaignHistoryItem[]) => { setHistory(data); setHistoryLoading(false); })
      .catch(() => setHistoryLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(getApiUrl(`/campaigns/sms/${jobId}`));
        const data: JobStatus = await r.json();
        setJob(data);
        if (data.status === "done" || data.status === "error") {
          if (pollRef.current) clearInterval(pollRef.current);
          loadHistory();
        }
      } catch {}
    }, 800);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [jobId]);

  const handleLaunch = async () => {
    if (!template.trim()) return;
    setLaunching(true);
    try {
      const r = await fetch(getApiUrl("/campaigns/sms"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: template.trim(), cooldownDays }),
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setJobId(data.jobId);
      setJob({
        id: data.jobId,
        status: "pending",
        total: data.total,
        sent: 0,
        failed: 0,
        skipped: 0,
        alreadyContacted: 0,
        processed: 0,
        cooldownDays,
        results: [],
        startedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      toast({ title: "Failed to start campaign", description: err.message, variant: "destructive" });
    } finally {
      setLaunching(false);
    }
  };

  const handleSaveDefault = async () => {
    if (!template.trim()) return;
    setSavingDefault(true);
    try {
      const r = await fetch(getApiUrl("/agents/campaign-message"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: template.trim() }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "Template saved", description: "This message will pre-load next time you open the campaign screen." });
    } catch (err: any) {
      toast({ title: "Failed to save template", description: err.message, variant: "destructive" });
    } finally {
      setSavingDefault(false);
    }
  };

  const handleReset = () => {
    setJobId(null);
    setJob(null);
  };

  const pct = job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;
  const previewText = preview ? personalize(template || preview.template, preview.previewName) : "";

  return (
    <div className="px-4 lg:px-8 py-6 space-y-6 max-w-2xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/leads")}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif italic text-2xl font-bold tracking-tight text-white">SMS Campaign</h1>
          <p className="text-sm text-muted-foreground">Blast a personalised message to all contacts</p>
        </div>
      </div>

      {phase === "compose" && (
        <>
          {/* Stats row */}
          {preview && (
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">{preview.withPhone.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">will receive SMS</div>
                </div>
              </div>
              <div className="flex-1 rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xl font-bold">{(preview.totalContacts - preview.withPhone).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">skipped (no phone)</div>
                </div>
              </div>
            </div>
          )}

          {/* Template editor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Message template
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                use <code className="bg-muted px-1 rounded text-primary">{"{{name}}"}</code> to personalise per contact
              </span>
            </label>
            <Textarea
              value={template}
              onChange={(e) => { setTemplate(e.target.value); setCharCount(e.target.value.length); }}
              placeholder={"Hi {{name}}, this is Elizabeth — I wanted to reach out personally…"}
              className="h-36 resize-none font-mono text-sm"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{charCount} / 1000 characters</span>
              {charCount > 160 && (
                <span className="text-yellow-500">
                  {Math.ceil(charCount / 160)} SMS segments per contact
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDefault}
              disabled={savingDefault || !template.trim()}
              className="gap-2 self-start"
            >
              {savingDefault
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />}
              {savingDefault ? "Saving…" : "Save as default"}
            </Button>
          </div>

          {/* Cooldown setting */}
          <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">Cooldown period</div>
              <div className="text-xs text-muted-foreground">Contacts texted within this window will be skipped</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                max={365}
                value={cooldownDays}
                onChange={(e) => setCooldownDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                className="w-16 text-center rounded-lg bg-muted border border-border text-sm font-mono py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          {/* Live preview */}
          {preview && template && (
            <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary/80 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5" />
                Preview — as {preview.previewName.split(" ")[0]} will see it
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{previewText}</p>
            </div>
          )}

          {/* Trial mode warning */}
          <div className="flex gap-2 items-start text-sm rounded-xl bg-muted/60 text-muted-foreground p-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
            <span>
              Twilio trial accounts can only text verified numbers. Non-verified contacts will show as failed in the summary.
            </span>
          </div>

          {/* Send button */}
          <Button
            onClick={handleLaunch}
            disabled={launching || !template.trim() || !preview}
            className="w-full h-12 text-base gap-2"
            size="lg"
          >
            {launching
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <Send className="w-5 h-5" />}
            {launching
              ? "Starting campaign…"
              : preview
                ? `Send to ${preview.withPhone.toLocaleString()} contacts`
                : "Send to all contacts"}
          </Button>
        </>
      )}

      {phase === "sending" && job && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="font-semibold">Sending in progress…</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{job.processed.toLocaleString()} of {job.total.toLocaleString()} contacts</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Running stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-center">
                <div className="text-lg font-bold text-green-400">{job.sent}</div>
                <div className="text-xs text-green-400/80">Sent</div>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
                <div className="text-lg font-bold text-red-400">{job.failed}</div>
                <div className="text-xs text-red-400/80">Failed</div>
              </div>
              <div className="rounded-xl bg-muted p-3 text-center">
                <div className="text-lg font-bold text-muted-foreground">{job.skipped}</div>
                <div className="text-xs text-muted-foreground/80">No phone</div>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                <div className="text-lg font-bold text-amber-400">{job.alreadyContacted}</div>
                <div className="text-xs text-amber-400/80">Cooling off</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "done" && job && (
        <div className="space-y-5">
          {/* Summary card */}
          <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
            <h2 className="font-semibold text-lg">Campaign complete</h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{job.sent}</div>
                <div className="text-xs text-green-400/80 mt-1">Sent</div>
              </div>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{job.failed}</div>
                <div className="text-xs text-red-400/80 mt-1">Failed</div>
              </div>
              <div className="rounded-xl bg-muted p-4 text-center">
                <div className="text-2xl font-bold text-muted-foreground">{job.skipped}</div>
                <div className="text-xs text-muted-foreground/80 mt-1">No phone</div>
              </div>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{job.alreadyContacted}</div>
                <div className="text-xs text-amber-400/80 mt-1">Already contacted</div>
              </div>
            </div>
            {job.alreadyContacted > 0 && (
              <p className="text-xs text-muted-foreground">
                {job.alreadyContacted} contact{job.alreadyContacted !== 1 ? "s were" : " was"} texted within the last {job.cooldownDays} day{job.cooldownDays !== 1 ? "s" : ""} and skipped to avoid over-messaging.
              </p>
            )}
          </div>

          {/* Failed list */}
          {job.results.filter((r) => !r.success && !r.skipped && !r.alreadyContacted).length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold text-red-400">
                Failed numbers ({job.results.filter((r) => !r.success && !r.skipped && !r.alreadyContacted).length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {job.results.filter((r) => !r.success && !r.skipped && !r.alreadyContacted).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-muted/40">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-medium truncate">{r.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto font-mono truncate">{r.phone}</span>
                    {r.error && <span className="text-xs text-red-400/70 truncate">{r.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already contacted list */}
          {job.alreadyContacted > 0 && (
            <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-amber-400">
                Already contacted — cooling off ({job.alreadyContacted})
              </h3>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {job.results.filter((r) => r.alreadyContacted).map((r, i) => (
                  <div key={i} className="text-xs text-amber-400/70 px-2 py-1 flex items-center gap-2">
                    <Clock className="w-3 h-3 shrink-0" />
                    {r.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped list (collapsed) */}
          {job.skipped > 0 && (
            <div className="rounded-2xl bg-muted/40 border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Skipped — no phone number ({job.skipped})
              </h3>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {job.results.filter((r) => r.skipped).map((r, i) => (
                  <div key={i} className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                    {r.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Send another campaign
            </Button>
            <Button onClick={() => navigate("/leads")} className="flex-1">
              Back to Leads
            </Button>
          </div>
        </div>
      )}

      {/* Campaign History */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Campaign History</h2>
          {historyLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </div>

        {!historyLoading && history.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No campaigns sent yet. Your past blasts and results will appear here.
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id}>
                <HistoryRow
                  item={item}
                  selected={expandedId === item.id}
                  onSelect={() => setExpandedId(expandedId === item.id ? null : item.id)}
                />
                {expandedId === item.id && (
                  <div className="mt-1 mb-1 rounded-xl border border-border bg-muted/20 p-4">
                    <CampaignDetailPanel campaignId={item.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
