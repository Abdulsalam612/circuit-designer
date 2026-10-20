import * as Sentry from "@sentry/nextjs"
import { sentryOptions } from "./sentry.shared"

// Server-side errors (pages that fail to render on Vercel). See sentry.shared.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      ...sentryOptions,
      // Errors only: don't count every page request as a "session"
      integrations: [Sentry.httpIntegration({ trackIncomingRequestsAsSessions: false })],
    })
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(sentryOptions)
  }
}

export const onRequestError = Sentry.captureRequestError
