"use client"

import type { KeyboardEvent } from "react"
import type { SimulationResult } from "@/lib/simulation"
import { allGaps, allStuds, canPlace, partAt, pieceEnds, pieceLength, type Board } from "@/lib/kids/board"
import type { Piece, PieceKind, Stud } from "@/types/kids"

// The snap board, drawn as SVG: a plate of studs, the child's pieces on it, and – while a
// tray piece is picked up – a glowing target everywhere it would fit: a wire on a gap between
// two studs, a part (two gaps long) on the stud its middle will sit on. Targets never overlap. Everything is tapped,
// never dragged, so it works with small fingers and a keyboard alike.

const S = 84 // pixels between studs
const M = 46 // margin round the studs

export const PIECE_NAMES: Record<PieceKind, string> = {
  wire: "Wire",
  battery: "Battery",
  motor: "Motor",
  lamp: "Bulb",
  switch: "Switch",
  resistor: "Resistor",
}

const px = (s: Stud) => ({ x: M + s.c * S, y: M + s.r * S })
const studName = (s: Stud) => `column ${s.c + 1}, row ${s.r + 1}`

// Enter and Space press an SVG "button", like a real one
const pressable = (label: string, onPress: () => void) => ({
  role: "button",
  tabIndex: 0,
  "aria-label": label,
  onClick: onPress,
  onKeyDown: (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPress() }
  },
})

interface SnapBoardProps {
  board: Board
  pieces: Piece[]
  result: SimulationResult
  holding: PieceKind | null
  selected: string | null
  onPlace: (piece: Pick<Piece, "kind" | "at" | "dir">) => void
  onSelect: (id: string) => void
}

export default function SnapBoard({ board, pieces, result, holding, selected, onPlace, onSelect }: SnapBoardProps) {
  const width = 2 * M + (board.cols - 1) * S
  const height = 2 * M + (board.rows - 1) * S
  const studs = allStuds(board)
  const wireTargets = holding && pieceLength(holding) === 1
    ? allGaps(board).filter(gap => canPlace(pieces, { kind: holding, ...gap }, board))
    : []
  const partTargets = holding && pieceLength(holding) === 2
    ? studs.flatMap(stud => {
        const placement = partAt(pieces, holding, stud, board)
        return placement ? [{ stud, placement }] : []
      })
    : []
  const wires = pieces.filter(p => p.kind === "wire")
  const parts = pieces.filter(p => p.kind !== "wire")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" role="group" aria-label="Your circuit board">
      {/* The plate and its studs */}
      <rect x={4} y={4} width={width - 8} height={height - 8} rx={22} fill="#DCE7F9" stroke="#B9CCEB" strokeWidth={2} />
      {studs.map(s => {
        const { x, y } = px(s)
        return (
          <g key={`${s.c},${s.r}`} aria-hidden="true">
            <circle cx={x} cy={y + 2} r={11} fill="#B9CCEB" />
            <circle cx={x} cy={y} r={11} fill="#EEF3FC" stroke="#C7D6EF" strokeWidth={1.5} />
          </g>
        )
      })}

      {wires.map(p => <WirePiece key={p.id} piece={p} current={result.wireCurrents[p.id] ?? 0} selected={p.id === selected} onSelect={onSelect} />)}
      {parts.map(p => <PartPiece key={p.id} piece={p} result={result} selected={p.id === selected} onSelect={onSelect} />)}

      {/* Where the picked-up wire can go: one slim tile per free gap */}
      {wireTargets.map(gap => {
        const [a, b] = pieceEnds({ kind: "wire", ...gap })
        const g0 = px(a)
        const horizontal = gap.dir === "h"
        return (
          <g key={`${gap.at.c},${gap.at.r},${gap.dir}`} {...pressable(`Put the wire from ${studName(a)} to ${studName(b)}`, () => onPlace({ kind: "wire", ...gap }))} className="group cursor-pointer outline-none">
            {/* Invisible, wider tap area; the visible tile stays clear of the studs */}
            <rect
              x={horizontal ? g0.x + 14 : g0.x - 26} y={horizontal ? g0.y - 26 : g0.y + 14}
              width={horizontal ? S - 28 : 52} height={horizontal ? 52 : S - 28} fill="transparent"
            />
            <rect
              x={horizontal ? g0.x + 17 : g0.x - 13} y={horizontal ? g0.y - 13 : g0.y + 17}
              width={horizontal ? S - 34 : 26} height={horizontal ? 26 : S - 34}
              rx={13} fill="#FDCA40" fillOpacity={0.35} stroke="#C46F0C" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="6 5"
              className="transition-[fill-opacity] group-hover:fill-opacity-80 group-focus-visible:fill-opacity-80"
            />
          </g>
        )
      })}

      {/* Where the picked-up part can go: the stud its middle will sit on. Hovering or
          focusing a stud shows the whole part's place. */}
      {partTargets.map(({ stud, placement }) => {
        const [a, b] = pieceEnds(placement)
        const pa = px(a), pb = px(b), m = px(stud)
        const label = `Put the ${PIECE_NAMES[placement.kind].toLowerCase()} on ${studName(stud)}, from ${studName(a)} to ${studName(b)}`
        return (
          <g key={`${stud.c},${stud.r}`} {...pressable(label, () => onPlace(placement))} className="group cursor-pointer outline-none">
            <line
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke="#1A66E8" strokeWidth={44} strokeLinecap="round" strokeOpacity={0}
              className="pointer-events-none transition-[stroke-opacity] group-hover:stroke-opacity-25 group-focus-visible:stroke-opacity-25"
            />
            <circle cx={m.x} cy={m.y} r={30} fill="transparent" />
            <circle
              cx={m.x} cy={m.y} r={21} fill="#FDCA40" fillOpacity={0.45} stroke="#C46F0C" strokeOpacity={0.7} strokeWidth={2} strokeDasharray="6 5"
              className="transition-[fill-opacity] group-hover:fill-opacity-90 group-focus-visible:fill-opacity-90"
            />
          </g>
        )
      })}
    </svg>
  )
}

