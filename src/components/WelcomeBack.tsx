"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { BookOpen, CircuitBoard, FolderOpen, Loader2, Plus } from "lucide-react"
import { listCircuits, type CircuitSummary } from "@/lib/circuitStore"
import Card, { cardClass } from "@/components/ui/Card"
import CircuitThumbnail from "@/components/CircuitThumbnail"
import { heading, text } from "@/components/ui/typography"

// How many recent circuits to show on the home page
const RECENT_COUNT = 3

const timeAgo = (date: Date | null) => {
  if (!date) return "just now"
  const minutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`
  return date.toLocaleDateString(undefined, { dateStyle: "medium" })
}

// Home page panel for signed-in users: pick up a recent circuit, start a new one,
// or carry on learning
export default function WelcomeBack({ user }: { user: User }) {
  const [circuits, setCircuits] = useState<CircuitSummary[] | null>(null)

  useEffect(() => {
    let cancelled = false
    listCircuits(user.uid)
      .then(list => { if (!cancelled) setCircuits(list) })
      // If the list can't be loaded, still offer a new circuit
      .catch(() => { if (!cancelled) setCircuits([]) })
    return () => { cancelled = true }
  }, [user.uid])

  const firstName = (user.displayName || "").split(" ")[0]
  const recent = circuits?.slice(0, RECENT_COUNT) ?? []
  const [latest, ...others] = recent

  return (
    <section className="bg-grid border-b border-line">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <h1 className={heading.xl}>Welcome back{firstName ? `, ${firstName}` : ""}</h1>
        <p className={`${text.lead} mt-3`}>
          {circuits && circuits.length > 0 ? "Pick up where you left off." : "Ready to build something?"}
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {/* Circuits */}
          <Card tone="panel" className="p-5 sm:p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className={heading.md}>Your circuits</h2>
              {circuits && circuits.length > 0 && (
                <Link href="/circuits" className="inline-flex items-center gap-1.5 text-sm font-medium text-signal hover:underline">
                  <FolderOpen className="h-4 w-4" />
                  {circuits.length > RECENT_COUNT ? `See all ${circuits.length}` : "My Circuits"}
                </Link>
              )}
            </div>

            {circuits === null ? (
              <div className="flex items-center justify-center py-10 text-ink-muted">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your circuits…
              </div>
            ) : (
              <div className="space-y-3">
                {latest && (
                  <Link href={`/simulation?id=${latest.id}`} className={cardClass("card", true, "flex items-center gap-4 p-4")}>
                    <span className="block h-14 w-24 shrink-0 overflow-hidden rounded-control border border-line bg-grid">
                      <CircuitThumbnail layout={latest.layout} className="h-full w-full p-1" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{latest.name}</span>
                      <span className="block text-sm text-ink-muted">
                        {latest.componentCount} part{latest.componentCount === 1 ? "" : "s"}, edited {timeAgo(latest.updatedAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium text-signal">Open</span>
                  </Link>
                )}

                {others.map(circuit => (
                  <Link
                    key={circuit.id}
                    href={`/simulation?id=${circuit.id}`}
                    className="flex items-center gap-4 rounded-control border border-line px-4 py-3 transition-colors hover:border-signal/40 hover:bg-signal-tint"
                  >
                    <CircuitBoard className="h-5 w-5 shrink-0 text-brand" />
                    <span className="min-w-0 flex-1 truncate font-medium text-ink">{circuit.name}</span>
                    <span className="shrink-0 text-sm text-ink-muted">{timeAgo(circuit.updatedAt)}</span>
                  </Link>
                ))}

                {circuits.length === 0 && (
                  <p className="pb-1 text-ink-muted">Circuits you save show up here, so you can carry on later.</p>
                )}

                <Link
                  href="/simulation"
                  className="flex items-center justify-center gap-2 rounded-control border-2 border-dashed border-line-strong p-4 font-medium text-ink-muted transition-colors hover:border-signal hover:text-signal"
                >
                  <Plus className="h-5 w-5" />
                  New circuit
                </Link>
              </div>
            )}
          </Card>

          {/* Learning */}
          <Link href="/dashboard" className={cardClass("ink", true, "flex flex-col justify-between p-6")}>
            <span>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-control bg-glow text-ink">
                <BookOpen className="h-6 w-6" />
              </span>
              <span className="block text-lg font-semibold">Continue learning</span>
              <span className="mt-2 block text-white/75">Pick up the course where you stopped, one lesson at a time.</span>
            </span>
            <span className="mt-6 font-medium text-glow">Go to lessons</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
