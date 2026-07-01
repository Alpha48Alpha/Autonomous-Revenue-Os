import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useListLeads, useListMessages, useGetMessageStats, useSendEmail, useSendSms } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail, MessageSquare, Send, Search, Loader2, CheckCircle2,
  XCircle, Phone, User, Building2, Zap, ChevronRight, Clock,
  AlertTriangle, ShieldCheck, Copy, ChevronDown, ChevronUp,
  Save, RotateCcw, Crown
} from "lucide-react";
import { format } from "date-fns";

type Channel = "email" | "sms";

interface DeliveryConfig {
  resend: {
    configured: boolean;
    fromEmail: string;
    domain: string | null;
    domainVerified: boolean;
    domainStatus: string | null;
    dnsRecords: Array<{ type: string; name: string; value: string; ttl?: string | number; priority?: number }>;
  };
  twilio: {
    configured: boolean;
    fromNumber: string | null;
  };
}

function DeliverySetupBanner({ config, onRefresh }: { config: DeliveryConfig; onRefresh?: () => void }) {
  const [dnsExpanded, setDnsExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const resendOk = config.resend.configured && config.resend.domainVerified;
  const twilioOk = config.twilio.configured;
  const allGood = resendOk && twilioOk;

  if (allGood) {
    return (
      <div className="mx-8 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>Email and SMS delivery fully active — Resend domain verified · Twilio connected</span>
      </div>
    );
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mx-8 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm font-semibold text-amber-400">Delivery setup incomplete — messages will be simulated until resolved</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-accent/50 transition-colors shrink-0"
            >
              <Loader2 className="w-3 h-3" />
              Check status
            </button>
          )}
        </div>

        <div className="space-y-2">
          {/* Resend status */}
          <div className="flex items-start gap-3">
            {resendOk ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                Resend — email delivery
                {config.resend.domainStatus && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-semibold uppercase ${
                    config.resend.domainVerified
                      ? "bg-green-500/15 text-green-400"
                      : config.resend.domainStatus === "not_found"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {config.resend.domainVerified ? "verified" : config.resend.domainStatus}
                  </span>
                )}
              </div>
              {!resendOk && config.resend.configured && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.resend.domainStatus === "not_found"
                    ? `Domain "${config.resend.domain}" not found in Resend. Add it at resend.com/domains, then add the DNS records below.`
                    : config.resend.domainStatus === "pending"
                    ? `Domain "${config.resend.domain}" is pending verification. Add the DNS records below to your DNS provider.`
                    : `Domain "${config.resend.domain}" needs verification. Add the DNS records below.`}
                </p>
              )}
              {!config.resend.configured && (
                <p className="text-xs text-muted-foreground mt-0.5">RESEND_API_KEY not set.</p>
              )}

              {/* DNS Records */}
              {config.resend.configured && !config.resend.domainVerified && config.resend.dnsRecords.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setDnsExpanded(!dnsExpanded)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {dnsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {dnsExpanded ? "Hide" : "Show"} DNS records to add ({config.resend.dnsRecords.length})
                  </button>
                  {dnsExpanded && (
                    <div className="mt-2 rounded-lg border border-border bg-background overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Type</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Name</th>
                            <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Value</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {config.resend.dnsRecords.map((r, i) => (
                            <tr key={i} className="border-b border-border/50 last:border-0">
                              <td className="px-3 py-2 font-mono font-bold text-primary">{r.type}</td>
                              <td className="px-3 py-2 font-mono text-muted-foreground max-w-[120px] truncate">{r.name}</td>
                              <td className="px-3 py-2 font-mono text-foreground/80 max-w-[200px] truncate" title={r.value}>{r.value}</td>
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => copy(r.value, `dns-${i}`)}
                                  className="p-1 hover:bg-accent rounded"
                                  title="Copy value"
                                >
                                  {copied === `dns-${i}` ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="px-3 py-2 text-[11px] text-muted-foreground border-t border-border">
                        Add these records at your DNS provider (e.g. Namecheap, Cloudflare). Changes can take up to 48 hours to propagate.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions when domain not in Resend yet */}
              {config.resend.configured && config.resend.domainStatus === "not_found" && (
                <div className="mt-2 text-xs text-muted-foreground space-y-1 bg-background border border-border rounded-lg px-3 py-2">
                  <p className="font-semibold text-foreground">Steps to verify your domain:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Go to <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary underline">resend.com/domains</a></li>
                    <li>Click <strong>Add Domain</strong> and enter <code className="bg-muted px-1 rounded">{config.resend.domain}</code></li>
                    <li>Copy the DNS records Resend shows you and add them to your DNS provider</li>
                    <li>Click <strong>Verify</strong> in Resend once the records are added</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Twilio status */}
          <div className="flex items-start gap-3">
            {twilioOk ? (
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium">
                Twilio — SMS delivery
                {!twilioOk && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded font-semibold uppercase bg-red-500/15 text-red-400">
                    not connected
                  </span>
                )}
              </div>
              {!twilioOk && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add <code className="bg-muted px-1 rounded">TWILIO_ACCOUNT_SID</code>,{" "}
                  <code className="bg-muted px-1 rounded">TWILIO_AUTH_TOKEN</code>, and{" "}
                  <code className="bg-muted px-1 rounded">TWILIO_FROM_NUMBER</code> to Replit Secrets (Secrets tab in the left sidebar).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Comms() {
  const { data: leads } = useListLeads();
  const { data: messages } = useListMessages();
  const { data: stats } = useGetMessageStats();
  const { mutateAsync: sendEmail, isPending: sendingEmail } = useSendEmail();
  const { mutateAsync: sendSms, isPending: sendingSms } = useSendSms();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deliveryConfig, refetch: refetchDeliveryConfig } = useQuery<DeliveryConfig>({
    queryKey: ["delivery-config"],
    queryFn: () => fetch("/api/agents/delivery-config").then((r) => r.json()),
    staleTime: 0,
    refetchInterval: 30_000,
    retry: false,
  });

  const { data: campaign, refetch: refetchCampaign } = useQuery<{ message: string; isDefault: boolean; defaultMessage: string }>({
    queryKey: ["campaign-message"],
    queryFn: () => fetch("/api/agents/campaign-message").then((r) => r.json()),
    staleTime: 0,
    retry: false,
  });

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [channel, setChannel] = useState<Channel>("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  const [campaignDraft, setCampaignDraft] = useState("");
  const [campaignDirty, setCampaignDirty] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);

  useEffect(() => {
    if (campaign?.message !== undefined && !campaignDirty) {
      setCampaignDraft(campaign.message);
    }
  }, [campaign?.message, campaignDirty]);

  const handleSaveCampaign = async () => {
    const text = campaignDraft.trim();
    if (!text) {
      toast({ title: "Message can't be empty", description: "Write the text you want every lead to receive.", variant: "destructive" });
      return;
    }
    setSavingCampaign(true);
    try {
      const res = await fetch("/api/agents/campaign-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save message");
      setCampaignDirty(false);
      await refetchCampaign();
      toast({ title: "Campaign message saved", description: "This exact text is now what every SMS sends." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not save message", variant: "destructive" });
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleResetCampaign = () => {
    if (campaign?.defaultMessage) {
      setCampaignDraft(campaign.defaultMessage);
      setCampaignDirty(true);
    }
  };

  const filteredLeads = (leads || []).filter((l) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedLead = leads?.find((l) => l.id === selectedLeadId);

  const handleSend = async () => {
    if (!selectedLeadId) return;
    try {
      let receipt: any;
      if (channel === "email") {
        receipt = await sendEmail({
          leadId: selectedLeadId,
          data: subject || body ? { subject, body } : undefined,
        });
      } else {
        receipt = await sendSms({
          leadId: selectedLeadId,
          data: body ? { body } : undefined,
        });
      }
      setLastReceipt(receipt);
      setSubject("");
      setBody("");
      queryClient.invalidateQueries();
      toast({
        title: receipt.success ? "Message sent" : "Delivery attempted",
        description: receipt.error || `${channel === "email" ? "Email" : "SMS"} sent to ${receipt.recipient}`,
        variant: receipt.success ? "default" : "destructive",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send", variant: "destructive" });
    }
  };

  const isSending = sendingEmail || sendingSms;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif italic text-3xl font-bold tracking-tight text-white">Outreach Hub</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your exact message for SMS, AI-assisted email — real delivery, full receipts
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-light">{stats?.totalSent ?? 0}</div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-primary">{stats?.totalReplied ?? 0}</div>
              <div className="text-xs text-muted-foreground">Replied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light">{stats?.replyRate ?? 0}%</div>
              <div className="text-xs text-muted-foreground">Reply Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery setup banner */}
      {deliveryConfig && (
        <DeliverySetupBanner config={deliveryConfig} onRefresh={() => refetchDeliveryConfig()} />
      )}

      {/* Campaign message — the exact text every SMS sends */}
      <div className="mx-4 mt-4 rounded-xl border border-primary/30 bg-primary/[0.03] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-primary/20 bg-primary/[0.04]">
          <div className="flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-primary" />
            <div>
              <div className="text-sm font-semibold">Your Campaign Message</div>
              <div className="text-xs text-muted-foreground">This exact text is what every SMS sends — word for word. No AI rewriting.</div>
            </div>
          </div>
          {campaign?.isDefault && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Using default — edit & save yours
            </span>
          )}
        </div>
        <div className="p-5 space-y-3">
          <Textarea
            value={campaignDraft}
            onChange={(e) => { setCampaignDraft(e.target.value); setCampaignDirty(true); }}
            placeholder="Write the exact message your leads should receive…"
            rows={5}
            maxLength={1000}
            className="bg-background/60 border-border resize-none text-sm leading-relaxed"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>
                Tip: type <code className="bg-muted px-1 rounded">{"{name}"}</code> to drop in each lead's first name automatically.
              </div>
              <div>{campaignDraft.length}/1000 characters · ~{Math.max(1, Math.ceil(campaignDraft.length / 160))} SMS segment(s)</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleResetCampaign} className="gap-1.5 text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to default
              </Button>
              <Button onClick={handleSaveCampaign} disabled={savingCampaign || !campaignDirty} size="sm" className="gap-1.5">
                {savingCampaign ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {savingCampaign ? "Saving…" : "Save campaign message"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden mt-4">
        {/* Left: Lead List */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="pl-8 h-8 text-sm bg-muted border-0"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No leads found</div>
            ) : (
              filteredLeads.map((lead) => {
                const active = selectedLeadId === lead.id;
                const leadMessages = (messages || []).filter((m) => m.leadId === lead.id);
                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors ${active ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{lead.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{lead.company || lead.email}</div>
                      </div>
                      {leadMessages.length > 0 && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                          {leadMessages.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        lead.status === "contacted" ? "bg-blue-500/10 text-blue-400" :
                        lead.status === "qualified" ? "bg-green-500/10 text-green-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {lead.status}
                      </span>
                      {lead.phone && <Phone className="w-3 h-3 text-muted-foreground" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Compose + History */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedLead ? (
            <>
              {/* Lead info bar */}
              <div className="px-6 py-3 border-b border-border bg-card/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{selectedLead.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{selectedLead.title || "Decision Maker"}</span>
                      {selectedLead.company && (
                        <>
                          <span>·</span>
                          <Building2 className="w-3 h-3" />
                          <span>{selectedLead.company}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedLead.email || "No email"}</span>
                  {selectedLead.phone && (
                    <>
                      <span>·</span>
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedLead.phone}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Channel tabs + compose */}
              <div className="p-6 space-y-4 border-b border-border">
                {/* Channel selector */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setChannel("email")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${channel === "email" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </button>
                  <button
                    onClick={() => setChannel("sms")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${channel === "sms" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    SMS
                    {!selectedLead.phone && <span className="text-[10px] opacity-60">(no phone)</span>}
                  </button>
                </div>

                {channel === "email" && (
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject (leave blank to let AI write it)"
                    className="bg-muted border-0"
                  />
                )}

                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={
                    channel === "email"
                      ? "Message body (leave blank — AI will write a personalized email based on your company profile)"
                      : "SMS text (leave blank to send your saved Campaign Message above)"
                  }
                  rows={4}
                  className="bg-muted border-0 resize-none"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {channel === "sms" ? (
                      <>
                        <Crown className="w-3 h-3 text-primary" />
                        <span>Leave blank to send your saved Campaign Message — never AI-generated</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-primary" />
                        <span>AI writes personalized content if fields left blank</span>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={isSending || (channel === "sms" && !selectedLead.phone)}
                    className="gap-2"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isSending ? "Sending…" : `Send ${channel === "email" ? "Email" : "SMS"}`}
                  </Button>
                </div>

                {/* Last receipt */}
                {lastReceipt && (
                  <div className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-3 ${lastReceipt.success ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    {lastReceipt.success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-medium">
                        {lastReceipt.success ? "Delivered" : "Delivery failed"}
                        {" · "}
                        <span className="font-normal text-muted-foreground capitalize">{lastReceipt.provider}</span>
                        {lastReceipt.providerId && (
                          <span className="font-mono text-xs text-muted-foreground"> · {lastReceipt.providerId}</span>
                        )}
                      </div>
                      <div className="text-muted-foreground">{lastReceipt.recipient}</div>
                      {lastReceipt.error && <div className="text-red-400 text-xs">{lastReceipt.error}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Message history */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Message History
                </h3>
                <div className="space-y-3">
                  {(messages || [])
                    .filter((m) => m.leadId === selectedLeadId)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((msg) => (
                      <div key={msg.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {msg.channel === "email" ? (
                              <Mail className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            )}
                            <span className="text-sm font-medium">{msg.subject || msg.channel.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              msg.status === "sent" ? "bg-blue-500/10 text-blue-400" :
                              msg.status === "replied" ? "bg-green-500/10 text-green-400" :
                              msg.status === "bounced" ? "bg-red-500/10 text-red-400" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {msg.status}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.body}</p>
                      </div>
                    ))}
                  {(messages || []).filter((m) => m.leadId === selectedLeadId).length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      No messages yet — send your first outreach above
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Select a lead to message</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose from the left panel. SMS sends your exact Campaign Message; emails can be AI-personalized.
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${deliveryConfig?.resend.domainVerified ? "bg-green-500" : "bg-amber-500"}`} />
                  {deliveryConfig?.resend.domainVerified ? "Email live via Resend" : "Email (pending domain)"}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${deliveryConfig?.twilio.configured ? "bg-blue-500" : "bg-amber-500"}`} />
                  {deliveryConfig?.twilio.configured ? "SMS live via Twilio" : "SMS (Twilio not set)"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Full delivery receipts
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