// ---- Pieces ----

function Highlight({ a, b, show }: { a: { x: number; y: number }; b: { x: number; y: number }; show: boolean }) {
  if (!show) return null
  return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1A66E8" strokeWidth={46} strokeLinecap="round" strokeOpacity={0.22} />
}

function WirePiece({ piece, current, selected, onSelect }: { piece: Piece; current: number; selected: boolean; onSelect: (id: string) => void }) {
  const [a, b] = pieceEnds(piece).map(px)
  const flowing = Math.abs(current) > 1e-4
  return (
    <g {...pressable(`Wire from ${studName(piece.at)}`, () => onSelect(piece.id))} className="cursor-pointer outline-none [&:focus-visible>line:first-child]:stroke-opacity-30">
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1A66E8" strokeWidth={46} strokeLinecap="round" strokeOpacity={selected ? 0.22 : 0} />
      <line x1={a.x} y1={a.y + 3} x2={b.x} y2={b.y + 3} stroke="#1D2326" strokeWidth={16} strokeLinecap="round" />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#31393C" strokeWidth={16} strokeLinecap="round" />
      {flowing && (
        // Dots run the way conventional current flows: from + round to −
        <line
          x1={current > 0 ? a.x : b.x} y1={current > 0 ? a.y : b.y} x2={current > 0 ? b.x : a.x} y2={current > 0 ? b.y : a.y}
          stroke="#FDCA40" strokeWidth={6} strokeLinecap="round" strokeDasharray="0.1 12" className="kids-flow"
        />
      )}
      {[a, b].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={9} fill="#5B666B" stroke="#1D2326" strokeWidth={2} />)}
    </g>
  )
}

const TILE: Record<Exclude<PieceKind, "wire">, { fill: string; lip: string }> = {
  battery: { fill: "#F79824", lip: "#C46F0C" },
  motor: { fill: "#2176FF", lip: "#1048A8" },
  lamp: { fill: "#FFFFFF", lip: "#B9C4C9" },
  switch: { fill: "#22C55E", lip: "#127436" },
  resistor: { fill: "#E9D5B5", lip: "#B89A6A" },
}

