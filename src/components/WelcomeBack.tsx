"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { ArrowRight, BookOpen, CircuitBoard, FolderOpen, Loader2, Plus } from "lucide-react"
import { listCircuits, type CircuitSummary } from "@/lib/circuitStore"

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
    <section className="py-16 bg-gradient-to-br from-[#33A1FD]/10 to-[#FDCA40]/5">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#31393C] mb-2">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            {circuits && circuits.length > 0 ? "Start where you left off." : "Ready to build something?"}
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Circuits */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-[#31393C]">Your circuits</h2>
                {circuits && circuits.length > 0 && (
                  <Link href="/circuits" className="flex items-center text-sm font-medium text-[#2176FF] hover:underline">
                    <FolderOpen className="h-4 w-4 mr-1" />
                    {circuits.length > RECENT_COUNT ? `See all ${circuits.length}` : "My Circuits"}
                  </Link>
                )}
              </div>

              {circuits === null ? (
                <div className="flex items-center text-gray-500 py-10 justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading your circuits…
                </div>
              ) : (
                <div className="space-y-3">
                  {latest && (
                    <Link
                      href={`/simulation?id=${latest.id}`}
                      className="flex items-center gap-4 rounded-xl border-2 border-[#2176FF]/30 bg-[#2176FF]/5 p-4 hover:border-[#2176FF] transition-colors group"
                    >
                      <div className="bg-[#2176FF] p-3 rounded-lg">
                        <CircuitBoard className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#2176FF]">Continue</p>
                        <p className="font-semibold text-[#31393C] truncate">{latest.name}</p>
                        <p className="text-sm text-gray-500">
                          {latest.componentCount} component{latest.componentCount === 1 ? "" : "s"} · edited {timeAgo(latest.updatedAt)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#2176FF] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}

                  {others.map(circuit => (
                    <Link
                      key={circuit.id}
                      href={`/simulation?id=${circuit.id}`}
                      className="flex items-center gap-4 rounded-xl border border-gray-200 p-3 hover:border-[#33A1FD] hover:bg-gray-50 transition-colors"
                    >
                      <CircuitBoard className="h-5 w-5 text-[#33A1FD] ml-1" />
                      <span className="flex-1 min-w-0 font-medium text-[#31393C] truncate">{circuit.name}</span>
                      <span className="text-sm text-gray-500 shrink-0">{timeAgo(circuit.updatedAt)}</span>
                    </Link>
                  ))}

                  {circuits.length === 0 && (
                    <p className="text-gray-500 pb-2">You haven&apos;t saved any circuits yet.</p>
                  )}

                  <Link
                    href="/simulation"
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-4 font-semibold text-gray-600 hover:border-[#2176FF] hover:text-[#2176FF] transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    New circuit
                  </Link>
                </div>
              )}
            </div>

            {/* Learning */}
            <Link
              href="/dashboard"
              className="bg-[#31393C] text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:bg-[#31393C]/90 transition-colors group"
            >
              <div>
                <div className="bg-[#FDCA40] p-3 rounded-lg inline-block mb-4">
                  <BookOpen className="h-6 w-6 text-[#31393C]" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Continue learning</h2>
                <p className="text-white/70">Lessons and guides that take you from the basics to building real circuits.</p>
              </div>
              <span className="mt-6 flex items-center font-semibold text-[#FDCA40]">
                Go to lessons
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
