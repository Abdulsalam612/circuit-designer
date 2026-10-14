// "Level 2" shown as a tiny resistor whose band uses the resistor colour code for the
// number (0 black, 1 brown, 2 red, 3 orange…). A real piece of electronics knowledge that
// learners meet in the Resistors lesson, used as the level marker everywhere.

const BAND_COLOURS = [
  { name: "black", hex: "#1f1f1f" },
  { name: "brown", hex: "#7b4a22" },
  { name: "red", hex: "#d7261e" },
  { name: "orange", hex: "#f28a16" },
  { name: "yellow", hex: "#f6c915" },
  { name: "green", hex: "#2f9e44" },
  { name: "blue", hex: "#1c6fd8" },
  { name: "violet", hex: "#7b3fc4" },
  { name: "grey", hex: "#8a8f94" },
  { name: "white", hex: "#f4f4f4" },
]

export const bandColour = (digit: number) => BAND_COLOURS[((digit % 10) + 10) % 10]

interface LevelBadgeProps {
  level: number
  // Show only the resistor (e.g. in tight spots); the label stays available to screen readers
  compact?: boolean
  // On dark backgrounds (e.g. an ink card)
  onDark?: boolean
}

export default function LevelBadge({ level, compact = false, onDark = false }: LevelBadgeProps) {
  const band = bandColour(level)
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${onDark ? "text-white/75" : "text-ink-muted"}`}
      title={`Level ${level}: a ${band.name} band means ${level % 10} in the resistor colour code`}
    >
      <svg viewBox="0 0 28 10" className="h-3.5 w-10 shrink-0" aria-hidden="true">
        <line x1="0" y1="5" x2="28" y2="5" stroke="#8a959a" strokeWidth="1.5" />
        <rect x="6" y="1" width="16" height="8" rx="3" fill="#e9d3a8" stroke="#b99a63" strokeWidth="0.75" />
        <rect x="12" y="1" width="4" height="8" fill={band.hex} stroke={band.name === "white" ? "#b99a63" : "none"} strokeWidth="0.5" />
      </svg>
      <span className={compact ? "sr-only" : undefined}>Level {level}</span>
    </span>
  )
}
