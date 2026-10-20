import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Konva's Node build optionally requires the native "canvas" package; skip it on the server
    if (isServer) {
      config.externals = [...config.externals, "canvas"];
    }
    return config;
  },
};

// Sentry (see src/sentry.shared.ts). At build time it uploads source maps, so error reports
// point at real lines of code; that needs SENTRY_AUTH_TOKEN and SENTRY_PROJECT (set on Vercel,
// never committed). Without them the build still works, just with minified stack traces.
export default withSentryConfig(nextConfig, {
  org: "abdulsalam-fw",
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Reports go through CirKit's own domain, so ad blockers don't drop them
  tunnelRoute: "/monitoring",
});
