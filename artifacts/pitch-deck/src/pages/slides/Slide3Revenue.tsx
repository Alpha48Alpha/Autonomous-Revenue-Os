export default function Slide3Revenue() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 80% 20%, #1a1200 0%, #080808 55%)" }} />
      <div className="absolute bottom-0 left-0 w-full h-[1px]" style={{ background: "linear-gradient(90deg, #d4af37, transparent 60%)" }} />

      <div className="relative z-10 flex flex-col h-full px-[8vw] py-[7vh]">
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
          <div style={{ width: "2vw", height: "1px", background: "#d4af37" }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#d4af37", letterSpacing: "0.2em", fontWeight: 500 }}>REVENUE MODEL</p>
        </div>

        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "5vw", fontWeight: 700, color: "#f5f0e8", lineHeight: 1.1, marginBottom: "1vh" }}>
          Three Tiers. Recurring Monthly Revenue.
        </h2>
        <div style={{ width: "4vw", height: "2px", background: "#d4af37", marginBottom: "4.5vh" }} />

        <div style={{ display: "flex", gap: "3vw", alignItems: "flex-end", flex: 1, paddingBottom: "3vh" }}>
          <div style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", padding: "3.5vh 2.5vw", position: "relative" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#8a7a5a", letterSpacing: "0.15em", marginBottom: "1.5vh", fontWeight: 600 }}>GROWTH</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "5.5vw", fontWeight: 900, color: "#d4af37", lineHeight: 1 }}>$99</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", marginBottom: "2.5vh" }}>/month</p>
            <div style={{ width: "100%", height: "1px", background: "#1e1a0e", marginBottom: "2vh" }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300 }}>
              Core dashboard
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300 }}>
              Lead management
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300 }}>
              SMS campaigns
            </p>
          </div>

          <div style={{ flex: 1, background: "#0f0c02", border: "2px solid #d4af37", padding: "3.5vh 2.5vw", position: "relative" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1vw", color: "#d4af37", letterSpacing: "0.2em", marginBottom: "0.5vh", fontWeight: 600 }}>MOST POPULAR</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#d4af37", letterSpacing: "0.15em", marginBottom: "1.5vh", fontWeight: 600 }}>SCALE</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "5.5vw", fontWeight: 900, color: "#d4af37", lineHeight: 1 }}>$299</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#8a7a5a", marginBottom: "2.5vh" }}>/month</p>
            <div style={{ width: "100%", height: "1px", background: "#2a2200", marginBottom: "2vh" }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#c8bfa8", lineHeight: 1.7, fontWeight: 300 }}>
              Everything in Growth
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#c8bfa8", lineHeight: 1.7, fontWeight: 300 }}>
              Autopilot AI engine
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#c8bfa8", lineHeight: 1.7, fontWeight: 300 }}>
              Priority support
            </p>
          </div>

          <div style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", padding: "3.5vh 2.5vw", position: "relative" }}>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#8a7a5a", letterSpacing: "0.15em", marginBottom: "1.5vh", fontWeight: 600 }}>ENTERPRISE</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "5.5vw", fontWeight: 900, color: "#d4af37", lineHeight: 1 }}>$497</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", marginBottom: "2.5vh" }}>/month</p>
            <div style={{ width: "100%", height: "1px", background: "#1e1a0e", marginBottom: "2vh" }} />
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300 }}>
              Everything in Scale
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300 }}>
              White-glove setup
            </p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", lineHeight: 1.7, fontWeight: 300 }}>
              Custom integrations
            </p>
          </div>
        </div>

        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#5a4e35", fontWeight: 300 }}>
          Live Stripe checkout with real price IDs — ready to accept payments on day one.
        </p>
      </div>
    </div>
  );
}
