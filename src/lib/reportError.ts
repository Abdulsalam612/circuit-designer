import * as Sentry from "@sentry/nextjs"

// For failures the page catches and handles itself (a toast, a retry message) but that are
// still bugs or outages worth knowing about: saving a circuit, loading progress… Not for
// things people get wrong (a wrong password), which aren't bugs. Sends nothing unless Sentry
// is enabled (see src/sentry.shared.ts); the console keeps the details either way.
export function reportError(error: unknown, where: string) {
  console.error(`${where}:`, error)
  Sentry.captureException(error, { tags: { where } })
}
