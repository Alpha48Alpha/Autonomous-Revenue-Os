import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import {
  MarketingLayout,
  Overline,
  Serif,
  Reveal,
  Counter,
  GOLD,
  SERIF,
} from "./MarketingLayout";

const goals = [
  "Discover opportunities earlier",
  "Build stronger relationships",
  "Acquire customers more efficiently",
  "Generate sustainable revenue",
  "Scale intelligently",
];

const success = [
  { to: 100, suffix: "%", label: "Outcome-driven" },
  { to: 6, label: "Intelligence agents" },
  { to: 24, suffix: "/7", label: "Autonomous execution" },
  { to: 0, prefix: "$", suffix: "K", label: "Wasted on noise" },
];

export default function Mission() {
  return (
    <MarketingLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-[-20%] right-0 h-[520px] w-[520px] rounded-full opacity-[0.13] blur-[150px]"
          style={{ background: GOLD }}
        />
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-40 lg:px-10">
          <Reveal>
            <Overline>The Mission</Overline>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              className="mt-8 max-w-4xl text-[2.9rem] leading-[1.0] tracking-tight text-[#f5f1e8] sm:text-6xl lg:text-[5.4rem]"
              style={{ fontFamily: SERIF }}
            >
              Build the system that helps{" "}
              <span className="italic text-[#d4af37]">build companies.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[#f5f1e8]/60">
              Living Codex exists to turn zero-revenue startups into profitable businesses through
              autonomous intelligence, relationship mapping, opportunity discovery, outreach, CRM
              execution, and revenue operations.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT SUCCESS LOOKS LIKE ── */}
      <section className="border-y border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <Reveal>
            <p className="text-center text-[0.72rem] uppercase tracking-[0.4em] text-[#f5f1e8]/40">
              What success looks like
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-y-12 md:grid-cols-4">
            {success.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="text-center">
                <div className="text-5xl text-[#d4af37] lg:text-6xl" style={{ fontFamily: SERIF }}>
                  <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="mt-3 text-xs uppercase tracking-[0.2em] text-[#f5f1e8]/50">
                  {s.label}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOALS ── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr]">
            <Reveal>
              <Overline>Strategic Mission</Overline>
              <p className="mt-6 max-w-xs text-base leading-relaxed text-[#f5f1e8]/55">
                We help founders, innovators, and organizations move with the discipline of an
                intelligence agency and the speed of automation.
              </p>
            </Reveal>
            <ul className="flex flex-col">
              {goals.map((g, i) => (
                <Reveal key={g} delay={i * 0.08}>
                  <li className="flex items-baseline gap-6 border-b border-[#d4af37]/10 py-6">
                    <span className="text-sm text-[#d4af37]/70" style={{ fontFamily: SERIF }}>
                      0{i + 1}
                    </span>
                    <span
                      className="text-2xl text-[#f5f1e8] lg:text-3xl"
                      style={{ fontFamily: SERIF }}
                    >
                      {g}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── VISION ── */}
      <section className="relative overflow-hidden border-t border-[#d4af37]/15 bg-[#080808]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.16), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center lg:px-10">
          <Reveal>
            <Overline>Vision</Overline>
            <p
              className="mx-auto mt-8 max-w-3xl text-3xl leading-snug text-[#f5f1e8] lg:text-[2.9rem] lg:leading-[1.15]"
              style={{ fontFamily: SERIF }}
            >
              The world's most effective autonomous venture operating system — turning ideas into
              companies, companies into revenue, and revenue into long-term enterprise value.
            </p>
            <p className="mt-8 text-lg text-[#f5f1e8]/50">
              Not through hype. Not through noise. Through{" "}
              <Serif className="italic text-[#d4af37]">intelligence, execution, and truth.</Serif>
            </p>
            <Link
              href="/dashboard"
              className="mt-12 inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
              style={{ background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)` }}
            >
              Enter the Platform <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
