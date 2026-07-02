import { useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  Radar,
  Network,
  Send,
  TrendingUp,
  Users,
  Crown,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  MarketingLayout,
  Overline,
  Serif,
  Reveal,
  GlassCard,
  Counter,
  GOLD,
  SERIF,
} from "./MarketingLayout";

const flow = [
  { icon: Radar, label: "Opportunity", note: "Signal detected across markets, funding, and demand." },
  { icon: Network, label: "Relationship Graph", note: "Ecosystems mapped to the real decision-makers." },
  { icon: Send, label: "Outreach Agent", note: "Personalized engagement, executed autonomously." },
  { icon: TrendingUp, label: "Revenue Agent", note: "Pipeline built, proposals drafted, deals advanced." },
  { icon: Users, label: "Customer", note: "Acquired through evidence, not noise." },
  { icon: Crown, label: "Profit", note: "Measured, compounding, sustainable." },
];

const outcomes = [
  { to: 1240, suffix: "+", label: "Opportunities discovered" },
  { to: 480, suffix: "+", label: "Leads generated" },
  { to: 96, suffix: "+", label: "Meetings booked" },
  { to: 38, suffix: "+", label: "Customers acquired" },
];

const doctrine = ["Observe.", "Understand.", "Execute.", "Create Value."];

function scrollToVision() {
  document.getElementById("vision")?.scrollIntoView({ behavior: "smooth" });
}

type DemoLead = {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  score?: number;
  notes?: string;
};

