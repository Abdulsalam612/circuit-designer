import { ImageResponse } from "next/og"

// The preview image shown when a CirKit link is shared (Open Graph). Generated at build
// time, so there's no image file to keep in sync with the branding.
export const alt = "CirKit – Build, Simulate & Learn Electronics"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#31393C",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* Circuit trace across the top: Blue → Celestial → Sunglow → Carrot */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", height: 16 }}>
          <div style={{ flex: 1, background: "#2176FF" }} />
          <div style={{ flex: 1, background: "#33A1FD" }} />
          <div style={{ flex: 1, background: "#FDCA40" }} />
          <div style={{ flex: 1, background: "#F79824" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 40 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 20,
              background: "#2176FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Lightning bolt (lucide "zap"), drawn so no emoji font has to be downloaded */}
            <svg width="60" height="60" viewBox="0 0 24 24" fill="#FDCA40">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2 }}>CirKit</div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15 }}>Build, simulate &amp; learn electronics</div>
        <div style={{ fontSize: 30, color: "#FDCA40", marginTop: 28 }}>
          Drag-and-drop circuit editor · live simulator · guided lessons
        </div>
      </div>
    ),
    size,
  )
}
