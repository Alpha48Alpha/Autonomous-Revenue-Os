export default function Slide8Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, #1c1400 0%, #080808 60%)" }} />
      <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }} />
      <div className="absolute bottom-0 left-0 w-full h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #d4af37, transparent)" }} />
      <div className="absolute left-0 top-0 h-full w-[2px]" style={{ background: "linear-gradient(180deg, transparent, #d4af37, transparent)" }} />
      <div className="absolute right-0 top-0 h-full w-[2px]" style={{ background: "linear-gradient(180deg, transparent, #d4af37, transparent)" }} />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-[15vw]">
        <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", marginBottom: "3vh" }}>
          <div style={{ width: "4vw", height: "1px", background: "#d4af37" }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#d4af37", letterSpacing: "0.25em", fontWeight: 500 }}>ACQUISITION OPPORTUNITY</p>
          <div style={{ width: "4vw", height: "1px", background: "#d4af37" }} />
        </div>

        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "6.5vw", fontWeight: 900, color: "#f5f0e8", lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: "2vh", textWrap: "balance" }}>
          Own a Revenue Machine.<br />
          <span style={{ color: "#d4af37" }}>Skip the Build.</span>
        </h2>

        <div style={{ width: "5vw", height: "2px", background: "#d4af37", margin: "0 auto 3.5vh" }} />

        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "2vw", color: "#8a7a5a", lineHeight: 1.6, fontWeight: 300, maxWidth: "52vw", marginBottom: "5vh" }}>
          Three live apps. Stripe payments active. 50+ leads in the pipeline. Hand the keys to the right buyer and start collecting subscriptions within 30 days.
        </p>

        <div style={{ display: "flex", gap: "4vw", marginBottom: "5vh" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "4.5vw", fontWeight: 900, color: "#d4af37", lineHeight: 1 }}>$75K</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", letterSpacing: "0.1em" }}>ASKING</p>
          </div>
          <div style={{ width: "1px", background: "#1e1a0e" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "4.5vw", fontWeight: 900, color: "#d4af37", lineHeight: 1 }}>3</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", letterSpacing: "0.1em" }}>LIVE APPS</p>
          </div>
          <div style={{ width: "1px", background: "#1e1a0e" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "4.5vw", fontWeight: 900, color: "#d4af37", lineHeight: 1 }}>Day 1</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#5a4e35", letterSpacing: "0.1em" }}>REVENUE READY</p>
          </div>
        </div>

        <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontStyle: "italic", color: "#d4af37" }}>Autonomous Revenue OS™</p>
        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#5a4e35", marginTop: "0.8vh", letterSpacing: "0.08em" }}>BY ELIZABETH ROTHCHILD</p>
      </div>
    </div>
  );
}
