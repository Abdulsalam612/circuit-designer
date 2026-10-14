import type { ReactNode } from "react"

// Form fields. Use `inputClass` on <input>, <textarea> and <select> so every form matches.

export const inputClass =
  "w-full rounded-control border border-line-strong bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-faint " +
  "transition-[border-color,box-shadow] focus:border-signal focus:outline-none focus:ring-4 focus:ring-signal/15 " +
  "aria-invalid:border-danger aria-invalid:focus:ring-danger/15 disabled:bg-paper disabled:text-ink-faint"

interface FieldProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  children: ReactNode
}

export default function Field({ label, htmlFor, hint, error, optional = false, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-muted">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}
