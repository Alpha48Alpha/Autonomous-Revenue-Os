import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import {
  MarketingLayout,
  Overline,
  Reveal,
  GlassCard,
  GOLD,
  SERIF,
} from "./MarketingLayout";

const owns = [
  "Our own relationship graph",
  "Our own CRM intelligence",
  "Our own messaging layer",
  "Our own opportunity engine",
  "Our own autonomous agent teams",
  "Our own revenue command center",
];

const flow = [
  { step: "01", title: "Signal Collection", body: "Monitor markets, customer conversations, and industry shifts." },
  { step: "02", title: "Analysis", body: "Identify opportunities competitors miss." },
  { step: "03", title: "Relationship Mapping", body: "Understand ecosystems and the real decision-makers." },
  { step: "04", title: "Strategic Outreach", body: "Highly targeted, personalized engagement." },
  { step: "05", title: "Feedback Loops", body: "Learn from every interaction." },
  { step: "06", title: "Rapid Adaptation", body: "Update campaigns based on evidence." },
];

export default function About() {
  return (
    <MarketingLayout>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-[-8%] top-0 h-[480px] w-[480px] rounded-full opacity-[0.12] blur-[140px]"
          style={{ background: GOLD }}
        />
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-40 lg:px-10">
          <Reveal>
            <Overline>About</Overline>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              className="mt-8 max-w-4xl text-[2.7rem] leading-[1.04] tracking-tight text-[#f5f1e8] sm:text-6xl lg:text-[4.6rem]"
              style={{ fontFamily: SERIF }}
            >
              An in-house autonomous business operating system.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#f5f1e8]/60">
              Living Codex helps startups discover opportunities, acquire customers, manage
              relationships, and generate profitable revenue — owning every layer of the stack
              instead of renting it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT WE OWN ── */}
      <section className="border-t border-[#d4af37]/15 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <Reveal>
            <Overline>What We Own</Overline>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {owns.map((item, i) => (
              <Reveal key={item} delay={i * 0.07}>
                <GlassCard className="p-8">
                  <span className="text-sm text-[#d4af37]/60" style={{ fontFamily: SERIF }}>
                    0{i + 1}
                  </span>
                  <p
                    className="mt-8 text-xl text-[#f5f1e8]"
                    style={{ fontFamily: SERIF }}
                  >
                    {item}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="border-t border-[#d4af37]/15">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <Reveal>
            <Overline>Modeled on an intelligence organization</Overline>
            <h2
              className="mt-6 max-w-2xl text-4xl tracking-tight text-[#f5f1e8] lg:text-5xl"
              style={{ fontFamily: SERIF }}
            >
              Sophisticated structure. Ethical execution.
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {flow.map((f, i) => (
              <Reveal key={f.step} delay={i * 0.08}>
                <div className="flex gap-6 border-b border-[#d4af37]/10 pb-8">
                  <span
                    className="text-3xl text-[#d4af37]/70"
                    style={{ fontFamily: SERIF }}
                  >
                    {f.step}
                  </span>
                  <div>
                    <h3 className="text-2xl text-[#f5f1e8]" style={{ fontFamily: SERIF }}>
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#f5f1e8]/55">{f.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
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
              Built to create value — and prove it.
            </h2>
            <Link
              href="/dashboard"
              className="mt-10 inline-flex items-center gap-2 rounded-sm px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
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
