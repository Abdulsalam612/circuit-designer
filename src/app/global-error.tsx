"use client"

import "./globals.css"

// Last resort: the root layout itself crashed, so nothing from it (header, providers,
// fonts) is available. Keep this self-contained. Only shown in production builds; in
// development Next's error overlay appears instead.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold tracking-wider text-[#2176FF] uppercase">CirKit</p>
          <h1 className="mt-2 text-3xl font-bold text-[#31393C]">Short circuit!</h1>
          <p className="mt-3 text-gray-600">
            CirKit hit a problem and couldn&apos;t load. Anything you had already saved is safe.
          </p>
          {error.digest && <p className="mt-2 text-xs text-gray-400">Error reference: {error.digest}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-lg bg-[#2176FF] px-5 py-2.5 font-medium text-white hover:bg-[#33A1FD]"
            >
              Try again
            </button>
            {/* A full page load rather than <Link>, in case client-side navigation is what broke */}
            <button
              onClick={() => window.location.assign("/")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-[#31393C] hover:bg-gray-50"
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
