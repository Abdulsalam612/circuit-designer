import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"

// The one button for the whole site. Tactile: it sits on a solid lip (like a key cap or a
// brick) and presses down when clicked. Pass `href` to get a link that looks the same.

export type ButtonVariant = "primary" | "secondary" | "glow" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none " +
  "transition-[transform,box-shadow,background-color,color] duration-100 " +
  "active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-50 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-50"

const VARIANTS: Record<ButtonVariant, string> = {
  // White on signal: 5.1:1
  primary: "bg-signal text-white shadow-[0_3px_0_var(--color-signal-dark)] hover:bg-signal-hover active:shadow-[0_1px_0_var(--color-signal-dark)]",
  secondary: "bg-surface text-ink border border-line-strong shadow-key hover:bg-signal-tint hover:border-signal/40 active:shadow-none",
  // Ink on glow: 7.7:1 – for the one "light it up" action on a screen
  glow: "bg-glow text-ink shadow-[0_3px_0_var(--color-glow-dark)] hover:bg-glow-hover active:shadow-[0_1px_0_var(--color-glow-dark)]",
  ghost: "text-ink-muted hover:text-ink hover:bg-ink/5 active:translate-y-0",
  danger: "bg-danger text-white shadow-[0_3px_0_var(--color-danger-dark)] hover:bg-danger-hover active:shadow-[0_1px_0_var(--color-danger-dark)]",
}

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-control",
  md: "h-11 px-5 text-[15px] rounded-control",
  lg: "h-13 px-7 text-base rounded-[12px]",
}

export const buttonClass = (variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = "") =>
  `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`.trim()

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
}

type ButtonAsButton = CommonProps & Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined }
type ButtonAsLink = CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">

export default function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant, size, className = "", children, ...rest } = props
  const classes = buttonClass(variant, size, className)
  if ("href" in rest && rest.href !== undefined) {
    return <Link {...(rest as Omit<ButtonAsLink, keyof CommonProps>)} className={classes}>{children}</Link>
  }
  const buttonProps = rest as Omit<ButtonAsButton, keyof CommonProps>
  return <button type="button" {...buttonProps} className={classes}>{children}</button>
}
