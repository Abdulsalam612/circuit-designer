"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"

// Small pop-up messages in the corner, used instead of alert() (which blocks the page and
// can't be styled). useToast().success / .error / .info from any client component.

type ToastKind = "success" | "error" | "info"

interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

// Errors stay a little longer: they usually need reading
const DURATION_MS: Record<ToastKind, number> = { success: 3500, info: 4000, error: 6000 }
const MAX_VISIBLE = 4

const STYLE: Record<ToastKind, { icon: typeof Info; iconClass: string; bar: string }> = {
  success: { icon: CheckCircle2, iconClass: "text-success", bar: "bg-success" },
  error: { icon: XCircle, iconClass: "text-danger", bar: "bg-danger" },
  info: { icon: Info, iconClass: "text-signal", bar: "bg-signal" },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts(list => list.filter(t => t.id !== id))
  }, [])

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current++
    setToasts(list => [...list, { id, kind, message }].slice(-MAX_VISIBLE))
  }, [])

  const api = useMemo<ToastApi>(() => ({
    success: message => show("success", message),
    error: message => show("error", message),
    info: message => show("info", message),
  }), [show])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Bottom centre on phones, bottom right on larger screens; above modals (z-50) */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [hovered, setHovered] = useState(false)
  const { icon: Icon, iconClass, bar } = STYLE[toast.kind]

  // Auto-dismiss, paused while the pointer is over it so it can be read
  useEffect(() => {
    if (hovered) return
    const timer = setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.kind])
    return () => clearTimeout(timer)
  }, [hovered, toast.id, toast.kind, onDismiss])

  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-card border border-line bg-white py-3 pl-4 pr-3 shadow-lg animate-pop-in"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} />
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />
      <p className="flex-1 text-sm text-ink">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="-m-1 rounded p-1 text-ink-faint hover:bg-ink/5 hover:text-ink-muted"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export const useToast = () => {
  const api = useContext(ToastContext)
  if (!api) throw new Error("useToast must be used inside <ToastProvider>")
  return api
}
