export default function Slide5Features() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#080808" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 60% 30%, #100c00 0%, #080808 55%)" }} />
      <div className="absolute bottom-0 right-0 w-[50vw] h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #d4af37)" }} />

      <div className="relative z-10 flex flex-col h-full px-[8vw] py-[7vh]">
        <div style={{ display: "flex", alignItems: "center", gap: "1vw", marginBottom: "1.5vh" }}>
          <div style={{ width: "2vw", height: "1px", background: "#d4af37" }} />
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#d4af37", letterSpacing: "0.2em", fontWeight: 500 }}>WHAT'S INCLUDED</p>
        </div>

        <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "5vw", fontWeight: 700, color: "#f5f0e8", lineHeight: 1.1, marginBottom: "1vh" }}>
          Everything Built. Nothing Left to Spec.
        </h2>
        <div style={{ width: "4vw", height: "2px", background: "#d4af37", marginBottom: "4vh" }} />

        <div style={{ display: "flex", gap: "6vw", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw", marginBottom: "3.2vh" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", background: "#d4af37", borderRadius: "50%", marginTop: "0.8vh", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 600, color: "#f5f0e8", marginBottom: "0.5vh" }}>Live Stripe Checkout</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300, lineHeight: 1.5 }}>Real payment links active. $99/$299/$497 monthly plans processing now.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw", marginBottom: "3.2vh" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", background: "#d4af37", borderRadius: "50%", marginTop: "0.8vh", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 600, color: "#f5f0e8", marginBottom: "0.5vh" }}>CRM + Pipeline</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300, lineHeight: 1.5 }}>Leads, deals, companies, activities — full sales pipeline built and seeded.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", background: "#d4af37", borderRadius: "50%", marginTop: "0.8vh", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 600, color: "#f5f0e8", marginBottom: "0.5vh" }}>SMS Campaign Engine</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300, lineHeight: 1.5 }}>Bulk outreach with 5 proven message presets, cooldown management, and delivery tracking.</p>
              </div>
            </div>
          </div>

          <div style={{ width: "1px", background: "#1a1a1a" }} />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw", marginBottom: "3.2vh" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", background: "#d4af37", borderRadius: "50%", marginTop: "0.8vh", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 600, color: "#f5f0e8", marginBottom: "0.5vh" }}>Proposal Generator</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300, lineHeight: 1.5 }}>Branded proposals created and sent from within the dashboard. No third-party tools needed.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw", marginBottom: "3.2vh" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", background: "#d4af37", borderRadius: "50%", marginTop: "0.8vh", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 600, color: "#f5f0e8", marginBottom: "0.5vh" }}>Autopilot AI Agent</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300, lineHeight: 1.5 }}>Automated follow-up sequences, activity logging, and revenue action recommendations.</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5vw" }}>
              <div style={{ width: "0.8vw", height: "0.8vw", background: "#d4af37", borderRadius: "50%", marginTop: "0.8vh", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Playfair Display, serif", fontSize: "2vw", fontWeight: 600, color: "#f5f0e8", marginBottom: "0.5vh" }}>50+ Leads in Database</p>
                <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#8a7a5a", fontWeight: 300, lineHeight: 1.5 }}>Warm pipeline included at close. Buyer inherits active contacts and campaign history.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
