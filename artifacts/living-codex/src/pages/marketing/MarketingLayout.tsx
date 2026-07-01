import { ReactNode, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, MotionConfig, useReducedMotion, useInView, animate } from "framer-motion";

const navLinks = [
  { href: "/platform", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/founder", label: "Founder" },
  { href: "/about", label: "About" },
  { href: "/mission", label: "Mission" },
];

export const GOLD = "#d4af37";
export const SERIF = "'Playfair Display', Georgia, serif";
export const SANS = "'Inter', sans-serif";

export function MarketingLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <MotionConfig reducedMotion="user">
    <div
      className="min-h-screen w-full bg-[#050505] text-[#f5f1e8] antialiased selection:bg-[#d4af37] selection:text-[#050505]"
      style={{ fontFamily: SANS }}
    >
      {/* ── NAV ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-[#d4af37]/15 bg-[#050505]/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#d4af37]/50 text-sm font-semibold text-[#d4af37]"
              style={{ fontFamily: SERIF }}
            >
              ER
            </span>
            <span className="text-[0.8rem] font-medium uppercase tracking-[0.38em] text-[#f5f1e8] transition-colors group-hover:text-[#d4af37]">
              Elizabeth&nbsp;Rothchild
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[0.72rem] uppercase tracking-[0.22em] transition-colors ${
                  location === l.href ? "text-[#d4af37]" : "text-[#f5f1e8]/55 hover:text-[#f5f1e8]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 rounded-sm px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#050505] transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.45)]"
              style={{ background: `linear-gradient(135deg, #f3dd8f, ${GOLD} 55%, #b8902b)` }}
            >
              Enter Platform
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </nav>

          <button className="text-[#f5f1e8] md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* ── MOBILE MENU ── */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#050505] px-6 py-5 md:hidden">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium uppercase tracking-[0.32em]">Elizabeth Rothchild</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-14 flex flex-col gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-4xl tracking-tight text-[#f5f1e8]/85"
                style={{ fontFamily: SERIF }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#050505]"
              style={{ background: GOLD }}
            >
              Enter Platform <ArrowUpRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}

      <main>{children}</main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#d4af37]/15 bg-[#050505]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md">
              <p className="text-4xl text-[#f5f1e8]" style={{ fontFamily: SERIF }}>
                Elizabeth Rothchild
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#f5f1e8]/45">
                The operating system for building profitable companies — powered by Living Codex.
                Intelligence, discipline, and execution.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-12 gap-y-3">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[0.72rem] uppercase tracking-[0.22em] text-[#f5f1e8]/50 transition-colors hover:text-[#d4af37]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-14 flex flex-col gap-2 border-t border-[#d4af37]/10 pt-8 text-xs text-[#f5f1e8]/35 md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} Living Codex — Autonomous Venture Intelligence.</span>
            <span className="italic" style={{ fontFamily: SERIF, fontSize: "0.95rem" }}>
              From uncertainty to measurable results.
            </span>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}

/* ───────────────────────── Shared primitives ───────────────────────── */

export function Overline({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[0.7rem] font-medium uppercase tracking-[0.42em] text-[#d4af37] ${className}`}>
      {children}
    </p>
  );
}

export function Serif({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span style={{ fontFamily: SERIF }} className={className}>
      {children}
    </span>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-md transition-all duration-500 hover:border-[#d4af37]/30 hover:bg-white/[0.04] ${className}`}
    >
      {children}
    </div>
  );
}

export function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