// Live demo: generates real B2B leads via the Gemini-powered AI agent.
// Payment is bypassed (no Stripe key configured), and a demo company profile
// is auto-created if one doesn't exist yet, so anyone can click and test it.
function LiveAITest() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [error, setError] = useState("");

  async function run() {
    setState("loading");
    setError("");
    setLeads([]);
    try {
      // Ensure a company profile exists (required by the lead-gen agent).
      const existing = await fetch("/api/setup").then((r) => (r.ok ? r.json() : null));
      if (!existing) {
        await fetch("/api/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: "Autonomous Revenue OS",
            industry: "AI SaaS",
            targetMarket: "B2B SaaS founders",
            description: "Autonomous venture operating system",
            valueProp: "AI agents that discover leads and run revenue on autopilot",
            icp: "Seed-stage B2B SaaS founders, 5–50 employees",
          }),
        });
      }

      const res = await fetch("/api/agents/generate-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed (HTTP ${res.status})`);
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setState("done");
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      setState("error");
    }
  }

  return (
    <section className="relative overflow-hidden border-t border-[#d4af37]/15 bg-[#080808]">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.12] blur-[130px]"
        style={{ background: GOLD }}
      />
      <div className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-10">
        <Reveal>
          <Overline>Live System · Try It Now</Overline>
          <h2
            className="mx-auto mt-6 max-w-3xl text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
            style={{ fontFamily: SERIF }}
          >
            Watch the AI generate real leads.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#f5f1e8]/55">
            No signup. No payment. Click below and the research agent will discover
            three B2B leads live — powered by AI.
          </p>

          <button
            onClick={run}
            disabled={state === "loading"}
            className="group mt-10 inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] disabled:cursor-not-allowed disabled:opacity-70"
            style={{ background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)` }}
          >
            {state === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Live Leads
              </>
            )}
          </button>
          <p className="mt-4 text-[0.7rem] uppercase tracking-[0.25em] text-[#f5f1e8]/35">
            Demo mode · payment bypassed
          </p>
        </Reveal>

        {state === "error" && (
          <div className="mx-auto mt-10 flex max-w-xl items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-5 text-left">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-300">Couldn’t generate leads</p>
              <p className="mt-1 text-sm text-[#f5f1e8]/60">{error}</p>
            </div>
          </div>
        )}

        {state === "done" && leads.length > 0 && (
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            {leads.map((lead, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <GlassCard className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg text-[#f5f1e8]" style={{ fontFamily: SERIF }}>
                      {lead.name || "Lead"}
                    </p>
                    {typeof lead.score === "number" && (
                      <span className="rounded-full border border-[#d4af37]/40 px-2.5 py-0.5 text-xs text-[#d4af37]">
                        {lead.score}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#f5f1e8]/70">
                    {lead.title}
                    {lead.title && lead.company ? " · " : ""}
                    {lead.company}
                  </p>
                  {lead.notes && (
                    <p className="mt-3 text-sm leading-snug text-[#f5f1e8]/45">{lead.notes}</p>
                  )}
                  {(lead.email || lead.phone) && (
                    <p className="mt-3 truncate text-xs text-[#d4af37]/70">
                      {lead.email || lead.phone}
                    </p>
                  )}
                </GlassCard>
              </Reveal>
            ))}
          </div>
        )}

        {state === "done" && leads.length === 0 && (
          <p className="mt-8 text-sm text-[#f5f1e8]/50">
            The agent ran but returned no leads. Try again.
          </p>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const reduce = useReducedMotion();
  return (
    <MarketingLayout>
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[-10%] h-[700px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.18] blur-[140px]"
          style={{ background: GOLD }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,241,232,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,241,232,0.6) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Overline>Elizabeth Rothchild · Living Codex</Overline>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-5xl text-[2.9rem] leading-[1.02] tracking-tight text-[#f5f1e8] sm:text-6xl lg:text-[5.2rem]"
            style={{ fontFamily: SERIF }}
          >
            The operating system for building{" "}
            <span className="italic text-[#d4af37]">profitable companies.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-9 max-w-2xl text-lg leading-relaxed text-[#f5f1e8]/60"
          >
            Not another startup platform. Not another CRM. A company-building intelligence
            system that discovers opportunities, builds relationships, and executes revenue —
            autonomously.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            className="mt-12 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/pricing"
              className="group inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
              style={{ background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)` }}
            >
              View Plans &amp; Pricing
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <button
              onClick={scrollToVision}
              className="inline-flex items-center gap-2 border border-[#d4af37]/30 px-8 py-4 text-sm uppercase tracking-[0.16em] text-[#f5f1e8]/80 transition-colors hover:border-[#d4af37]/70 hover:text-[#f5f1e8]"
            >
              Watch the Vision
            </button>
          </motion.div>
        </div>
        <motion.button
          onClick={scrollToVision}
          aria-label="Scroll to vision"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#d4af37]/60"
          animate={reduce ? undefined : { y: [0, 10, 0] }}
          transition={reduce ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-5 w-5" />
        </motion.button>
      </section>

      {/* ───────────────── PROOF OF WORK ───────────────── */}
      <section className="border-y border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <Reveal>
            <p className="text-center text-[0.72rem] uppercase tracking-[0.4em] text-[#f5f1e8]/40">
              Every action measured by outcomes
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-y-12 md:grid-cols-4">
            {outcomes.map((o, i) => (
              <Reveal key={o.label} delay={i * 0.08} className="text-center">
                <div className="text-5xl text-[#d4af37] lg:text-6xl" style={{ fontFamily: SERIF }}>
                  <Counter to={o.to} suffix={o.suffix} />
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f5f1e8]/50">
                  {o.label}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── VISION / LIVING CODEX NETWORK ───────────────── */}
      <section id="vision" className="relative overflow-hidden scroll-mt-24">
        <div
          className="pointer-events-none absolute right-[-10%] top-1/3 h-[480px] w-[480px] rounded-full opacity-[0.12] blur-[130px]"
          style={{ background: GOLD }}
        />
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <Reveal>
                <Overline>The Living Codex</Overline>
                <h2
                  className="mt-6 text-4xl leading-[1.08] tracking-tight text-[#f5f1e8] lg:text-5xl"
                  style={{ fontFamily: SERIF }}
                >
                  A single intelligence system, from signal to profit.
                </h2>
                <p className="mt-6 max-w-md text-base leading-relaxed text-[#f5f1e8]/55">
                  Living Codex unifies opportunity intelligence, relationship intelligence,
                  autonomous outreach, and revenue operations into one operating system —
                  engineered to move a company from uncertainty to measurable results.
                </p>
                <Link
                  href="/platform"
                  className="group mt-10 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#d4af37]"
                >
                  Explore the platform
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Reveal>
            </div>

            {/* Animated vertical pipeline */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-[#d4af37]/0 via-[#d4af37]/40 to-[#d4af37]/0 md:left-[31px]" />
              <motion.div
                className="absolute left-[24px] h-3 w-3 rounded-full md:left-[28px]"
                style={{ background: GOLD, boxShadow: `0 0 18px ${GOLD}`, top: reduce ? "48%" : undefined }}
                animate={reduce ? undefined : { top: ["3%", "94%"] }}
                transition={reduce ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="flex flex-col gap-4">
                {flow.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <Reveal key={step.label} delay={i * 0.1}>
                      <GlassCard className="flex items-center gap-5 p-5">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/30 bg-[#0c0c0c]"
                          style={{ boxShadow: "inset 0 0 24px rgba(212,175,55,0.08)" }}
                        >
                          <Icon className="h-6 w-6 text-[#d4af37]" strokeWidth={1.4} />
                        </div>
                        <div>
                          <p className="text-xl text-[#f5f1e8]" style={{ fontFamily: SERIF }}>
                            {step.label}
                          </p>
                          <p className="mt-1 text-sm leading-snug text-[#f5f1e8]/50">{step.note}</p>
                        </div>
                      </GlassCard>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── THE DOCTRINE ───────────────── */}
      <section className="border-t border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <Reveal className="text-center">
            <Overline>The Elizabeth Rothchild Doctrine</Overline>
            <h2
              className="mx-auto mt-6 max-w-3xl text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              A philosophy of growth built on discipline.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-[#d4af37]/15 bg-[#d4af37]/10 sm:grid-cols-2 lg:grid-cols-4">
            {doctrine.map((word, i) => (
              <Reveal key={word} delay={i * 0.08}>
                <div className="flex h-full flex-col justify-between bg-[#080808] p-8">
                  <span className="text-sm text-[#d4af37]/60" style={{ fontFamily: SERIF }}>
                    0{i + 1}
                  </span>
                  <p
                    className="mt-12 text-3xl text-[#f5f1e8] lg:text-4xl"
                    style={{ fontFamily: SERIF }}
                  >
                    {word}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FOUNDER MYTHOLOGY ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <Overline>Why Elizabeth Rothchild Exists</Overline>
              <h2
                className="mt-6 text-4xl leading-[1.1] tracking-tight text-[#f5f1e8] lg:text-5xl"
                style={{ fontFamily: SERIF }}
              >
                The Betty Crocker model transformed household trust.
                <span className="block italic text-[#d4af37]">
                  Elizabeth Rothchild transforms business trust.
                </span>
              </h2>
              <p className="mt-7 max-w-lg text-base leading-relaxed text-[#f5f1e8]/55">
                A trusted guide for entrepreneurs navigating uncertainty, opportunity, and
                growth — reimagined for the age of artificial intelligence.
              </p>
              <Link
                href="/founder"
                className="group mt-10 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#d4af37]"
              >
                Read the founder story
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Reveal>
            <Reveal delay={0.15}>
              <GlassCard className="p-10">
                <blockquote
                  className="text-3xl leading-snug text-[#f5f1e8] lg:text-[2.4rem]"
                  style={{ fontFamily: SERIF }}
                >
                  “Entrepreneurs do not need more noise. They need{" "}
                  <span className="text-[#d4af37]">clarity</span>. They need{" "}
                  <span className="text-[#d4af37]">execution</span>.”
                </blockquote>
                <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#f5f1e8]/45">
                  — The Elizabeth Rothchild Doctrine
                </p>
              </GlassCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── MANIFESTO CLOSE ───────────────── */}
      <section className="relative overflow-hidden border-t border-[#d4af37]/15">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 120%, rgba(212,175,55,0.18), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center lg:px-10">
          <Reveal>
            <Overline>The Future</Overline>
            <p
              className="mx-auto mt-8 max-w-3xl text-3xl leading-snug text-[#f5f1e8] lg:text-[2.9rem] lg:leading-[1.15]"
              style={{ fontFamily: SERIF }}
            >
              A world where every entrepreneur has access to intelligent systems capable of
              turning ideas into companies, and companies into profit.
            </p>
            <p className="mt-8 text-lg text-[#f5f1e8]/50">
              Not through hype. Through{" "}
              <Serif className="italic text-[#d4af37]">intelligence, discipline, and execution.</Serif>
            </p>
            <Link
              href="/pricing"
              className="mt-12 inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
              style={{ background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)` }}
            >
              View Plans &amp; Pricing <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── LIVE AI TEST (above footer) ───────────────── */}
      <LiveAITest />
    </MarketingLayout>
  );
}
