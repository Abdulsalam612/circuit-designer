// A small LED used as a status light: done (green, lit), active (glowing yellow, breathes),
// warning (orange), off (unlit grey). Always paired with text – the colour alone never
// carries the meaning.

export type LedState = "done" | "active" | "warning" | "off"

const LEDS: Record<LedState, { color: string; halo: string; lit: boolean }> = {
  done: { color: "#22c55e", halo: "rgb(34 197 94 / 0.25)", lit: true },
  active: { color: "#fdca40", halo: "rgb(253 202 64 / 0.35)", lit: true },
  warning: { color: "#f79824", halo: "rgb(247 152 36 / 0.3)", lit: true },
  off: { color: "#c3ccd6", halo: "transparent", lit: false },
}

export default function StatusLed({ state, label }: { state: LedState; label?: string }) {
  const led = LEDS[state]
  const style = {
    background: led.lit ? `radial-gradient(circle at 35% 35%, #fff 0 18%, ${led.color} 45%)` : led.color,
    "--led-color": led.color,
    "--led-halo": led.halo,
    boxShadow: led.lit ? `0 0 0 2px ${led.halo}, 0 0 8px 1px ${led.color}` : "inset 0 1px 1px rgb(0 0 0 / 0.15)",
  } as React.CSSProperties
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${state === "active" ? "animate-led" : ""}`} style={style} aria-hidden="true" />
      {label && <span className="text-sm text-ink-muted">{label}</span>}
    </span>
  )
}
