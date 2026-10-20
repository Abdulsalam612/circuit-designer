// The "Does it conduct?" scene: a dark bedroom, a torch, and the cat hiding under the bed.
// The beam is as bright as the child's bulb; only its light shows the cat (until then, just
// two eyes glinting in the dark).

export default function TorchScene({ light }: { light: number }) {
  const on = light > 0.05
  return (
    <div className="overflow-hidden rounded-card bg-ink-dark" role="img" aria-label={on ? "The torch shines under the bed and finds the cat" : "The torch is off and the room is dark"}>
      <svg viewBox="0 0 1000 150" className="block h-auto w-full">
        <rect x={0} y={128} width={1000} height={22} fill="#2A3134" />

        {/* The bed, with the cat under it */}
        <rect x={560} y={40} width={380} height={40} rx={8} fill="#3D474B" />
        <rect x={560} y={30} width={90} height={22} rx={8} fill="#5B666B" />
        <rect x={566} y={80} width={12} height={48} fill="#3D474B" />
        <rect x={922} y={80} width={12} height={48} fill="#3D474B" />

        {/* Beam: from the torch's lens to under the bed */}
        {on && (
          <path d="M232 92 L940 62 L940 132 Z" fill="#FDCA40" opacity={0.15 + 0.45 * light} />
        )}

        <g opacity={on ? 1 : 0.15}>
          <ellipse cx={760} cy={116} rx={46} ry={14} fill="#F79824" />
          <circle cx={806} cy={102} r={18} fill="#F79824" />
          <path d="M792 90 L796 74 L804 86 Z M812 86 L820 74 L822 90 Z" fill="#F79824" />
          <path d="M714 112 Q690 100 700 88" fill="none" stroke="#F79824" strokeWidth={7} strokeLinecap="round" />
        </g>
        {/* The eyes glint even in the dark */}
        <circle cx={800} cy={100} r={3} fill={on ? "#1D2326" : "#FDCA40"} />
        <circle cx={812} cy={100} r={3} fill={on ? "#1D2326" : "#FDCA40"} />

        {/* The torch */}
        <rect x={60} y={78} width={150} height={28} rx={10} fill="#2176FF" stroke="#1048A8" strokeWidth={3} />
        <path d="M206 72 L234 66 L234 118 L206 112 Z" fill="#B8C4D4" stroke="#5B666B" strokeWidth={3} strokeLinejoin="round" />
        <rect x={110} y={70} width={26} height={10} rx={3} fill="#31393C" />
        <circle cx={232} cy={92} r={8} fill={on ? "#FDCA40" : "#5B666B"} />
      </svg>
    </div>
  )
}
