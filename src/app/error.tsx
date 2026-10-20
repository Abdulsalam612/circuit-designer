"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bug, Home, RotateCcw } from "lucide-react"
import StatusPage, { primaryButton, secondaryButton } from "@/components/StatusPage"
import { reportError } from "@/lib/reportError"

// Shown when a page crashes while rendering. The site header (layout) still works, so the
// user can try again or go somewhere else instead of seeing a blank screen.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname()
  useEffect(() => {
    // Keep the details for debugging (console and Sentry); the page itself stays friendly
    reportError(error, "Page crashed")
  }, [error])

  return (
    <StatusPage
      code="Something went wrong"
      title="Short circuit!"
      message={
        <>
          <p>Something on this page broke. Anything you had already saved is safe.</p>
          {error.digest && <p className="mt-2 text-xs text-ink-muted">Error reference: {error.digest}</p>}
        </>
      }
      variant="spark"
    >
      {/* React 19 moves <title> into <head> */}
      <title>Something went wrong – CirKit</title>
      <button onClick={reset} className={primaryButton}>
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
      <Link href="/" className={secondaryButton}>
        <Home className="h-4 w-4" /> Go home
      </Link>
      <Link href={`/feedback?type=bug&from=${encodeURIComponent(pathname)}`} className={secondaryButton}>
        <Bug className="h-4 w-4" /> Report this problem
      </Link>
    </StatusPage>
  )
}
