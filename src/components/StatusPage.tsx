import SiteHeader from "@/components/SiteHeader"
import { buttonClass } from "@/components/ui/Button"
import { heading } from "@/components/ui/typography"

// Shared layout for the 404 and error pages: site header, a circuit picture, a short
// explanation and a few ways out.

interface StatusPageProps {
  code: string
  title: string
  message: React.ReactNode
  variant: "open" | "spark"
  children: React.ReactNode // action buttons/links
}

export default function StatusPage({ code, title, message, variant, children }: StatusPageProps) {
  return (
    // Opaque white base: the site is light-only, but globals.css still darkens <body> in dark mode
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-grid">
        <div className="max-w-lg text-center">
          <BrokenCircuit variant={variant} />
          <p className="mt-6 text-sm font-medium text-signal">{code}</p>
          <h1 className={`${heading.xl} mt-2`}>{title}</h1>
          <div className="mt-3 text-ink-muted">{message}</div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>
        </div>
      </main>
    </div>
  )
}

// The 404 and error pages' buttons are the shared design-system ones
export const primaryButton = buttonClass("primary")
export const secondaryButton = buttonClass("secondary")

// Battery + lamp loop with a gap in the right-hand wire. "open": two loose ends drawn like
// the editor's unconnected-end markers (hollow circles). "spark": a short circuit flash.
function BrokenCircuit({ variant }: { variant: "open" | "spark" }) {
  const wire = "#31393C"
  return (
    <svg viewBox="0 0 240 150" className="mx-auto h-36 w-auto sm:h-44" role="img"
      aria-label={variant === "open" ? "A circuit with a broken wire" : "A circuit with a spark"}>
      {/* Wires: top (around the lamp), left (around the battery), bottom, right with a gap */}
      <path d="M40 60 V30 H106 M134 30 H200 V60" fill="none" stroke={wire} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M200 92 V120 H40 V90" fill="none" stroke={wire} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Battery: long (+) and short (−) plates across the left wire */}
      <line x1="24" y1="68" x2="56" y2="68" stroke={wire} strokeWidth="4" strokeLinecap="round" />
      <line x1="31" y1="80" x2="49" y2="80" stroke={wire} strokeWidth="6" strokeLinecap="round" />
      <line x1="40" y1="60" x2="40" y2="68" stroke={wire} strokeWidth="4" />
      <line x1="40" y1="80" x2="40" y2="90" stroke={wire} strokeWidth="4" />
      <text x="62" y="68" fontSize="14" fontWeight="700" fill="#F79824">+</text>

      {/* Lamp: unlit */}
      <circle cx="120" cy="30" r="14" fill="#fff" stroke={wire} strokeWidth="4" />
      <path d="M110 20 L130 40 M130 20 L110 40" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" />

      {variant === "open" ? (
        <>
          {/* Loose ends bent apart, hollow circles like the editor's unconnected markers */}
          <path d="M200 60 L212 70" fill="none" stroke={wire} strokeWidth="4" strokeLinecap="round" />
          <path d="M200 92 L188 84" fill="none" stroke={wire} strokeWidth="4" strokeLinecap="round" />
          <circle cx="214" cy="72" r="5" fill="#fff" stroke="#2176FF" strokeWidth="3" />
          <circle cx="186" cy="82" r="5" fill="#fff" stroke="#2176FF" strokeWidth="3" />
        </>
      ) : (
        <>
          <line x1="200" y1="60" x2="200" y2="66" stroke={wire} strokeWidth="4" strokeLinecap="round" />
          <line x1="200" y1="86" x2="200" y2="92" stroke={wire} strokeWidth="4" strokeLinecap="round" />
          <circle cx="200" cy="76" r="16" fill="#FDCA40" opacity="0.35" className="motion-safe:animate-pulse" />
          <path d="M204 64 L194 77 H204 L196 89" fill="none" stroke="#F79824" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}
