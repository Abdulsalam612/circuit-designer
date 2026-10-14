import type { ComponentProps } from "react"

// Containers. Sizes have different corners on purpose (card 14 px, panel 22 px) so the page
// has a hierarchy instead of identical rounded boxes everywhere.
//  - "card": a single item (a lesson, a circuit, a stat). Sits on the tactile lip.
//  - "panel": a large section that holds other things (a form, a list).
//  - "ink": dark Gunmetal block for the one thing on a screen that should stand out.
//  - "glow": Sunglow tint for a lit-up / success moment.

export type CardTone = "card" | "panel" | "ink" | "glow"

const TONES: Record<CardTone, string> = {
  card: "bg-surface border border-line rounded-card shadow-key",
  panel: "bg-surface border border-line rounded-panel",
  ink: "bg-ink text-white rounded-card shadow-[0_3px_0_var(--color-ink-dark)]",
  glow: "bg-glow-tint border border-glow-dark/40 rounded-card shadow-[0_2px_0_var(--color-glow-dark)]",
}

// A card that is itself a link/button lifts slightly on hover
const INTERACTIVE = "transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-lift"

export const cardClass = (tone: CardTone = "card", interactive = false, extra = "") =>
  `${TONES[tone]} ${interactive ? INTERACTIVE : ""} ${extra}`.trim()

interface CardProps extends ComponentProps<"div"> {
  tone?: CardTone
  interactive?: boolean
}

export default function Card({ tone = "card", interactive = false, className = "", ...rest }: CardProps) {
  return <div className={cardClass(tone, interactive, className)} {...rest} />
}
