import { iconFor } from "@/lib/components"
import { getPartPoints } from "@/lib/grid"
import type { CircuitLayout } from "@/types/circuit"

// A small, static drawing of a saved circuit (My Circuits, home page): the real wires and
// part icons, scaled to fit. No simulation – just what the circuit looks like.

const PART_W = 80
const PART_H = 32
const PAD = 30

export default function CircuitThumbnail({ layout, className = "" }: { layout: CircuitLayout; className?: string }) {
  const xs: number[] = []
  const ys: number[] = []
  for (const c of layout.components) {
    const { pins, body } = getPartPoints(c)
    for (const p of [...pins, ...body]) { xs.push(p.x); ys.push(p.y) }
  }
  for (const w of layout.wires) { xs.push(w.x1, w.x2); ys.push(w.y1, w.y2) }

  if (xs.length === 0) {
    return (
      <div className={`flex items-center justify-center text-sm text-ink-faint ${className}`}>
        Empty circuit
      </div>
    )
  }

  // Fit the drawing, keeping parts (which stick out ~16 px across their axis) inside
  const minX = Math.min(...xs) - PAD
  const minY = Math.min(...ys) - PAD
  const width = Math.max(Math.max(...xs) - Math.min(...xs) + 2 * PAD, 160)
  const height = Math.max(Math.max(...ys) - Math.min(...ys) + 2 * PAD, 100)

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
    >
      {layout.wires.map(w => (
        <line key={w.id} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke="var(--color-ink)" strokeWidth={2.5} strokeLinecap="round" />
      ))}
      {layout.components.map(c => (
        <image
          key={c.id}
          href={iconFor(c)}
          x={-PART_W / 2} y={-PART_H / 2} width={PART_W} height={PART_H}
          transform={`translate(${c.x} ${c.y}) rotate(${c.rotation})`}
        />
      ))}
    </svg>
  )
}
