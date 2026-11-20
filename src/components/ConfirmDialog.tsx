"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle } from "lucide-react"
import { buttonClass } from "@/components/ui/Button"

// Styled replacement for window.confirm(). Controlled: render it with open=true and handle
// onConfirm / onCancel. Esc or a click on the backdrop cancels.

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: React.ReactNode
  confirmLabel?: string
  // e.g. "No" in CirKit Kids
  cancelLabel?: string
  // Red confirm button, for things that can't be undone
  danger?: boolean
  // Extra content under the message, e.g. a password field
  children?: React.ReactNode
  // Confirm greyed out (e.g. until a field is filled, or while working)
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  children,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const hasChildren = !!children

  // Focus Cancel when it opens, so pressing Enter by reflex doesn't delete anything
  useEffect(() => {
    if (open && !hasChildren) cancelRef.current?.focus()
  }, [open, hasChildren])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-card bg-white p-6 shadow-2xl animate-pop-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {danger && (
            <div className="shrink-0 rounded-full bg-danger-tint p-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>
          )}
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-lg font-semibold text-ink">{title}</h2>
            {message && <div className="mt-1 text-sm text-ink-muted break-words">{message}</div>}
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
        {/* The site's own buttons: 44 px tall (easy on tablets) and readable when disabled */}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className={buttonClass("secondary")}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={buttonClass(danger ? "danger" : "primary")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
