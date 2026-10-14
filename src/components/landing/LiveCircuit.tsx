"use client"

import { useMemo, useState } from "react"
import { iconFor } from "@/lib/components"
import { formatAmps, simulate } from "@/lib/simulation"
import StatusLed, { type LedState } from "@/components/ui/StatusLed"
import { HERO_DEFAULT_OHMS, HERO_RESISTOR_CHOICES, HERO_VIEWBOX, heroLayout } from "./heroCircuit"

// The landing page's one bold moment: a real circuit solved by CirKit's own simulator.
// Same part icons, grid and current dots as the editor. Visitors can flip the switch and
// swap the resistor; the LED and the readout follow the simulation, not a script.

const PART_W = 80
const PART_H = 32
const DOT_GAP = 16

// Same speed rule as the editor's current-flow animation
const dotSpeed = (amps: number) => Math.min(160, 25 + 30 * Math.log10(1 + amps * 1000))

export default function LiveCircuit() {
  const [closed, setClosed] = useState(true)
  const [ohms, setOhms] = useState<number>(HERO_DEFAULT_OHMS)

  const layout = useMemo(() => heroLayout(closed, ohms), [closed, ohms])
  const result = useMemo(() => simulate(layout), [layout])
  const led = result.readings.led
  const brightness = led?.brightness ?? 0
  const overloaded = result.warnings.some(w => w.kind === "led-overload")
  const amps = Math.abs(led?.current ?? 0)

  const status: { state: LedState; text: string } = !closed
    ? { state: "off", text: "The switch is open, so no current can flow." }
    : overloaded
      ? { state: "warning", text: `${formatAmps(amps)} is too much. A real LED would burn out.` }
      : brightness < 0.9
        ? { state: "active", text: `${formatAmps(amps)} flows. The LED glows, but dimly.` }
        : { state: "done", text: `${formatAmps(amps)} flows. The LED is lit and safe.` }

  const ledPart = layout.components.find(c => c.id === "led")!
  const switchPart = layout.components.find(c => c.id === "switch")!
  const { x: vx, y: vy, width: vw, height: vh } = HERO_VIEWBOX

  return (
    <div className="rounded-panel border border-line bg-surface shadow-lift">
      <div className="bg-grid rounded-t-panel border-b border-line px-3 pt-3 sm:px-5 sm:pt-5">
        <svg
          viewBox={`${vx} ${vy} ${vw} ${vh}`}
          className="mx-auto block h-auto w-full max-w-[520px]"
          role="img"
          aria-label={`A circuit: a 9 volt battery, a switch, a ${ohms} ohm resistor and an LED. ${status.text}`}
        >
          <defs>
            <filter id="led-blur" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {layout.wires.map(w => (
            <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="var(--color-ink)" strokeWidth={2.5} strokeLinecap="round" />
          ))}

          {/* Current: dots move from each wire's first end to its second (conventional current) */}
          {layout.wires.map(w => {
            const current = result.wireCurrents[w.id] ?? 0
            if (Math.abs(current) < 1e-6) return null
            const duration = DOT_GAP / dotSpeed(Math.abs(current))
            return (
              <line
                key={`flow-${w.id}`}
                x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
                stroke="var(--color-carrot)"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={`0.1 ${DOT_GAP - 0.1}`}
                className="hero-flow"
                style={{ animationDuration: `${duration}s`, animationDirection: current > 0 ? "normal" : "reverse" }}
              />
            )
          })}

          {/* LED glow, under the icon, by brightness */}
          {brightness > 0.01 && (
            <circle
              cx={ledPart.x} cy={ledPart.y} r={14 + 10 * brightness}
              fill="#ef4444" opacity={0.3 + 0.6 * brightness} filter="url(#led-blur)"
            />
          )}

          {/* Parts use the editor's icons; the switch is drawn by hand so its lever can visibly move */}
          {layout.components.filter(c => c.type !== "switch").map(c => (
            <image
              key={c.id}
              href={iconFor(c)}
              x={-PART_W / 2} y={-PART_H / 2} width={PART_W} height={PART_H}
              transform={`translate(${c.x} ${c.y}) rotate(${c.rotation})`}
            />
          ))}

          {overloaded && (
            <rect
              x={ledPart.x - 24} y={ledPart.y - 46} width={48} height={92} rx={10}
              fill="none" stroke="var(--color-carrot)" strokeWidth={2} strokeDasharray="6 4"
            />
          )}

          {/* Value labels, like the editor's */}
          <text x={84} y={164} fontSize={13} fill="var(--color-ink-muted)">9 V</text>
          <text x={320} y={92} fontSize={13} fill="var(--color-ink-muted)" textAnchor="middle">
            {HERO_RESISTOR_CHOICES.find(r => r.ohms === ohms)?.label}
          </text>

          <g aria-hidden="true">
            <line x1={switchPart.x - 40} y1={switchPart.y} x2={switchPart.x - 20} y2={switchPart.y} stroke="var(--color-ink)" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={switchPart.x + 20} y1={switchPart.y} x2={switchPart.x + 40} y2={switchPart.y} stroke="var(--color-ink)" strokeWidth={2.5} strokeLinecap="round" />
            <line
              x1={switchPart.x - 20} y1={switchPart.y} x2={switchPart.x + 22} y2={switchPart.y}
              stroke="var(--color-ink)" strokeWidth={3} strokeLinecap="round"
              className="motion-safe:transition-transform motion-safe:duration-200"
              style={{ transform: `rotate(${closed ? 0 : -32}deg)`, transformOrigin: `${switchPart.x - 20}px ${switchPart.y}px` }}
            />
            <circle cx={switchPart.x - 20} cy={switchPart.y} r={4} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth={2} />
            <circle cx={switchPart.x + 20} cy={switchPart.y} r={4} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth={2} />
          </g>

          {/* The switch itself is clickable */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={closed}
            aria-label={closed ? "Open the switch" : "Close the switch"}
            className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-brand"
            onClick={() => setClosed(c => !c)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setClosed(c => !c)
              }
            }}
          >
            <rect
              x={switchPart.x - 46} y={switchPart.y - 30} width={92} height={50} rx={10}
              fill="transparent" stroke="transparent" strokeWidth={2.5}
            />
          </g>
          <text x={switchPart.x} y={switchPart.y + 34} fontSize={13} fill="var(--color-signal)" textAnchor="middle" className="pointer-events-none">
            Click the switch
          </text>
        </svg>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={() => setClosed(c => !c)}
            aria-pressed={closed}
            className="inline-flex h-9 items-center gap-2 rounded-control border border-line-strong bg-surface px-3 text-sm font-medium text-ink shadow-key transition-transform active:translate-y-[2px] active:shadow-none"
          >
            <span className={`h-2 w-4 rounded-full transition-colors ${closed ? "bg-success" : "bg-ink-faint"}`} aria-hidden="true" />
            Switch {closed ? "closed" : "open"}
          </button>

          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">Resistor value</legend>
            <span className="text-sm text-ink-muted" aria-hidden="true">Resistor</span>
            <div className="inline-flex rounded-control border border-line-strong bg-paper p-0.5">
              {HERO_RESISTOR_CHOICES.map(choice => (
                <label
                  key={choice.ohms}
                  className={`tabular cursor-pointer rounded-[8px] px-2.5 py-1 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${
                    ohms === choice.ohms ? "bg-surface font-medium text-ink shadow-key" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="hero-resistor"
                    value={choice.ohms}
                    checked={ohms === choice.ohms}
                    onChange={() => setOhms(choice.ohms)}
                    className="sr-only"
                  />
                  {choice.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div aria-live="polite">
          <StatusLed state={status.state} label={status.text} />
        </div>
      </div>
    </div>
  )
}
