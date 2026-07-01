export default function Slide2Product() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 60%, #120e00 0%, #080808 60%)" }} />
      <div className="absolute top-0 right-0 w-[1px] h-full" style={{ background: "linear-gradient(180deg, transparent, #d4af37 40%, transparent)" }} />

      <div className="relative z-10 flex flex-col h-full px-[8vw] py-[7vh]">
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
          <div style={{ width: "2vw", height: "1px", background: "#d4af37" }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#d4af37", letterSpacing: "0.2em", fontWeight: 500 }}>THE PRODUCT</p>
        </div>

        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "5vw", fontWeight: 700, color: "#f5f0e8", lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: "1vh" }}>
          Three Apps. One Complete Platform.
        </h2>
        <div style={{ width: "4vw", height: "2px", background: "#d4af37", marginBottom: "4.5vh" }} />

        <div style={{ display: "flex", gap: "2.5vw", flex: 1 }}>
          <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1e1a0e", borderTop: "3px solid #d4af37", padding: "3vh 2.5vw" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "1.5vh", fontWeight: 600 }}>WEB APP</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4vw", fontWeight: 700, color: "#f5f0e8", marginBottom: "2vh" }}>Marketing + Dashboard</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#8a7a5a", lineHeight: 1.6, fontWeight: 300 }}>Public landing page with pricing tiers, secure client dashboard, CRM pipeline, deal tracking, and proposal engine.</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", marginTop: "2vh", fontWeight: 400 }}>React + Vite</p>
          </div>

          <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1e1a0e", borderTop: "3px solid #d4af37", padding: "3vh 2.5vw" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "1.5vh", fontWeight: 600 }}>MOBILE APP</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4vw", fontWeight: 700, color: "#f5f0e8", marginBottom: "2vh" }}>iOS + Android</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#8a7a5a", lineHeight: 1.6, fontWeight: 300 }}>Full-featured mobile client with live revenue tracking, lead management, and SMS campaign controls on the go.</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", marginTop: "2vh", fontWeight: 400 }}>Expo (React Native)</p>
          </div>

          <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1e1a0e", borderTop: "3px solid #d4af37", padding: "3vh 2.5vw" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "1.5vh", fontWeight: 600 }}>API SERVER</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4vw", fontWeight: 700, color: "#f5f0e8", marginBottom: "2vh" }}>Autopilot Engine</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#8a7a5a", lineHeight: 1.6, fontWeight: 300 }}>Express REST API with Drizzle ORM, live Stripe billing, Twilio SMS campaigns, and automated lead nurturing.</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", marginTop: "2vh", fontWeight: 400 }}>Node.js + PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
