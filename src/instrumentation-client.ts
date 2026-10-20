import * as Sentry from "@sentry/nextjs"
import { sentryOptions } from "./sentry.shared"

// Browser errors (crashes in the editor, lessons, CirKit Kids…). See sentry.shared.ts.
Sentry.init({
  ...sentryOptions,
  // Errors only: drop the default "session" ping, which counts every visit
  integrations: defaults => defaults.filter(integration => integration.name !== "BrowserSession"),
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
