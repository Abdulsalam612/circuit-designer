import { CarShape } from "./CarArt"
import ThingShape from "./ThingShape"

// One picture per mission for the mission map, each showing that mission's idea at a glance
// (a loop, two batteries, two bulbs, the garage, the fan, the torch, the flag). Drawn for a
// light tile; the tile supplies the tint. 320 x 180.

const WIRE = "#31393C"

function Battery({ x, y, vertical = true }: { x: number; y: number; vertical?: boolean }) {
  const w = vertical ? 34 : 64, h = vertical ? 64 : 34
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#F79824" stroke="#C46F0C" strokeWidth={3} />
      <text x={vertical ? x + w / 2 : x + 14} y={vertical ? y + 22 : y + 24} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1D2326">+</text>
      <text x={vertical ? x + w / 2 : x + w - 14} y={vertical ? y + h - 8 : y + 24} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1D2326">−</text>
    </g>
  )
}

function Motor({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 36} y={cy - 22} width={72} height={44} rx={10} fill="#2176FF" stroke="#1048A8" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={15} fill="#E8F0FE" stroke="#1048A8" strokeWidth={2.5} />
      {[0, 120, 240].map(r => <path key={r} d={`M${cx} ${cy} L${cx + 4} ${cy - 12} Q${cx} ${cy - 15} ${cx - 4} ${cy - 12} Z`} fill="#1048A8" transform={`rotate(${r} ${cx} ${cy})`} />)}
    </g>
  )
}

function Bulb({ cx, cy, glow }: { cx: number; cy: number; glow: number }) {
  return (
    <g>
      {glow > 0 && <circle cx={cx} cy={cy} r={18 + 16 * glow} fill="#FDCA40" opacity={0.25 + 0.4 * glow} />}
      <circle cx={cx} cy={cy} r={16} fill={glow > 0 ? "#FDCA40" : "#F4F6F8"} stroke="#5B666B" strokeWidth={3} />
      <path d={`M${cx - 6} ${cy + 4} Q${cx - 3} ${cy - 7} ${cx} ${cy + 2} Q${cx + 3} ${cy - 7} ${cx + 6} ${cy + 4}`} fill="none" stroke="#5B666B" strokeWidth={2} />
    </g>
  )
}

const Flow = ({ d }: { d: string }) => (
  <>
    <path d={d} fill="none" stroke={WIRE} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
    <path d={d} fill="none" stroke="#FDCA40" strokeWidth={3.5} strokeDasharray="0.1 11" strokeLinecap="round" />
  </>
)

