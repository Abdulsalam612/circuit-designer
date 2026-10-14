"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Plus, Copy, Trash2, Pencil, CircuitBoard, Loader2 } from "lucide-react"
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
import { useToast } from "@/context/ToastContext"

const formatDate = (date: Date | null) =>
  date
    ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Just now"

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
      const code = (e as { code?: string })?.code
      setError(code === "permission-denied"
        ? "Not allowed to read your circuits. Check the Firestore security rules (see firestore.rules)."
        : "Couldn't load your circuits.")
      setCircuits([])
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
    } catch {
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
    return <div className="p-8 text-center">{loading ? "Loading..." : "Redirecting to login..."}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Circuits</h1>
          <Link
            href="/simulation"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#2176FF] hover:bg-[#33A1FD] text-white font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New circuit</span>
          </Link>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {circuits === null ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading your circuits…
          </div>
        ) : circuits.length === 0 ? (
          <div className="text-center py-16">
            <CircuitBoard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 mb-4">You haven&apos;t saved any circuits yet.</p>
            <Link href="/simulation" className="text-[#2176FF] font-medium hover:underline">
              Build your first circuit
            </Link>
          </div>
        ) : (
          <ul className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
            {circuits.map(circuit => (
              <li key={circuit.id} className={`flex items-center gap-4 px-5 py-4 ${busyId === circuit.id ? "opacity-50" : ""}`}>
                <CircuitBoard className="h-6 w-6 text-[#2176FF] shrink-0" />
                <div className="flex-1 min-w-0">
                  {renaming?.id === circuit.id ? (
                    <input
                      autoFocus
                      value={renaming.name}
                      onChange={(e) => setRenaming({ id: circuit.id, name: e.target.value })}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename()
                        if (e.key === "Escape") setRenaming(null)
                      }}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  ) : (
                    <Link href={`/simulation?id=${circuit.id}`} className="font-medium text-gray-900 hover:text-[#2176FF] truncate block">
                      {circuit.name}
                    </Link>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {circuit.componentCount} component{circuit.componentCount === 1 ? "" : "s"} · Edited {formatDate(circuit.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setRenaming({ id: circuit.id, name: circuit.name })}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    title="Rename"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => act(circuit.id, () => duplicateCircuit(user.uid, circuit.id), `Made a copy of "${circuit.name}".`)}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPendingDelete(circuit)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
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
