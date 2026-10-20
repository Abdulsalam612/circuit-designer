"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import "./globals.css"

// Last resort: the root layout itself crashed, so nothing from it (header, providers,
// fonts) is available. Keep this self-contained. Only shown in production builds; in
// development Next's error overlay appears instead.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { where: "Site crashed" } })
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="max-w-md text-center">
          <p className="text-sm font-medium text-signal">CirKit</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Short circuit!</h1>
          <p className="mt-3 text-ink-muted">
            CirKit hit a problem and couldn&apos;t load. Anything you had already saved is safe.
          </p>
          {error.digest && <p className="mt-2 text-xs text-ink-muted">Error reference: {error.digest}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-control bg-signal px-5 py-2.5 font-medium text-white hover:bg-signal-hover"
            >
              Try again
            </button>
            {/* A full page load rather than <Link>, in case client-side navigation is what broke */}
            <button
              onClick={() => window.location.assign("/")}
              className="rounded-control border border-line-strong bg-white px-5 py-2.5 font-medium text-ink hover:bg-paper"
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
