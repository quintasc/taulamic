import * as Sentry from '@sentry/nestjs';

const dsn = process.env.SENTRY_DSN;

export const sentryEnabled = Boolean(dsn);

if (sentryEnabled && dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  });
}