export default function MissionArt({ id }: { id: string }) {
  switch (id) {
    case "make-it-go":
      return (
        <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true">
          {/* The loop on the left, the car it drives beside it */}
          <Flow d="M44 34 H196 V146 H44 Z" />
          <Battery x={27} y={58} />
          <Motor cx={120} cy={34} />
          <g transform="translate(212 104) scale(0.6)"><CarShape /></g>
        </svg>
      )
    case "faster":
      return (
        <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true">
          <Battery x={36} y={38} />
          <Battery x={80} y={38} />
          {[78, 98, 118].map((y, i) => <line key={y} x1={130 + i * 6} y1={y} x2={170 + i * 6} y2={y} stroke="#1A66E8" strokeWidth={5} strokeLinecap="round" />)}
          <g transform="translate(176 66) scale(0.78)"><CarShape /></g>
          <line x1={20} y1={150} x2={300} y2={150} stroke={WIRE} strokeWidth={4} strokeDasharray="18 12" strokeOpacity={0.35} />
        </svg>
      )
    case "lights-on":
      return (
        <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true">
          {/* Two bulbs side by side (each on its own rail), the battery on the bottom wire */}
          <Flow d="M60 34 H260 V150 H60 Z" />
          <path d="M60 92 H260" fill="none" stroke={WIRE} strokeWidth={9} strokeLinecap="round" />
          <Battery x={128} y={133} vertical={false} />
          <Bulb cx={160} cy={34} glow={0.7} />
          <Bulb cx={160} cy={92} glow={0.7} />
        </svg>
      )
    case "backwards":
      return (
        <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true">
          {/* Garage on the right, the car reversing out of it */}
          <path d="M210 150 V70 L260 40 L310 70 V150 Z" fill="#B8C4D4" stroke="#5B666B" strokeWidth={3} strokeLinejoin="round" />
          <rect x={222} y={84} width={76} height={66} fill="#5B666B" />
          <g transform="translate(110 92) scale(0.72)"><CarShape /></g>
          <path d="M150 62 H70" stroke="#C46F0C" strokeWidth={7} strokeLinecap="round" />
          <path d="M84 48 L66 62 L84 76" fill="none" stroke="#C46F0C" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <line x1={0} y1={153} x2={320} y2={153} stroke={WIRE} strokeWidth={4} strokeOpacity={0.35} />
        </svg>
      )
    case "gentle-breeze":
      return (
        <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true">
          <rect x={0} y={146} width={320} height={34} fill="#C9A27A" />
          <ellipse cx={88} cy={146} rx={40} ry={8} fill={WIRE} />
          <rect x={82} y={96} width={12} height={50} rx={4} fill="#5B666B" />
          <circle cx={88} cy={78} r={48} fill="#FFFFFF" stroke={WIRE} strokeWidth={4} />
          {[0, 120, 240].map(r => <path key={r} d="M88 78 Q68 48 88 36 Q108 48 88 78 Z" fill="#2176FF" stroke="#1048A8" strokeWidth={2} transform={`rotate(${r + 20} 88 78)`} />)}
          <circle cx={88} cy={78} r={8} fill="#1048A8" />
          {[58, 80, 102].map(y => <path key={y} d={`M152 ${y} q18 -7 36 0 t36 0`} fill="none" stroke="#1A66E8" strokeWidth={4} strokeLinecap="round" strokeDasharray="14 10" />)}
          <rect x={232} y={134} width={70} height={7} rx={2} fill="#FFFFFF" stroke="#B9C4C9" strokeWidth={1.5} />
          <rect x={236} y={126} width={70} height={7} rx={2} fill="#FFFFFF" stroke="#B9C4C9" strokeWidth={1.5} />
          <rect x={244} y={104} width={60} height={7} rx={2} fill="#FFFFFF" stroke="#B9C4C9" strokeWidth={1.5} transform="rotate(14 274 108)" />
        </svg>
      )
    case "does-it-conduct":
      return (
        <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true">
          <path d="M110 70 L320 30 L320 120 Z" fill="#FDCA40" opacity={0.45} />
          <rect x={14} y={58} width={84} height={26} rx={8} fill="#2176FF" stroke="#1048A8" strokeWidth={3} />
          <path d="M96 52 L116 47 L116 95 L96 90 Z" fill="#B8C4D4" stroke="#5B666B" strokeWidth={3} strokeLinejoin="round" />
          <g transform="translate(70 140) scale(0.75)"><ThingShape kind="coin" /></g>
          <g transform="translate(150 142) scale(0.75)"><ThingShape kind="key" /></g>
          <g transform="translate(232 140) scale(0.75)"><ThingShape kind="eraser" /></g>
        </svg>
      )
    case "drive-to-the-flag":
      return (
        <svg viewBox="0 0 320 180" className="block h-auto w-full" aria-hidden="true">
          <rect x={0} y={130} width={320} height={50} fill="#5B666B" />
          <line x1={0} y1={155} x2={320} y2={155} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="18 14" />
          <rect x={220} y={130} width={60} height={50} fill="#22C55E" fillOpacity={0.45} />
          <line x1={250} y1={40} x2={250} y2={130} stroke={WIRE} strokeWidth={4} />
          <path d="M252 42 L292 50 L252 58 Z" fill="#F79824" />
          <g transform="translate(30 70) scale(0.8)"><CarShape light={0.5} /></g>
        </svg>
      )
    default:
      return null
  }
}
