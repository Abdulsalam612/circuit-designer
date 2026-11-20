import type { ComponentProps } from "react"

// Containers. Sizes have different corners on purpose (card 14 px, panel 22 px) so the page
// has a hierarchy instead of identical rounded boxes everywhere.
//  - "card": a single item (a lesson, a circuit, a stat).
//  - "panel": a large section that holds other things (a form, a list).
//  - "ink": dark Gunmetal block for the one thing on a screen that should stand out.
//  - "glow": Sunglow tint for a lit-up / success moment.

export type CardTone = "card" | "panel" | "ink" | "glow"

const TONES: Record<CardTone, string> = {
  card: "bg-surface border border-line rounded-card",
  panel: "bg-surface border border-line rounded-panel",
  ink: "bg-ink text-white rounded-card",
  glow: "bg-glow-tint border border-glow-dark/40 rounded-card",
}

// The tactile lip means "you can press this", so only cards that are themselves a link or
// button get it (static stat tiles and info cards stay flat). They also lift on hover.
const LIP: Record<CardTone, string> = {
  card: "shadow-key hover:shadow-lift",
  panel: "shadow-key hover:shadow-lift",
  ink: "shadow-[0_3px_0_var(--color-ink-dark)]",
  glow: "shadow-[0_2px_0_var(--color-glow-dark)]",
}
const INTERACTIVE = "transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"

export const cardClass = (tone: CardTone = "card", interactive = false, extra = "") =>
  `${TONES[tone]} ${interactive ? `${LIP[tone]} ${INTERACTIVE}` : ""} ${extra}`.trim()

interface CardProps extends ComponentProps<"div"> {
  tone?: CardTone
  interactive?: boolean
}

export default function Card({ tone = "card", interactive = false, className = "", ...rest }: CardProps) {
  return <div className={cardClass(tone, interactive, className)} {...rest} />
}
