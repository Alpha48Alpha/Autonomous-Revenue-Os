import { useEffect, useState } from "react";
import { useGetBillingStatus, useSavePaymentLinks } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  CheckCircle2,
  Loader2,
  Zap,
  ShieldCheck,
  BarChart3,
  Cpu,
  ArrowRight,
  Link2,
  Settings2,
  ExternalLink,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

type PlanKey = "growth" | "scale" | "enterprise";

const PLANS: {
  key: PlanKey;
  name: string;
  price: number;
  desc: string;
  features: string[];
  highlight: boolean;
}[] = [
  {
    key: "growth",
    name: "Growth",
    price: 99,
    desc: "For founders and early-stage teams ready to automate outbound.",
    features: [
      "50 AI lead generations/month",
      "Real email delivery via Resend",
      "Delivery receipts & audit trail",
      "Deal pipeline (up to 25 deals)",
      "AI-written outreach messages",
    ],
    highlight: false,
  },
  {
    key: "scale",
    name: "Scale",
    price: 299,
    desc: "For growing teams with an active pipeline who need full automation.",
    features: [
      "Unlimited AI lead generation",
      "Real email + SMS delivery",
      "Full delivery receipts",
      "Unlimited deal pipeline",
      "AI-written email & SMS",
      "Company intelligence module",
    ],
    highlight: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 497,
    desc: "Full-platform autonomous revenue OS for serious revenue teams.",
    features: [
      "Everything in Scale",
      "Priority AI agent capacity",
      "Revenue analytics dashboard",
      "Kanban deal management",
      "Multi-agent proof-of-work log",
      "White-glove onboarding",
    ],
    highlight: false,
  },
];

