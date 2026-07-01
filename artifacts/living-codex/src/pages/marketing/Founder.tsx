import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import {
  MarketingLayout,
  Overline,
  Serif,
  Reveal,
  GlassCard,
  GOLD,
  SERIF,
} from "./MarketingLayout";

const doctrine = [
  { word: "Observe", body: "See the market clearly before acting. Signal over noise." },
  { word: "Understand", body: "Map relationships and incentives before competing." },
  { word: "Execute", body: "Move with discipline. Outcomes, not activity." },
  { word: "Create Value", body: "Build something measurable, durable, and profitable." },
];

const timeline = [
  {
    era: "1930s",
    title: "Betty Crocker",
    body: "A trusted voice that transformed how households made decisions — guidance reimagined as a brand.",
  },
  {
    era: "2025",
    title: "Elizabeth Rothchild",
    body: "Trusted guidance for entrepreneurs, powered by autonomous intelligence and Living Codex.",
  },
  {
    era: "Future",
    title: "Autonomous Venture Creation",
    body: "A world where intelligent systems help anyone turn ideas into profitable companies.",
  },
];

export default function Founder() {
  return (
    <MarketingLayout>
      {/* ── MAGAZINE HERO ── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 left-[-10%] h-[520px] w-[520px] rounded-full opacity-[0.14] blur-[140px]"
          style={{ background: GOLD }}
        />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-40 lg:px-10">
          <Reveal>
            <Overline>The Founder · A Premium Brand Feature</Overline>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              className="mt-8 max-w-5xl text-[3rem] leading-[0.98] tracking-tight text-[#f5f1e8] sm:text-7xl lg:text-[6rem]"
              style={{ fontFamily: SERIF }}
            >
              Why Elizabeth Rothchild Exists
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p
              className="mt-7 max-w-2xl text-2xl italic text-[#d4af37]"
              style={{ fontFamily: SERIF }}
            >
              The trusted intelligence platform for business creation.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── EDITORIAL BODY ── */}
      <section className="border-t border-[#d4af37]/15">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[0.35fr_0.65fr] lg:px-10">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-[#f5f1e8]/40">The Story</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-7 text-xl leading-relaxed text-[#f5f1e8]/75">
              <p>
                Most startups fail because they lack clarity, execution, and access to the right
                opportunities. <Serif className="italic text-[#d4af37]">Elizabeth Rothchild was created to change that.</Serif>
              </p>
              <p>
                Inspired by the power of trusted guidance and reimagined for the age of artificial
                intelligence, she is the public face of Living Codex — an autonomous venture
                platform designed to help entrepreneurs transform ideas into profitable businesses.
              </p>
              <p>
                Her role is not to tell people what they want to hear. It is to help them see what
                matters — and to turn that clarity into companies, revenue, and lasting enterprise
                value.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PULL QUOTE ── */}
      <section className="border-t border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-5xl px-6 py-28 text-center lg:px-10">
          <Reveal>
            <blockquote
              className="text-3xl leading-snug text-[#f5f1e8] lg:text-5xl lg:leading-[1.15]"
              style={{ fontFamily: SERIF }}
            >
              “Build real businesses. Create real revenue. Tell the truth.{" "}
              <span className="text-[#d4af37]">Own the future.</span>”
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ── THE DOCTRINE ── */}
      <section className="border-t border-[#d4af37]/15">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <Reveal>
            <Overline>The Elizabeth Rothchild Doctrine</Overline>
            <h2
              className="mt-6 max-w-2xl text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              Intelligence. Discipline. Measurable outcomes.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {doctrine.map((d, i) => (
              <Reveal key={d.word} delay={i * 0.1}>
                <GlassCard className="h-full p-8">
                  <span className="text-sm text-[#d4af37]/60" style={{ fontFamily: SERIF }}>
                    0{i + 1}
                  </span>
                  <h3 className="mt-10 text-3xl text-[#f5f1e8]" style={{ fontFamily: SERIF }}>
                    {d.word}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#f5f1e8]/55">{d.body}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="border-t border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <Reveal className="text-center">
            <Overline>The Lineage of Trust</Overline>
            <h2
              className="mx-auto mt-6 max-w-2xl text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              From household trust to business trust.
            </h2>
          </Reveal>

          <div className="relative mt-20">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/50 to-[#d4af37]/0 lg:block" />
            <div className="grid gap-12 lg:grid-cols-3">
              {timeline.map((t, i) => (
                <Reveal key={t.era} delay={i * 0.15} className="relative">
                  <div className="mb-8 flex items-center gap-4 lg:flex-col lg:items-start">
                    <span
                      className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#050505] text-sm font-semibold text-[#d4af37]"
                      style={{ fontFamily: SERIF, boxShadow: "0 0 30px rgba(212,175,55,0.2)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-3xl text-[#d4af37] lg:mt-6"
                      style={{ fontFamily: SERIF }}
                    >
                      {t.era}
                    </span>
                  </div>
                  <h3 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: SERIF }}>
                    {t.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#f5f1e8]/55">
                    {t.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#d4af37]/15">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:px-10">
          <Reveal>
            <h2
              className="text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              The mission continues.
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/mission"
                className="inline-flex items-center gap-2 border border-[#d4af37]/30 px-8 py-4 text-sm uppercase tracking-[0.16em] text-[#f5f1e8]/85 transition-colors hover:border-[#d4af37]/70 hover:text-[#f5f1e8]"
              >
                Read the Mission
              </Link>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
                style={{ background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)` }}
              >
                Enter the Platform
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
