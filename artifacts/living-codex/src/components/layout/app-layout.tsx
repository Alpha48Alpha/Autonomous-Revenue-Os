import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetSetup } from "@workspace/api-client-react";
import {
  Activity,
  Briefcase,
  Building2,
  FileText,
  MessageSquare,
  Receipt,
  Settings,
  Target,
  CreditCard,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/comms", label: "Outreach", icon: MessageSquare },
  { href: "/deals", label: "Pipeline", icon: Briefcase },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

const allNavGroups = [
  {
    label: "Command",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/setup", label: "Company Setup", icon: Settings },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/leads", label: "Leads", icon: Target },
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/deals", label: "Deal Pipeline", icon: Briefcase },
    ],
  },
  {
    label: "Comms Center",
    items: [
      { href: "/comms", label: "Outreach Hub", icon: MessageSquare },
      { href: "/transactions", label: "Delivery Receipts", icon: Receipt },
    ],
  },
  {
    label: "Revenue",
    items: [
      { href: "/proposals", label: "Proposals", icon: FileText },
      { href: "/activities", label: "Activity Log", icon: Activity },
      { href: "/billing", label: "Billing", icon: CreditCard },
    ],
  },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: profile } = useGetSetup();

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans dark">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col relative"
        style={{ background: "linear-gradient(180deg, #080808 0%, #060606 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Ambient top glow */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,120,50,0.07) 0%, transparent 70%)" }} />

        {/* Brand */}
        <Link href="/" className="relative h-[68px] flex items-center px-5 gap-3 hover:opacity-90 transition-opacity shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #ff7832 0%, #e05a1a 100%)" }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-serif italic text-[15px] font-semibold leading-tight text-white tracking-wide">
              Autonomous Revenue OS™
            </div>
            <div className="text-[10px] text-white/30 tracking-widest uppercase font-medium">
              Living Codex Platform
            </div>
          </div>
        </Link>

        {/* Company badge */}
        {profile?.companyName && (
          <Link href="/setup" className="mx-3 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl group transition-all shrink-0"
            style={{ background: "rgba(255,120,50,0.06)", border: "1px solid rgba(255,120,50,0.12)" }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,120,50,0.15)" }}>
              <Building2 className="w-3 h-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">Operating for</div>
              <div className="text-xs font-bold text-white truncate leading-tight">{profile.companyName}</div>
            </div>
            <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
          </Link>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {allNavGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        active
                          ? "text-white"
                          : "text-white/40 hover:text-white/70 hover:bg-white/4"
                      }`}
                      style={active ? {
                        background: "linear-gradient(90deg, rgba(255,120,50,0.14) 0%, rgba(255,120,50,0.04) 100%)",
                        borderLeft: "2px solid #ff7832",
                      } : { borderLeft: "2px solid transparent" }}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status footer */}
        <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-white/30 font-medium tracking-wide">Agents online</span>
          </div>
        </div>
      </aside>

      {/* ── MOBILE FULL-SCREEN MENU ── */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col"
          style={{ background: "#060606" }}>
          <div className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #ff7832, #e05a1a)" }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-serif italic text-base font-semibold text-white">Autonomous Revenue OS™</div>
                {profile?.companyName && (
                  <div className="text-xs text-white/40 font-medium">{profile.companyName}</div>
                )}
              </div>
            </div>
            <button onClick={() => setMenuOpen(false)}
              className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
            {allNavGroups.map((group) => (
              <div key={group.label}>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] px-3 mb-3">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-semibold transition-all ${
                          active ? "text-white" : "text-white/40 hover:text-white/70"
                        }`}
                        style={active ? {
                          background: "linear-gradient(90deg, rgba(255,120,50,0.14), rgba(255,120,50,0.04))",
                          borderLeft: "2px solid #ff7832",
                        } : {}}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${active ? "text-primary" : ""}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/30 font-medium">All AI agents online</span>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#070707" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff7832, #e05a1a)" }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-serif italic text-[15px] font-semibold text-white">Autonomous Revenue OS™</span>
              {profile?.companyName && (
                <div className="text-[10px] text-white/30 leading-none mt-0.5">{profile.companyName}</div>
              )}
            </div>
          </div>
          <button onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Menu className="w-5 h-5 text-white/60" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background pb-20 lg:pb-0">
          {children}
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
          style={{ background: "#070707", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-stretch">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all ${
                    active ? "text-primary" : "text-white/30"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active ? "bg-primary/10" : ""}`}>
                    <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? "text-primary" : ""}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
