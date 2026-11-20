import Link from "next/link"
import { CircuitBoard, Lightbulb } from "lucide-react"

// The one CirKit wordmark: a small key-cap tile with an icon, then the name in the display
// face. Used by the site header and footer, and by CirKit Kids (variant "kids"), so the brand
// looks the same everywhere.

interface WordmarkProps {
  // "kids": carrot tile with a bulb and "CirKit Kids"
  variant?: "site" | "kids"
  // On a dark surface (e.g. the ink footer) the name is white
  onDark?: boolean
  // Kids uses the larger size (made for tablets)
  size?: "md" | "lg"
  href?: string
  // Defaults to "CirKit home" / "CirKit Kids missions"
  label?: string
}

const VARIANTS = {
  site: {
    name: "CirKit",
    icon: CircuitBoard,
    tile: "bg-brand text-white",
    href: "/",
    label: "CirKit home",
  },
  kids: {
    name: "CirKit Kids",
    icon: Lightbulb,
    tile: "bg-carrot text-ink shadow-[0_3px_0_var(--color-carrot-dark)]",
    href: "/kids",
    label: "CirKit Kids missions",
  },
} as const

const SIZES = {
  md: { tile: "h-10 w-10", icon: "h-6 w-6", name: "text-xl" },
  lg: { tile: "h-11 w-11", icon: "h-6 w-6", name: "text-xl sm:text-2xl" },
} as const

export default function Wordmark({ variant = "site", onDark = false, size = "md", href, label }: WordmarkProps) {
  const v = VARIANTS[variant]
  const s = SIZES[size]
  const Icon = v.icon
  return (
    <Link href={href ?? v.href} aria-label={label ?? v.label} className="flex shrink-0 items-center gap-2.5 rounded-control">
      <span className={`flex items-center justify-center rounded-control ${s.tile} ${v.tile}`} aria-hidden="true">
        <Icon className={s.icon} />
      </span>
      <span className={`font-display font-bold tracking-[-0.02em] ${s.name} ${onDark ? "text-white" : "text-ink"}`}>{v.name}</span>
    </Link>
  )
}
