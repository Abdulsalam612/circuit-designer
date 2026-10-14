import type { ReactNode } from "react"

// Small labels: lesson step types, "Not verified", "New"… Sentence case, never all caps.
// Every tone keeps text at 4.5:1 or better on its tint.

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "glow"

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-ink/[0.06] text-ink-muted",
  info: "bg-signal-tint text-signal-dark",
  success: "bg-success-tint text-success",
  warning: "bg-carrot-tint text-carrot-ink",
  danger: "bg-danger-tint text-danger",
  glow: "bg-glow text-ink",
}

export default function Badge({ tone = "neutral", icon, children }: { tone?: BadgeTone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {icon}
      {children}
    </span>
  )
}
