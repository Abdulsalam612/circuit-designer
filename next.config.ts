import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

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
// Not loaded for `next dev`: reporting is off in development anyway, and the plugin pulls in
// Babel (hundreds of files), which made the dev server take minutes to start on a hard drive.
export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_DEVELOPMENT_SERVER) return nextConfig;
  const { withSentryConfig } = await import("@sentry/nextjs/config");
  return withSentryConfig(nextConfig, {
    org: "abdulsalam-fw",
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    // Reports go through CirKit's own domain, so ad blockers don't drop them
    tunnelRoute: "/monitoring",
  });
}
