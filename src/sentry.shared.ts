// Sentry error reporting, shared by the browser, server and edge set-ups.
//
// - Reports only from production builds that have a DSN (NEXT_PUBLIC_SENTRY_DSN), so local
//   development and tests send nothing.
// - Errors only: no performance tracing and no session replay (nothing records what people do
//   on the page – CirKit Kids is used by children).
// - No personal data: sendDefaultPii is off, so no IP addresses, cookies or user details are
//   attached. The privacy page (app/privacy) describes this; keep the two in step.

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

export const sentryOptions = {
  dsn,
  enabled: process.env.NODE_ENV === "production" && Boolean(dsn),
  // "production" or "preview" on Vercel, so preview deploys can be filtered out in Sentry
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  // No tracesSampleRate at all: tracing stays off (even 0 makes the SDK build and drop traces)
  sendDefaultPii: false,
  // Don't send the SDK's own stats about events it dropped; only real errors go out
  sendClientReports: false,
}
