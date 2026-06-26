import * as Sentry from '@sentry/nextjs';

import {
  getSentryEnvironment,
  getSentryTracesSampleRate,
  isSentryEnabled,
} from '@/lib/sentry-options';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (isSentryEnabled() && dsn) {
  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    tracesSampleRate: getSentryTracesSampleRate(),
  });
}
