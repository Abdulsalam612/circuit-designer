"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Plus, Copy, Trash2, Pencil, Loader2 } from "lucide-react"
import { useRequireAuth } from "@/context/AuthContext"
import {
  deleteCircuit,
  duplicateCircuit,
  listCircuits,
  renameCircuit,
  type CircuitSummary,
} from "@/lib/circuitStore"
import SiteHeader from "@/components/SiteHeader"
import ConfirmDialog from "@/components/ConfirmDialog"
import CircuitThumbnail from "@/components/CircuitThumbnail"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { inputClass } from "@/components/ui/Field"
import { heading, text } from "@/components/ui/typography"
import { useToast } from "@/context/ToastContext"
import { reportError } from "@/lib/reportError"

// The day is enough here ("12 Nov 2026"); a time like "00:00" only adds noise
const formatDate = (date: Date | null) =>
  date ? date.toLocaleDateString(undefined, { dateStyle: "medium" }) : "just now"

// 40 px square icon buttons
const iconButton = "inline-flex h-10 w-10 items-center justify-center rounded-control text-ink-muted transition-colors"

export default function MyCircuitsPage() {
  const { user, loading } = useRequireAuth()
  const [circuits, setCircuits] = useState<CircuitSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<CircuitSummary | null>(null)
  const toast = useToast()

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      setCircuits(await listCircuits(user.uid))
      setError(null)
    } catch (e) {
      reportError(e, "List circuits")
      setError("We couldn't load your circuits. Check your connection, or sign out and back in.")
      // Keep what was shown before (if anything); "No circuits yet" would be misleading
      setCircuits(prev => prev ?? [])
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  // Runs a change against one circuit, then reloads the list and says how it went
  const act = async (id: string, action: () => Promise<unknown>, done: string) => {
    setBusyId(id)
    try {
      await action()
      await refresh()
      toast.success(done)
    } catch (e) {
      reportError(e, "Change circuit")
      toast.error("That didn't work. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  const commitRename = () => {
    if (!user || !renaming) return
    const { id, name } = renaming
    setRenaming(null)
    const trimmed = name.trim()
    const current = circuits?.find(c => c.id === id)
    if (!trimmed || trimmed === current?.name) return
    act(id, () => renameCircuit(user.uid, id, trimmed), `Renamed to "${trimmed}".`)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-grid">
        <SiteHeader />
        <p className="p-16 text-center text-ink-muted" role="status">{loading ? "Loading…" : "Redirecting to sign in…"}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grid">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 pt-12 pb-8">
          <div>
            <h1 className={heading.xl}>My Circuits</h1>
            <p className={`${text.lead} mt-3`}>
              {circuits && circuits.length > 0
                ? `${circuits.length} saved circuit${circuits.length === 1 ? "" : "s"}, newest first.`
                : "Everything you build in the editor is saved here."}
            </p>
          </div>
          <Button href="/simulation"><Plus className="h-4 w-4" /> New circuit</Button>
        </header>

        {error && <p className="mb-6 rounded-card border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger" role="alert">{error}</p>}

        {circuits === null ? (
          <p className="flex items-center justify-center gap-2 py-16 text-ink-muted" role="status">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading your circuits…
          </p>
        ) : circuits.length === 0 && error ? (
          // The error above says what happened; offer a way to try again
          <div className="flex justify-center py-10">
            <Button variant="secondary" onClick={() => refresh()}>Try again</Button>
          </div>
        ) : circuits.length === 0 ? (
          <Card tone="panel" className="mx-auto max-w-lg p-10 text-center">
            <h2 className={heading.lg}>No circuits yet</h2>
            <p className="mt-2 text-ink-muted">Build something in the editor and it will be saved here automatically.</p>
            <Button href="/simulation" className="mt-6"><Plus className="h-4 w-4" /> Build your first circuit</Button>
          </Card>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {circuits.map(circuit => (
              <li key={circuit.id}>
                <Card className={`flex h-full flex-col overflow-hidden ${busyId === circuit.id ? "opacity-50" : ""}`}>
                  {/* The drawing opens the circuit */}
                  <Link
                    href={`/simulation?id=${circuit.id}`}
                    className="group block border-b border-line bg-grid"
                    aria-label={`Open ${circuit.name}`}
                  >
                    <CircuitThumbnail
                      layout={circuit.layout}
                      className="h-40 w-full p-3 transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    {renaming?.id === circuit.id ? (
                      <input
                        autoFocus
                        aria-label="Circuit name"
                        value={renaming.name}
                        onChange={(e) => setRenaming({ id: circuit.id, name: e.target.value })}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename()
                          if (e.key === "Escape") setRenaming(null)
                        }}
                        className={`${inputClass} py-1.5`}
                      />
                    ) : (
                      <Link href={`/simulation?id=${circuit.id}`} className="block truncate font-semibold text-ink hover:text-signal">
                        {circuit.name}
                      </Link>
                    )}
                    <p className="tabular text-sm text-ink-muted">
                      {circuit.componentCount} part{circuit.componentCount === 1 ? "" : "s"}, edited {formatDate(circuit.updatedAt)}
                    </p>
                    <div className="mt-auto flex items-center gap-1 pt-3">
                      <Button href={`/simulation?id=${circuit.id}`} variant="secondary" size="sm" className="mr-auto" aria-label={`Open ${circuit.name}`}>
                        Open
                      </Button>
                      <button
                        onClick={() => setRenaming({ id: circuit.id, name: circuit.name })}
                        className={`${iconButton} hover:bg-ink/5 hover:text-ink`}
                        title="Rename"
                        aria-label={`Rename ${circuit.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => act(circuit.id, () => duplicateCircuit(user.uid, circuit.id), `Made a copy of "${circuit.name}".`)}
                        className={`${iconButton} hover:bg-ink/5 hover:text-ink`}
                        title="Duplicate"
                        aria-label={`Duplicate ${circuit.name}`}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {/* Kept apart from the others so it isn't hit by mistake */}
                      <span className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
                      <button
                        onClick={() => setPendingDelete(circuit)}
                        className={`${iconButton} hover:bg-danger-tint hover:text-danger`}
                        title="Delete"
                        aria-label={`Delete ${circuit.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this circuit?"
        message={<>&ldquo;{pendingDelete?.name}&rdquo; will be deleted for good. This can&apos;t be undone.</>}
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          const { id, name } = pendingDelete
          setPendingDelete(null)
          act(id, () => deleteCircuit(user.uid, id), `Deleted "${name}".`)
        }}
      />
    </div>
  )
}
