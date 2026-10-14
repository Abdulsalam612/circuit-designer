// The type scale. Unbounded (font-display) is wide, so headings use tight tracking and
// short lines; Lexend (font-sans) carries body text. Use these instead of ad-hoc sizes.
// Ratios follow a ~1.25 scale; body stays at 16-17 px with roomy line height for young readers.

export const heading = {
  // Hero only – one per page
  hero: "font-display text-[2.5rem] leading-[1.05] sm:text-6xl font-semibold tracking-[-0.03em] text-ink",
  // Page titles
  xl: "font-display text-3xl sm:text-4xl leading-[1.1] font-semibold tracking-[-0.02em] text-ink",
  // Section titles
  lg: "font-display text-2xl leading-tight font-semibold tracking-[-0.015em] text-ink",
  // Card titles – the sans face, so small headings stay easy to read
  md: "font-sans text-lg leading-snug font-semibold text-ink",
} as const

export const text = {
  lead: "text-lg sm:text-xl leading-relaxed text-ink-muted max-w-[60ch]",
  body: "text-base leading-relaxed text-ink max-w-[70ch]",
  small: "text-sm leading-normal text-ink-muted",
  // Values such as 4.7 kΩ or 20 mA: aligned digits, not a monospace font
  reading: "tabular font-medium text-ink",
} as const
