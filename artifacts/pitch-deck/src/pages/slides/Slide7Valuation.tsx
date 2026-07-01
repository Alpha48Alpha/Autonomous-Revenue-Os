export default function Slide7Valuation() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, #150f00 0%, #080808 60%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 100% 100%, #0e0800 0%, transparent 50%)" }} />

      <div className="relative z-10 flex flex-col h-full px-[8vw] py-[7vh]">
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
          <div style={{ width: "2vw", height: "1px", background: "#d4af37" }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#d4af37", letterSpacing: "0.2em", fontWeight: 500 }}>VALUATION</p>
        </div>

        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "4.8vw", fontWeight: 700, color: "#f5f0e8", lineHeight: 1.1, marginBottom: "1vh" }}>
          Asset Sale. Day-One Ready.
        </h2>
        <div style={{ width: "4vw", height: "2px", background: "#d4af37", marginBottom: "4vh" }} />

        <div style={{ display: "flex", gap: "3vw", marginBottom: "4vh" }}>
          <div style={{ flex: 2, background: "#0f0c02", border: "2px solid #d4af37", padding: "4vh 4vw", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8a7a5a", letterSpacing: "0.15em", marginBottom: "1vh", fontWeight: 600 }}>ASKING PRICE</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "10vw", fontWeight: 900, color: "#d4af37", lineHeight: 0.9 }}>$75K</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", marginTop: "1.5vh", fontWeight: 300 }}>Full transfer of code, brand, leads, and credentials</p>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2.5vw", borderLeft: "3px solid #d4af37" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#5a4e35", letterSpacing: "0.12em", marginBottom: "0.5vh" }}>REBUILD COST</p>
              <p style={{ fontFamily: "Playfair Display, serif", fontSize: "3vw", fontWeight: 700, color: "#f5f0e8" }}>$80–120K</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", fontWeight: 300 }}>to replicate from scratch</p>
            </div>
            <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "2.5vh 2.5vw", borderLeft: "3px solid #d4af37" }}>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#5a4e35", letterSpacing: "0.12em", marginBottom: "0.5vh" }}>TIME SAVED</p>
              <p style={{ fontFamily: "Playfair Display, serif", fontSize: "3vw", fontWeight: 700, color: "#f5f0e8" }}>6–9 mo</p>
              <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", fontWeight: 300 }}>of development time</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2vw" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", background: "#d4af37", borderRadius: "50%", flexShrink: 0 }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300 }}>All source code and IP included</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", background: "#d4af37", borderRadius: "50%", flexShrink: 0 }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300 }}>Live Stripe account + payment history</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", background: "#d4af37", borderRadius: "50%", flexShrink: 0 }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300 }}>50+ leads with contact data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
