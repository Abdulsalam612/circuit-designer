"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { safeNextPath } from "./authLinks"

export interface AuthRequest {
  dialog: "login" | "signup"
  // Where to go once signed in (already checked to be a path on this site)
  next: string | null
}

// Opens the sign-in or sign-up dialog when the address asks for one (/?login=1 or /?signup=1,
// see authLinks.ts). Watches the query rather than reading it once, so a "Start" link
// clicked on the home page itself opens the dialog too. Needs a <Suspense> around it
// (useSearchParams), like the feedback page.
export default function AuthQueryWatcher({ onRequest }: { onRequest: (request: AuthRequest) => void }) {
  const query = useSearchParams().toString()
  // Latest handler without re-running the effect on every render
  const onRequestRef = useRef(onRequest)
  useEffect(() => {
    onRequestRef.current = onRequest
  })

  useEffect(() => {
    const params = new URLSearchParams(query)
    const dialog = params.get("signup") === "1" ? "signup" : params.get("login") === "1" ? "login" : null
    if (!dialog) return
    onRequestRef.current({ dialog, next: safeNextPath(params.get("next")) })
  }, [query])

  return null
}
