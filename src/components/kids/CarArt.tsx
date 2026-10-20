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
      {light > 0.01 && <ellipse cx={160} cy={44} rx={20 + 26 * light} ry={8 + 9 * light} fill="#FDCA40" opacity={0.25 + 0.5 * light} />}
      {/* Body: short boot at the back (left), long bonnet at the front (right), so it
          clearly drives to the right */}
      <path
        d="M10 62 L10 42 Q10 34 18 33 L37 32 L45 13 Q47 10 53 10 L84 10 Q90 10 94 14 L112 31 L142 35 Q152 37 152 47 L152 62 Z"
        fill="#2176FF" stroke="#1048A8" strokeWidth={2.5} strokeLinejoin="round"
      />
      {/* Side windows: steep back window, sloped windscreen, a pillar between */}
      <path d="M50 16 L66 16 L66 31 L43 31 Z" fill="#E8F0FE" stroke="#1048A8" strokeWidth={2} strokeLinejoin="round" />
      <path d="M71 16 L86 16 Q89 16 91 18 L104 31 L71 31 Z" fill="#E8F0FE" stroke="#1048A8" strokeWidth={2} strokeLinejoin="round" />
      {/* Door line and handle */}
      <path d="M68 33 L68 56" stroke="#1048A8" strokeWidth={1.5} />
      <rect x={74} y={38} width={9} height={3} rx={1.5} fill="#1048A8" />
      {/* Bumpers */}
      <rect x={6} y={52} width={12} height={8} rx={3} fill="#31393C" />
      <rect x={144} y={52} width={12} height={8} rx={3} fill="#31393C" />
      {/* Red tail light at the back, headlight at the front */}
      <rect x={10} y={38} width={6} height={9} rx={2} fill="#E5484D" stroke="#9B1C1F" strokeWidth={1} />
      <circle cx={146} cy={44} r={5} fill={light > 0.01 ? "#FDCA40" : "#FFFFFF"} stroke="#C46F0C" strokeWidth={1.5} />
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