function PartPiece({ piece, result, selected, onSelect }: { piece: Piece; result: SimulationResult; selected: boolean; onSelect: (id: string) => void }) {
  const kind = piece.kind as Exclude<PieceKind, "wire">
  const [a, b] = pieceEnds(piece).map(px)
  const reading = result.readings[piece.id]
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  const horizontal = piece.dir === "h"
  // The tile, drawn lying flat (along x) round its middle, then stood up if the piece is vertical
  const half = S - 16
  const tile = TILE[kind]
  const plusAt = piece.flipped ? b : a
  const minusAt = piece.flipped ? a : b

  let label = PIECE_NAMES[kind]
  if (kind === "switch") label += piece.closed ? ", on" : ", off"
  if (kind === "battery") label += piece.flipped ? ", turned around" : ""

  return (
    <g {...pressable(`${label}, from ${studName(piece.at)}`, () => onSelect(piece.id))} className="cursor-pointer outline-none [&:focus-visible>line:first-child]:stroke-opacity-30">
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1A66E8" strokeWidth={60} strokeLinecap="round" strokeOpacity={0} />
      <Highlight a={a} b={b} show={selected} />
      {/* Leads to the two studs it plugs into */}
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#31393C" strokeWidth={10} strokeLinecap="round" />
      <g transform={`translate(${mid.x} ${mid.y}) rotate(${horizontal ? 0 : 90})`}>
        <rect x={-half} y={-27} width={2 * half} height={58} rx={14} fill={tile.lip} />
        <rect x={-half} y={-30} width={2 * half} height={56} rx={14} fill={tile.fill} stroke={tile.lip} strokeWidth={2} />
      </g>
      <g transform={`translate(${mid.x} ${mid.y})`}>
        <PartFace kind={kind} piece={piece} speed={reading?.speed ?? 0} brightness={reading?.brightness ?? 0} horizontal={horizontal} />
      </g>
      {kind === "battery" && (
        <>
          <text x={(plusAt.x * 3 + mid.x) / 4} y={(plusAt.y * 3 + mid.y) / 4 + 9} textAnchor="middle" className="font-display" fontSize={28} fontWeight={700} fill="#1D2326">+</text>
          <text x={(minusAt.x * 3 + mid.x) / 4} y={(minusAt.y * 3 + mid.y) / 4 + 9} textAnchor="middle" className="font-display" fontSize={28} fontWeight={700} fill="#1D2326">−</text>
        </>
      )}
      {[a, b].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={9} fill="#5B666B" stroke="#1D2326" strokeWidth={2} />)}
    </g>
  )
}

// What's printed on each tile, upright whichever way the piece lies
function PartFace({ kind, piece, speed, brightness, horizontal }: { kind: Exclude<PieceKind, "wire">; piece: Piece; speed: number; brightness: number; horizontal: boolean }) {
  switch (kind) {
    case "battery":
      return (
        <g>
          <rect x={-20} y={-10} width={40} height={18} rx={4} fill="#1D2326" />
          <text y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#FDCA40">4.5V</text>
        </g>
      )
    case "motor": {
      const spinning = Math.abs(speed) > 0.02
      return (
        <g>
          <circle r={22} fill="#E8F0FE" stroke="#1048A8" strokeWidth={2.5} />
          <g
            className={spinning ? "kids-spin" : undefined}
            style={spinning ? { animationDuration: `${0.5 / Math.abs(speed)}s`, animationDirection: speed < 0 ? "reverse" : "normal" } : undefined}
          >
            {[0, 120, 240].map(r => <path key={r} d="M0 0 L5 -17 Q0 -21 -5 -17 Z" fill="#1048A8" transform={`rotate(${r})`} />)}
            <circle r={4} fill="#1048A8" />
          </g>
        </g>
      )
    }
    case "lamp":
      return (
        <g>
          {brightness > 0.02 && <circle r={26 + 18 * brightness} fill="#FDCA40" opacity={0.3 + 0.5 * brightness} />}
          <circle r={18} fill={brightness > 0.02 ? "#FDCA40" : "#F4F6F8"} stroke="#5B666B" strokeWidth={2.5} />
          <path d="M-7 4 Q-4 -8 0 2 Q4 -8 7 4" fill="none" stroke="#5B666B" strokeWidth={2} />
        </g>
      )
    case "switch":
      // The lever: down onto the far contact when on, lifted off it when off
      return (
        <g>
          <g transform={horizontal ? undefined : "rotate(90)"}>
            <circle cx={-20} r={5} fill="#1D2326" />
            <circle cx={20} r={5} fill="#1D2326" />
            <line x1={-20} y1={0} x2={piece.closed ? 20 : 12.8} y2={piece.closed ? 0 : -22.9} stroke="#1D2326" strokeWidth={6} strokeLinecap="round" />
          </g>
          <text x={horizontal ? 0 : -14} y={horizontal ? 22 : 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0B3D1C">{piece.closed ? "ON" : "OFF"}</text>
        </g>
      )
    case "resistor":
      return (
        <g transform={horizontal ? undefined : "rotate(90)"}>
          {[-14, -4, 6].map((x, i) => <rect key={x} x={x} y={-20} width={6} height={40} fill={["#7C3AED", "#1D2326", "#C46F0C"][i]} />)}
        </g>
      )
  }
}
