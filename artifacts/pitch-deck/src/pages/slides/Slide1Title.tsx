export default function Slide1Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 50%, #1a1400 0%, #080808 65%)" }} />
      <div className="absolute top-0 right-0 w-[45vw] h-full" style={{ background: "linear-gradient(135deg, #1c1500 0%, #0d0d00 50%, transparent 100%)", opacity: 0.6 }} />
      <div className="absolute bottom-0 left-0 w-[60vw] h-[2px]" style={{ background: "linear-gradient(90deg, #d4af37, transparent)" }} />
      <div className="absolute top-0 left-0 w-[2px] h-[40vh]" style={{ background: "linear-gradient(180deg, transparent, #d4af37, transparent)" }} />

      <div className="relative z-10 flex flex-col justify-center h-full pl-[8vw] pr-[12vw]">
        <div className="mb-[2vh]" style={{ display: "flex", alignItems: "center", gap: "1.2vw" }}>
          <div style={{ width: "3vw", height: "1px", background: "#d4af37" }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#d4af37", letterSpacing: "0.25em", fontWeight: 500 }}>FOR ACQUISITION</p>
        </div>

        <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "7.5vw", fontWeight: 900, color: "#f5f0e8", lineHeight: 1.0, letterSpacing: "-0.02em", textWrap: "balance" }}>
          Autonomous<br />
          <span style={{ color: "#d4af37" }}>Revenue OS</span>
          <span style={{ color: "#d4af37", fontSize: "4vw" }}>™</span>
        </h1>

        <div style={{ width: "6vw", height: "2px", background: "#d4af37", margin: "3vh 0 2.5vh" }} />

        <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "2.2vw", color: "#c8bfa8", fontWeight: 300, lineHeight: 1.5, maxWidth: "38vw" }}>
          A fully operational AI-powered revenue platform. Built. Live. Ready to hand off.
        </p>

        <div style={{ marginTop: "5vh", display: "flex", gap: "4vw" }}>
          <div>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "3.8vw", fontWeight: 700, color: "#d4af37" }}>$75K</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 400, letterSpacing: "0.08em" }}>ASKING PRICE</p>
          </div>
          <div style={{ width: "1px", background: "#2a2a2a", alignSelf: "stretch" }} />
          <div>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "3.8vw", fontWeight: 700, color: "#d4af37" }}>3</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 400, letterSpacing: "0.08em" }}>LIVE APPS</p>
          </div>
          <div style={{ width: "1px", background: "#2a2a2a", alignSelf: "stretch" }} />
          <div>
            <p style={{ fontFamily: "Playfair Display, serif", fontSize: "3.8vw", fontWeight: 700, color: "#d4af37" }}>$497</p>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 400, letterSpacing: "0.08em" }}>TOP TIER / MO</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] right-[4vw]" style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#3a3020", letterSpacing: "0.15em" }}>
        CONFIDENTIAL
      </div>
    </div>
  );
}
