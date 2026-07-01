import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  LineChart,
  Compass,
  TrendingUp,
  Network,
  Brain,
  Gauge,
} from "lucide-react";
import {
  MarketingLayout,
  Overline,
  Reveal,
  GlassCard,
  GOLD,
  SERIF,
} from "./MarketingLayout";

const capabilities = [
  "Opportunity Intelligence",
  "Relationship Intelligence",
  "Autonomous Outreach",
  "Revenue Operations",
  "Executive Decision Support",
];

const agents = [
  {
    icon: LineChart,
    title: "Market Intelligence Agent",
    body: "Finds demand, competitors, trends, and revenue openings before anyone else sees them.",
  },
  {
    icon: Compass,
    title: "Opportunity Agent",
    body: "Discovers customers, sponsors, investors, grants, and partners worth pursuing.",
  },
  {
    icon: Network,
    title: "Relationship Agent",
    body: "Maps who knows whom and identifies the warmest path to every introduction.",
  },
  {
    icon: TrendingUp,
    title: "Revenue Agent",
    body: "Builds pipeline, drafts proposals, and drives conversion to closed revenue.",
  },
];

export default function Platform() {
  const reduce = useReducedMotion();
  return (
    <MarketingLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute right-[-5%] top-0 h-[520px] w-[520px] rounded-full opacity-[0.13] blur-[140px]"
          style={{ background: GOLD }}
        />
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-40 lg:px-10">
          <Reveal>
            <Overline>The Platform · Living Codex</Overline>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              className="mt-8 max-w-4xl text-[2.9rem] leading-[1.0] tracking-tight text-[#f5f1e8] sm:text-6xl lg:text-[5rem]"
              style={{ fontFamily: SERIF }}
            >
              The Autonomous Venture Engine.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#f5f1e8]/60">
              One operating system that combines opportunity intelligence, relationship
              intelligence, outreach, and revenue operations — coordinating AI agents that
              execute like an elite business team.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CAPABILITY STACK ── */}
      <section className="border-y border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
            {capabilities.map((c, i) => (
              <Reveal key={c} delay={i * 0.06}>
                <span className="flex items-center gap-3">
                  <span
                    className="text-lg text-[#f5f1e8]/80 lg:text-2xl"
                    style={{ fontFamily: SERIF }}
                  >
                    {c}
                  </span>
                  {i < capabilities.length - 1 && (
                    <span className="text-[#d4af37]/50">·</span>
                  )}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE DIAGRAM ── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <Reveal className="text-center">
            <Overline>System Architecture</Overline>
            <h2
              className="mx-auto mt-6 max-w-2xl text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              One command layer. Every agent. Real revenue.
            </h2>
          </Reveal>

          <div className="relative mt-20">
            {/* Command core */}
            <Reveal className="flex justify-center">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: `0 0 60px ${GOLD}`, opacity: reduce ? 0.4 : undefined }}
                  animate={reduce ? undefined : { opacity: [0.3, 0.7, 0.3] }}
                  transition={reduce ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#0c0c0c] text-center">
                  <Brain className="h-7 w-7 text-[#d4af37]" strokeWidth={1.4} />
                  <span
                    className="mt-2 text-xs uppercase tracking-[0.18em] text-[#f5f1e8]/70"
                  >
                    Command
                    <br />
                    Layer
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Connector */}
            <div className="mx-auto my-2 h-12 w-px bg-gradient-to-b from-[#d4af37]/50 to-[#d4af37]/0" />

            {/* Agent grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {agents.map((a, i) => {
                const Icon = a.icon;
                return (
                  <Reveal key={a.title} delay={i * 0.1}>
                    <GlassCard className="h-full p-10">
                      <div className="flex items-start gap-5">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/30 bg-[#0c0c0c]"
                          style={{ boxShadow: "inset 0 0 24px rgba(212,175,55,0.08)" }}
                        >
                          <Icon className="h-6 w-6 text-[#d4af37]" strokeWidth={1.4} />
                        </div>
                        <div>
                          <h3
                            className="text-2xl text-[#f5f1e8]"
                            style={{ fontFamily: SERIF }}
                          >
                            {a.title}
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-[#f5f1e8]/55">
                            {a.body}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </Reveal>
                );
              })}
            </div>

            {/* Connector down to revenue */}
            <div className="mx-auto my-2 h-12 w-px bg-gradient-to-b from-[#d4af37]/0 to-[#d4af37]/50" />

            <Reveal className="flex justify-center">
              <div className="flex items-center gap-4 rounded-full border border-[#d4af37]/30 bg-[#0c0c0c] px-8 py-4">
                <Gauge className="h-6 w-6 text-[#d4af37]" strokeWidth={1.4} />
                <span
                  className="text-xl text-[#f5f1e8]"
                  style={{ fontFamily: SERIF }}
                >
                  Revenue Command Center
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:px-10">
          <Reveal>
            <h2
              className="text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              See the command center live.
            </h2>
            <Link
              href="/dashboard"
              className="mt-10 inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
              style={{ background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)` }}
            >
              Enter the Platform
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
