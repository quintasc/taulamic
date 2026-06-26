/** Opciones compartidas Sentry (web). Sin DSN → no se envían eventos. */
export function isSentryEnabled(): boolean {
  return Boolean(
    process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  );
}

export function getSentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT ??
    process.env.NODE_ENV ??
    'development'
  );
}

export function getSentryTracesSampleRate(): number {
  const raw = process.env.SENTRY_TRACES_SAMPLE_RATE;
  if (raw === undefined || raw === '') {
    return 0.1;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0.1;
}
