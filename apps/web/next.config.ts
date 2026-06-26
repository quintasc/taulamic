import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const apiOrigin = process.env.TAULAMIC_API_ORIGIN ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

const sentryEnabled = Boolean(
  process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      telemetry: false,
      widenClientFileUpload: true,
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
      },
    })
  : nextConfig;
