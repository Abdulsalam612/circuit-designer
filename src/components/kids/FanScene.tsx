// The "Gentle breeze" scene: a desk fan driven by the child's motor, blowing at a pile of
// homework. The blades turn as fast as the motor; a gentle breeze makes the papers flutter,
// too much wind blows them off the desk. TOO_FAST matches the mission's maxSpeed goal.

const TOO_FAST = 0.35

export default function FanScene({ speed }: { speed: number }) {
  const s = Math.abs(speed)
  const spinning = s > 0.02
  const tooFast = s > TOO_FAST
  const label = !spinning
    ? "The fan is off"
    : tooFast ? "The fan blows so hard that the papers fly off the desk" : "The fan blows gently and the papers stay on the desk"

  return (
    <div className="overflow-hidden rounded-card bg-signal-tint" role="img" aria-label={label}>
      <svg viewBox="0 0 1000 150" className="block h-auto w-full">
        {/* Desk */}
        <rect x={0} y={122} width={1000} height={28} fill="#C9A27A" />
        <rect x={0} y={118} width={1000} height={6} fill="#B08560" />

        {/* Fan: base, stand, guard and blades */}
        <ellipse cx={170} cy={118} rx={44} ry={8} fill="#31393C" />
        <rect x={164} y={70} width={12} height={48} rx={4} fill="#5B666B" />
        <circle cx={170} cy={62} r={50} fill="#FFFFFF" fillOpacity={0.6} stroke="#31393C" strokeWidth={4} />
        <g
          className={spinning ? "kids-spin" : undefined}
          style={spinning ? { animationDuration: `${0.4 / s}s`, animationDirection: speed < 0 ? "reverse" : "normal" } : undefined}
        >
          {/* Centres the spin on the hub (it turns round the middle of the group's box) */}
          <circle cx={170} cy={62} r={46} fill="transparent" />
          {[0, 120, 240].map(r => (
            <path key={r} d="M170 62 Q150 30 170 18 Q190 30 170 62 Z" fill="#2176FF" stroke="#1048A8" strokeWidth={2} transform={`rotate(${r} 170 62)`} />
          ))}
          <circle cx={170} cy={62} r={8} fill="#1048A8" />
        </g>

        {/* Puffs of air, stronger the faster the fan */}
        {spinning && [40, 62, 84].map((y, i) => (
          <path
            key={y}
            d={`M240 ${y} q30 -8 60 0 t60 0 t60 0 t60 0`}
            fill="none" stroke="#1A66E8" strokeOpacity={Math.min(0.75, 0.2 + s)} strokeWidth={3} strokeLinecap="round"
            strokeDasharray="18 16" className="kids-flow" style={{ animationDuration: `${0.25 / s}s`, animationDelay: `${i * 0.1}s` }}
          />
        ))}

        {/* The homework: two sheets that stay put, two that react to the wind */}
        <Sheet x={600} y={110} />
        <Sheet x={606} y={106} />
        <Sheet x={596} y={102} className={tooFast ? "kids-paper-fly" : spinning ? "kids-paper-flutter" : undefined} />
        <Sheet x={604} y={98} className={tooFast ? "kids-paper-fly [animation-delay:0.6s]" : spinning ? "kids-paper-flutter [animation-delay:0.3s]" : undefined} />
      </svg>
    </div>
  )
}

function Sheet({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width={110} height={8} rx={1.5} fill="#FFFFFF" stroke="#B9C4C9" strokeWidth={1.5} />
      <line x1={x + 10} y1={y + 4} x2={x + 90} y2={y + 4} stroke="#8AB4F8" strokeWidth={1.5} />
    </g>
  )
}
