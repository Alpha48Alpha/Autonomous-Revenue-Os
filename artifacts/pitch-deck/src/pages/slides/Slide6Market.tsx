export default function Slide6Market() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1200 0%, #080808 50%)" }} />
      <div className="absolute left-0 top-0 w-full h-[2px]" style={{ background: "linear-gradient(90deg, #d4af37, transparent 70%)" }} />

      <div className="relative z-10 flex h-full">
        <div style={{ width: "48vw", padding: "7vh 5vw 7vh 8vw", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
            <div style={{ width: "2vw", height: "1px", background: "#d4af37" }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#d4af37", letterSpacing: "0.2em", fontWeight: 500 }}>THE OPPORTUNITY</p>
          </div>

          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "4.8vw", fontWeight: 700, color: "#f5f0e8", lineHeight: 1.1, marginBottom: "1vh" }}>
            AI Revenue Automation Is the New CRM.
          </h2>
          <div style={{ width: "4vw", height: "2px", background: "#d4af37", marginBottom: "3.5vh" }} />

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300, marginBottom: "3vh" }}>
            Solo operators, coaches, and agencies are paying $99–$500/month for tools that help them run sales on autopilot. This platform combines CRM, outreach, billing, and mobile — in one white-label-ready product.
          </p>

          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#5a4e35", fontWeight: 400, lineHeight: 1.6 }}>
            The brand, domain, and codebase transfer in full. Rebrand, niche it down, or sell it as-is.
          </p>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "2.5vh", padding: "7vh 7vw 7vh 3vw" }}>
          <div style={{ background: "#0f0c02", border: "1px solid #2a2200", padding: "3.5vh 3vw", textAlign: "center" }}>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "6vw", fontWeight: 900, color: "#d4af37", lineHeight: 1 }}>$99</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8a7a5a", letterSpacing: "0.1em", marginTop: "0.5vh" }}>ENTRY PRICE POINT</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", marginTop: "0.5vh" }}>lower barrier than most competitors</p>
          </div>

          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "3.5vh 3vw", textAlign: "center" }}>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "6vw", fontWeight: 900, color: "#f5f0e8", lineHeight: 1 }}>10</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8a7a5a", letterSpacing: "0.1em", marginTop: "0.5vh" }}>SCALE CUSTOMERS</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", marginTop: "0.5vh" }}>= $2,990/mo recurring</p>
          </div>
        </div>
      </div>
    </div>
  );
}
