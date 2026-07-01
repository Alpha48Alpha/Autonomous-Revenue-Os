import { useState } from "react";
import {
  useListLeads,
  useGenerateLeads,
  useImportLeads,
  useSendSmsBulk,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import {
  Target, Sparkles, Loader2, Search, Mail,
  ChevronRight, Building2, User, Upload, MessageSquare,
  AlertTriangle, CheckCircle2, XCircle, X, Send,
} from "lucide-react";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-green-500/15 text-green-400 border-green-500/20" :
    score >= 45 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" :
    "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-muted/80 text-muted-foreground",
    contacted: "bg-blue-500/10 text-blue-400",
    qualified: "bg-green-500/10 text-green-400",
    disqualified: "bg-red-500/10 text-red-400",
    converted: "bg-primary/10 text-primary",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

type ParsedContact = { name: string; phone: string };

// Parse pasted tab/comma-separated rows: First Name, Last Name, Phone (extra columns ignored).
function parseContacts(text: string): ParsedContact[] {
  const out: ParsedContact[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const cols = trimmed.split(/\t|,/).map((c) => c.trim());
    // Skip an obvious header row.
    if (/first\s*name/i.test(cols[0] || "") && /last\s*name/i.test(cols[1] || "")) continue;
    // Find the phone column: first cell with >= 10 digits.
    const phoneIdx = cols.findIndex((c) => (c.replace(/\D/g, "").length >= 10));
    if (phoneIdx < 0) continue;
    const phone = cols[phoneIdx];
    const nameParts = cols.slice(0, phoneIdx).filter(Boolean);
    const name = nameParts.join(" ").trim();
    if (!name) continue;
    out.push({ name, phone });
  }
  return out;
}

export default function Leads() {
  const { data: leads, isLoading } = useListLeads();
  const { mutateAsync: generateLeads, isPending: generating } = useGenerateLeads();
  const { mutateAsync: importLeads, isPending: importing } = useImportLeads();
  const { mutateAsync: sendSmsBulk, isPending: sendingBulk } = useSendSmsBulk();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(5);

  // Import dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const parsed = parseContacts(pasteText);

  // Selection + bulk SMS state
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkResults, setBulkResults] = useState<
    { name: string; success: boolean; error?: string | null }[] | null
  >(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const { data: campaign } = useQuery<{ message: string; isDefault: boolean }>({
    queryKey: ["campaign-message"],
    queryFn: () => fetch("/api/agents/campaign-message").then((r) => r.json()),
    staleTime: 0,
    retry: false,
  });

  const handleGenerate = async () => {
    try {
      const result = await generateLeads({ data: { count } });
      queryClient.invalidateQueries();
      toast({
        title: `${result.generated} new leads generated`,
        description: "AI agents found prospects matching your company profile.",
      });
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err.message || "Set up your company profile first.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!parsed.length) return;
    try {
      const result = await importLeads({ data: { contacts: parsed, source: "import" } });
      queryClient.invalidateQueries();
      setImportOpen(false);
      setPasteText("");
      toast({
        title: `${result.added} contacts imported`,
        description: `${result.skipped} duplicates skipped · ${result.failed} couldn't be read.`,
      });
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message || "Could not import contacts.",
        variant: "destructive",
      });
    }
  };

  const filtered = (leads || []).filter((l) =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach((l) => next.delete(l.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((l) => next.add(l.id));
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleBulkSend = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    const CHUNK = 50;
    const chunks: number[][] = [];
    for (let i = 0; i < ids.length; i += CHUNK) chunks.push(ids.slice(i, i + CHUNK));

    const acc: { name: string; success: boolean; error?: string | null }[] = [];
    setBulkResults(null);
    setBulkProgress({ done: 0, total: ids.length });
    try {
      for (const chunk of chunks) {
        const result = await sendSmsBulk({ data: { leadIds: chunk } });
        result.results.forEach((r) => acc.push({ name: r.name, success: r.success, error: r.error }));
        setBulkProgress({ done: acc.length, total: ids.length });
      }
      queryClient.invalidateQueries();
      const sent = acc.filter((r) => r.success).length;
      setBulkResults([...acc]);
      toast({
        title: `${sent} of ${ids.length} texts sent`,
        description: sent < ids.length ? `${ids.length - sent} failed — see details.` : "All messages delivered to Twilio.",
        variant: sent === 0 ? "destructive" : undefined,
      });
    } catch (err: any) {
      // Surface whatever sent before the error so partial progress isn't lost.
      if (acc.length) setBulkResults([...acc]);
      toast({
        title: "Bulk send interrupted",
        description: err.message || "Could not send all messages.",
        variant: "destructive",
      });
    } finally {
      setBulkProgress(null);
    }
  };

  const selectedCount = selected.size;

  return (
    <div className="px-4 lg:px-8 py-6 space-y-5 max-w-4xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif italic text-3xl font-bold tracking-tight text-white">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {leads?.length ?? 0} prospects · AI generates on demand
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/campaigns/sms")}
            className="gap-2 h-9 px-3 border-primary/40 text-primary hover:bg-primary/10"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">SMS Campaign</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="gap-2 h-9 px-3"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="h-9 rounded-xl bg-muted border-0 text-sm px-3 text-foreground hidden sm:block"
          >
            {[3, 5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2 h-9 px-4">
            {generating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline">{generating ? "Generating…" : "Generate with AI"}</span>
            <span className="sm:hidden">{generating ? "…" : "AI"}</span>
          </Button>
        </div>
      </div>

      {/* Search + select toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email…"
            className="pl-9 bg-muted border-0 rounded-xl h-10"
          />
        </div>
        {filtered.length > 0 && (
          selectMode ? (
            <Button variant="ghost" onClick={exitSelectMode} className="h-10 px-3 shrink-0">
              Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setSelectMode(true)} className="h-10 px-3 shrink-0 gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Text</span>
            </Button>
          )
        )}
      </div>

      {/* Select-all bar */}
      {selectMode && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted/60">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAll} />
            Select all ({filtered.length})
          </label>
          <span className="text-xs text-muted-foreground">{selectedCount} selected</span>
        </div>
      )}

      {/* Lead cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold">
            {search ? "No leads match your search" : "No leads yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {search
              ? "Try a different name, company, or email."
              : "Generate with AI, or Import a contact list to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((lead) => {
            const isSel = selected.has(lead.id);
            return (
              <div
                key={lead.id}
                onClick={() => selectMode ? toggleSelect(lead.id) : navigate(`/leads/${lead.id}`)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-card border transition-all group cursor-pointer ${
                  isSel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-card/80"
                }`}
              >
                {selectMode && (
                  <Checkbox
                    checked={isSel}
                    onCheckedChange={() => toggleSelect(lead.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">
                    {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-bold text-sm truncate">{lead.name}</span>
                    <ScoreBadge score={lead.score} />
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {lead.company && (
                      <span className="flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {lead.company}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="flex items-center gap-1 truncate">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        {lead.phone}
                      </span>
                    )}
                    {lead.title && !lead.phone && (
                      <span className="flex items-center gap-1 truncate hidden sm:flex">
                        <User className="w-3 h-3 shrink-0" />
                        {lead.title}
                      </span>
                    )}
                  </div>
                  {lead.email && (
                    <div className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">{lead.email}</div>
                  )}
                </div>

                {/* Actions */}
                {!selectMode && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate("/comms"); }}
                      className="w-9 h-9 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                      title="Send outreach"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && !selectMode && (
        <p className="text-xs text-muted-foreground text-center">
          {filtered.length} of {leads?.length ?? 0} leads
        </p>
      )}

      {/* Sticky bulk-send bar */}
      {selectMode && selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => { setBulkResults(null); setBulkOpen(true); }}
              className="w-full h-12 gap-2 text-base shadow-lg"
            >
              <MessageSquare className="w-5 h-5" />
              Send SMS to {selectedCount} {selectedCount === 1 ? "lead" : "leads"}
            </Button>
          </div>
        </div>
      )}

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import contacts</DialogTitle>
            <DialogDescription>
              Paste rows as <span className="font-mono text-xs">First Name, Last Name, Phone</span> — tabs or commas both work. A header row is detected automatically.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"Aaron\tGumm\t940-453-7880\nAbby\tLiechty\t502-724-4522"}
            className="h-48 font-mono text-xs resize-none"
          />
          <p className="text-sm text-muted-foreground">
            {parsed.length > 0
              ? <><span className="font-semibold text-foreground">{parsed.length}</span> contacts detected. Invalid phone numbers and duplicates are skipped automatically.</>
              : "No valid contacts detected yet."}
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={!parsed.length || importing} className="gap-2">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import {parsed.length || ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk SMS confirm / results dialog */}
      <Dialog open={bulkOpen} onOpenChange={(o) => { setBulkOpen(o); if (!o && bulkResults) exitSelectMode(); }}>
        <DialogContent className="max-w-lg">
          {!bulkResults ? (
            <>
              <DialogHeader>
                <DialogTitle>Send SMS to {selectedCount} {selectedCount === 1 ? "lead" : "leads"}?</DialogTitle>
                <DialogDescription>
                  Every lead receives your saved Campaign Message via Twilio — word for word, never AI-generated.
                  {selectedCount > 50 && " Large lists are sent automatically in batches of 50 — every selected lead is texted exactly once."}
                </DialogDescription>
              </DialogHeader>
              {campaign?.message && (
                <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-3 text-sm">
                  <div className="text-[10px] uppercase tracking-wider text-primary/80 font-semibold mb-1.5">
                    This is exactly what each lead will receive
                  </div>
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{campaign.message}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Edit this anytime under Outreach → Your Campaign Message.
                  </div>
                </div>
              )}
              <div className="flex gap-2 items-start text-sm rounded-xl bg-muted/60 text-muted-foreground p-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>If your Twilio account is in trial mode, texts only reach numbers verified in your Twilio console — others will show as failed.</span>
              </div>
              {bulkProgress && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Sending…</span>
                    <span>{bulkProgress.done} / {bulkProgress.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${bulkProgress.total ? (bulkProgress.done / bulkProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setBulkOpen(false)} disabled={sendingBulk}>Cancel</Button>
                <Button onClick={handleBulkSend} disabled={sendingBulk} className="gap-2">
                  {sendingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  {sendingBulk ? "Sending…" : `Send ${selectedCount}`}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Send results</DialogTitle>
                <DialogDescription>
                  {bulkResults.filter((r) => r.success).length} sent · {bulkResults.filter((r) => !r.success).length} failed
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {bulkResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-muted/40">
                    {r.success
                      ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    <span className="font-medium truncate">{r.name}</span>
                    {!r.success && r.error && (
                      <span className="text-xs text-muted-foreground truncate ml-auto">{r.error}</span>
                    )}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => { setBulkOpen(false); exitSelectMode(); }} className="gap-2">
                  <X className="w-4 h-4" /> Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