export default function Billing() {
  const { data: status, isLoading, refetch } = useGetBillingStatus();
  const { mutateAsync: saveLinks, isPending: saving } = useSavePaymentLinks();
  const { toast } = useToast();

  const [showSetup, setShowSetup] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [links, setLinks] = useState<Record<PlanKey, string>>({
    growth: "",
    scale: "",
    enterprise: "",
  });

  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const success = urlParams?.get("success") === "true";
  const canceled = urlParams?.get("canceled") === "true";

  const serverLinks = status?.paymentLinks;
  const configuredCount = serverLinks
    ? [serverLinks.growth, serverLinks.scale, serverLinks.enterprise].filter(Boolean).length
    : 0;
  const anyConfigured = configuredCount > 0;

  useEffect(() => {
    if (serverLinks) {
      setLinks({
        growth: serverLinks.growth ?? "",
        scale: serverLinks.scale ?? "",
        enterprise: serverLinks.enterprise ?? "",
      });
    }
  }, [serverLinks?.growth, serverLinks?.scale, serverLinks?.enterprise]);

  const linkFor = (key: PlanKey): string | null => {
    const v = serverLinks?.[key];
    return v && v.length ? v : null;
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        toast({ title: "Couldn't open portal", description: data.error || "Try again in a moment.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Couldn't open portal", description: "Network error — try again.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSubscribe = (key: PlanKey) => {
    const link = linkFor(key);
    if (!link) {
      setShowSetup(true);
      toast({
        title: "Add your payment link",
        description: "Paste this plan's Stripe Payment Link below to start collecting payments — no code needed.",
      });
      requestAnimationFrame(() => {
        document.getElementById("payment-setup")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleSave = async () => {
    try {
      const result = await saveLinks({
        data: {
          growth: links.growth.trim() || null,
          scale: links.scale.trim() || null,
          enterprise: links.enterprise.trim() || null,
        },
      });
      setLinks({
        growth: result.growth ?? "",
        scale: result.scale ?? "",
        enterprise: result.enterprise ?? "",
      });
      await refetch();
      toast({
        title: "Payment links saved",
        description: "Your plans are now live. Customers can pay through Stripe instantly.",
      });
    } catch (err: any) {
      toast({
        title: "Couldn't save",
        description: err?.message || "Please check the URLs and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 lg:px-8 py-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          <Sparkles className="w-3 h-3" /> No-code payments
        </div>
        <h1 className="font-serif italic text-3xl lg:text-4xl font-bold tracking-tight text-white">
          Get paid in minutes — powered by Stripe
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Pick a plan to checkout securely. No card details ever touch this app — Stripe handles everything.
        </p>
      </div>

      {/* Banners */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold">Subscription activated!</div>
            <div className="text-sm text-green-400/70 mt-0.5">AI agents are now fully operational.</div>
          </div>
        </div>
      )}
      {canceled && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted border border-border">
          <CreditCard className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="text-sm text-muted-foreground">Checkout was canceled. Choose a plan below to continue.</div>
        </div>
      )}
      {status?.active && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <div className="font-bold text-green-400">Active subscription</div>
              {status.currentPeriodEnd && (
                <div className="text-xs text-green-400/70 mt-0.5">
                  Renews {new Date(status.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPortal}
            disabled={portalLoading}
            className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/10 shrink-0"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LayoutDashboard className="w-4 h-4" />
            )}
            Manage subscription
          </Button>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {PLANS.map((plan) => {
          const ready = !!linkFor(plan.key);
          return (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-6 space-y-5 flex flex-col transition-shadow ${
                plan.highlight
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:shadow-md"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.highlight ? "bg-primary" : "bg-muted"}`}>
                      <Zap className={`w-4 h-4 ${plan.highlight ? "text-white" : "text-muted-foreground"}`} />
                    </div>
                    <span className="font-bold text-base">{plan.name}</span>
                  </div>
                  {ready && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Live
                    </span>
                  )}
                </div>
                <div className="text-4xl font-extrabold tracking-tight">
                  ${plan.price}
                  <span className="text-base font-normal text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
              </div>

              <div className="flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-primary" : "text-green-500"}`} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {isLoading ? (
                <Button disabled className="w-full gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </Button>
              ) : status?.active ? (
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">Active</span>
                </div>
              ) : ready ? (
                <Button
                  onClick={() => handleSubscribe(plan.key)}
                  variant={plan.highlight ? "default" : "outline"}
                  className="w-full gap-2"
                  size="lg"
                >
                  Subscribe — ${plan.price}/mo <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe(plan.key)}
                  variant="outline"
                  className="w-full gap-2 border-dashed text-muted-foreground"
                  size="lg"
                >
                  <Link2 className="w-4 h-4" /> Connect payment link
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Owner payment setup */}
      <div id="payment-setup" className="rounded-2xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowSetup((s) => !s)}
          className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-muted/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Settings2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-bold text-sm">Payment setup (no code)</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {anyConfigured
                  ? `${configuredCount} of 3 plans connected`
                  : "Paste your Stripe Payment Links to start collecting money"}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-primary">{showSetup ? "Hide" : "Set up"}</span>
        </button>

        {showSetup && (
          <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">
            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>
                Open{" "}
                <a
                  href="https://dashboard.stripe.com/payment-links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  Stripe Payment Links <ExternalLink className="w-3 h-3" />
                </a>{" "}
                and click <span className="font-semibold text-foreground">+ New</span>.
              </li>
              <li>Create one link per plan (Growth $99, Scale $299, Enterprise $497, monthly).</li>
              <li>Copy each link and paste it below — then hit Save. That's it.</li>
            </ol>

            <div className="space-y-3">
              {PLANS.map((plan) => (
                <div key={plan.key} className="space-y-1.5">
                  <label className="text-xs font-semibold flex items-center gap-2">
                    {plan.name}{" "}
                    <span className="text-muted-foreground font-normal">${plan.price}/mo</span>
                  </label>
                  <Input
                    value={links[plan.key]}
                    onChange={(e) => setLinks((l) => ({ ...l, [plan.key]: e.target.value }))}
                    placeholder="https://buy.stripe.com/..."
                    className="font-mono text-xs"
                    inputMode="url"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Save payment links</>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Leave a field blank to disable that plan.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { icon: ShieldCheck, title: "Secure payments", desc: "Powered by Stripe. We never store card details." },
          { icon: Cpu, title: "Real AI infrastructure", desc: "GPT-powered agents, real email & SMS — not demos." },
          { icon: BarChart3, title: "Full audit trail", desc: "Every action logged with provider IDs and timestamps." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-start">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
