import { useState } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Check, ArrowUpRight, Sparkles, ArrowLeft } from "lucide-react";
import {
  MarketingLayout,
  Overline,
  Reveal,
  GlassCard,
  GOLD,
  SERIF,
} from "./MarketingLayout";

const plans = [
  {
    id: "growth",
    name: "Growth",
    price: 99,
    tagline: "Launch your revenue engine.",
    features: [
      "AI lead generation — 100 leads/month",
      "Automated SMS outreach campaigns",
      "Email delivery & tracking",
      "Autopilot — runs every 2 hours",
      "Pipeline & deal tracking",
      "Activity feed & reporting",
    ],
    highlight: false,
    badge: null,
  },
  {
    id: "scale",
    name: "Scale",
    price: 299,
    tagline: "For serious revenue operators.",
    features: [
      "Everything in Growth",
      "AI lead generation — 500 leads/month",
      "Bulk SMS campaigns — unlimited",
      "Advanced analytics dashboard",
      "Custom SMS templates",
      "Priority support",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    tagline: "White-glove autonomous operations.",
    features: [
      "Everything in Scale",
      "Unlimited AI lead generation",
      "Dedicated outreach agents",
      "Custom integrations",
      "White-label option",
      "Direct line to Elizabeth",
    ],
    highlight: false,
    badge: null,
  },
];

function SuccessState({ plan }: { plan: string }) {
  const planName = plans.find((p) => p.id === plan)?.name || "your plan";
  return (
    <MarketingLayout>
      <section className="flex min-h-screen items-center justify-center px-6">
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.15] blur-[130px]"
          style={{ background: GOLD }}
        />
        <Reveal>
          <div className="relative mx-auto max-w-lg text-center">
            <div
              className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/40"
              style={{ background: "rgba(212,175,55,0.08)" }}
            >
              <Sparkles className="h-9 w-9 text-[#d4af37]" />
            </div>
            <Overline className="text-center">Welcome</Overline>
            <h1
              className="mt-6 text-4xl leading-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              You're inside the{" "}
              <span className="italic text-[#d4af37]">{planName} OS.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#f5f1e8]/60">
              Your subscription is active. Elizabeth's revenue engine is now
              running on your behalf. Go to your dashboard to activate the
              autopilot.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
                style={{
                  background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)`,
                }}
              >
                Enter Platform
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </MarketingLayout>
  );
}

function CanceledState() {
  return (
    <MarketingLayout>
      <section className="flex min-h-screen items-center justify-center px-6">
        <Reveal>
          <div className="mx-auto max-w-lg text-center">
            <Overline className="text-center">No problem</Overline>
            <h1
              className="mt-6 text-4xl leading-tight text-[#f5f1e8]"
              style={{ fontFamily: SERIF }}
            >
              Whenever you're ready.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#f5f1e8]/60">
              Your spot is here when you are. Take a look at the plans below and
              start when it feels right.
            </p>
            <Link
              href="/pricing"
              className="mt-10 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#d4af37]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to plans
            </Link>
          </div>
        </Reveal>
      </section>
    </MarketingLayout>
  );
}

export default function Pricing() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isSuccess = params.get("success") === "true";
  const isCanceled = params.get("canceled") === "true";
  const successPlan = params.get("plan") || "";

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isSuccess) return <SuccessState plan={successPlan} />;
  if (isCanceled) return <CanceledState />;

  async function handleCheckout(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          successPath: "/pricing",
          cancelPath: "/pricing",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(
          data.error || "Unable to start checkout. Please try again."
        );
        setLoading(null);
      }
    } catch {
      setError("Network error — please try again.");
      setLoading(null);
    }
  }

  return (
    <MarketingLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-36 pb-20">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.15] blur-[130px]"
          style={{ background: GOLD }}
        />
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-10">
          <Reveal>
            <Overline>Investment</Overline>
            <h1
              className="mx-auto mt-6 max-w-3xl text-5xl leading-[1.05] tracking-tight text-[#f5f1e8] lg:text-6xl"
              style={{ fontFamily: SERIF }}
            >
              Choose your{" "}
              <span className="italic text-[#d4af37]">operating system.</span>
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-[#f5f1e8]/55">
              Every plan includes the full autonomous revenue engine. Pick the
              scale that matches where you're going — not where you've been.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── PLAN CARDS ── */}
      <section className="relative pb-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mb-10 max-w-xl rounded-sm border border-red-500/30 bg-red-500/10 px-6 py-4 text-center text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.1}>
                <div
                  className={`relative flex h-full flex-col rounded-xl border transition-all duration-500 ${
                    plan.highlight
                      ? "border-[#d4af37]/50 bg-[#d4af37]/[0.04] shadow-[0_0_60px_rgba(212,175,55,0.12)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-[#d4af37]/25"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span
                        className="rounded-sm px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#050505]"
                        style={{
                          background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)`,
                        }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-8">
                    <div>
                      <p
                        className="text-2xl text-[#f5f1e8]"
                        style={{ fontFamily: SERIF }}
                      >
                        {plan.name}
                      </p>
                      <p className="mt-1 text-sm text-[#f5f1e8]/45">
                        {plan.tagline}
                      </p>
                      <div className="mt-7 flex items-end gap-1">
                        <span
                          className="text-5xl text-[#d4af37]"
                          style={{ fontFamily: SERIF }}
                        >
                          ${plan.price}
                        </span>
                        <span className="mb-2 text-sm text-[#f5f1e8]/40">
                          /mo
                        </span>
                      </div>
                    </div>

                    <div className="my-8 h-px bg-[#d4af37]/15" />

                    <ul className="flex flex-1 flex-col gap-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-3">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]"
                            strokeWidth={2.5}
                          />
                          <span className="text-sm leading-snug text-[#f5f1e8]/65">
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loading !== null}
                      className={`group mt-10 inline-flex w-full items-center justify-center gap-2 rounded-sm px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] transition-all disabled:opacity-60 ${
                        plan.highlight
                          ? "text-[#050505] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
                          : "border border-[#d4af37]/40 text-[#d4af37] hover:border-[#d4af37] hover:bg-[#d4af37]/5"
                      }`}
                      style={
                        plan.highlight
                          ? {
                              background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)`,
                            }
                          : undefined
                      }
                    >
                      {loading === plan.id ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Preparing checkout…
                        </span>
                      ) : (
                        <>
                          Get Started
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* guarantee */}
          <Reveal delay={0.3}>
            <div className="mt-16 text-center">
              <p className="text-sm text-[#f5f1e8]/40">
                All plans are month-to-month. Cancel anytime. Payments secured by Stripe.
              </p>
              <p
                className="mt-4 text-xl italic text-[#f5f1e8]/60"
                style={{ fontFamily: SERIF }}
              >
                "Build systems that create income, not chase it."
              </p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.3em] text-[#d4af37]/60">
                — Elizabeth Rothchild
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
