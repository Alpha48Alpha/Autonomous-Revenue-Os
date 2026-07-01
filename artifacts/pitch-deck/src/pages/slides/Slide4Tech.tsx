export default function Slide4Tech() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 80%, #0e0a00 0%, #080808 55%)" }} />
      <div className="absolute top-0 right-0 w-[1px] h-full" style={{ background: "linear-gradient(180deg, transparent, #d4af37 50%, transparent)" }} />
      <div className="absolute top-0 left-[8vw] w-[1px] h-[30vh]" style={{ background: "linear-gradient(180deg, #d4af37, transparent)" }} />

      <div className="relative z-10 flex h-full">
        <div style={{ width: "42vw", padding: "7vh 0 7vh 8vw", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
            <div style={{ width: "2vw", height: "1px", background: "#d4af37" }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#d4af37", letterSpacing: "0.2em", fontWeight: 500 }}>TECH STACK</p>
          </div>

          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "4.8vw", fontWeight: 700, color: "#f5f0e8", lineHeight: 1.1, marginBottom: "1vh" }}>
            Production-Grade. No Technical Debt.
          </h2>
          <div style={{ width: "4vw", height: "2px", background: "#d4af37", marginBottom: "3.5vh" }} />

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300, marginBottom: "3vh" }}>
            Built on the most in-demand stack in modern SaaS. Any developer can pick this up and ship features day one.
          </p>

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#5a4e35", fontWeight: 400 }}>
            pnpm monorepo — all packages work together, no glue code needed.
          </p>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", padding: "6vh 6vw 6vh 4vw" }}>
          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2vw", borderLeft: "3px solid #d4af37" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "0.8vh", fontWeight: 600 }}>FRONTEND</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 700, color: "#f5f0e8" }}>React + Vite</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#5a4e35", fontWeight: 300 }}>TypeScript, Tailwind CSS</p>
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2vw", borderLeft: "3px solid #d4af37" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "0.8vh", fontWeight: 600 }}>MOBILE</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 700, color: "#f5f0e8" }}>Expo</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#5a4e35", fontWeight: 300 }}>React Native, iOS + Android</p>
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2vw", borderLeft: "3px solid #d4af37" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "0.8vh", fontWeight: 600 }}>BACKEND</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 700, color: "#f5f0e8" }}>Node.js + Express</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#5a4e35", fontWeight: 300 }}>REST API, Drizzle ORM</p>
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2vw", borderLeft: "3px solid #d4af37" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "0.8vh", fontWeight: 600 }}>DATABASE</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 700, color: "#f5f0e8" }}>PostgreSQL</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#5a4e35", fontWeight: 300 }}>Drizzle ORM, migrations</p>
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2vw", borderLeft: "3px solid #d4af37" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "0.8vh", fontWeight: 600 }}>PAYMENTS</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 700, color: "#f5f0e8" }}>Stripe</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#5a4e35", fontWeight: 300 }}>Live keys, 3 active price IDs</p>
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2vw", borderLeft: "3px solid #d4af37" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "0.8vh", fontWeight: 600 }}>OUTREACH</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 700, color: "#f5f0e8" }}>Twilio SMS</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#5a4e35", fontWeight: 300 }}>Campaign engine, built-in</p>
          </div>
        </div>
      </div>
    </div>
  );
}
