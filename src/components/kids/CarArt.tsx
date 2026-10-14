// The kids' car, drawn as SVG so it can sit inside the Build stage and the Play track.
// `light` (0–1) is the headlight's simulated brightness; `wheelTurn` spins the wheels
// (degrees), so they turn as the car moves.

interface CarArtProps {
  light?: number
  wheelTurn?: number
  // Wrap in its own <svg>, or return a <g> to place inside a larger drawing
  standalone?: boolean
  width?: number
}

const Wheel = ({ cx, turn }: { cx: number; turn: number }) => (
  <g transform={`rotate(${turn} ${cx} 66)`}>
    <circle cx={cx} cy={66} r={15} fill="#31393C" />
    <circle cx={cx} cy={66} r={6} fill="#B8C4D4" />
    <line x1={cx} y1={56} x2={cx} y2={60} stroke="#B8C4D4" strokeWidth={3} strokeLinecap="round" />
  </g>
)

export function CarShape({ light = 0, wheelTurn = 0 }: { light?: number; wheelTurn?: number }) {
  return (
    <g>
      {light > 0.01 && <ellipse cx={156} cy={45} rx={20 + 26 * light} ry={8 + 9 * light} fill="#FDCA40" opacity={0.25 + 0.5 * light} />}
      <path
        d="M8 62 L8 44 Q9 36 18 35 L48 32 L66 14 Q71 10 78 10 L104 10 Q111 10 115 16 L128 34 L140 37 Q148 39 148 48 L148 62 Z"
        fill="#2176FF" stroke="#1048A8" strokeWidth={2.5} strokeLinejoin="round"
      />
      <path d="M74 16 L104 16 Q108 16 111 20 L121 34 L60 34 Z" fill="#E8F0FE" stroke="#1048A8" strokeWidth={2} />
      <circle cx={143} cy={45} r={5} fill={light > 0.01 ? "#FDCA40" : "#FFFFFF"} stroke="#C46F0C" strokeWidth={1.5} />
      <Wheel cx={40} turn={wheelTurn} />
      <Wheel cx={118} turn={wheelTurn} />
    </g>
  )
}

export default function CarArt({ light = 0, wheelTurn = 0, width = 300 }: CarArtProps) {
  return (
    <svg viewBox="0 0 170 84" width={width} height={(width * 84) / 170} aria-hidden="true">
      <CarShape light={light} wheelTurn={wheelTurn} />
    </svg>
  )
}
