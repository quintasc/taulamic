function isSentryConfigured(): boolean {
  return Boolean(
    process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  );
}

export async function register() {
  if (!isSentryConfigured()) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export async function onRequestError(
  ...args: Parameters<
    typeof import('@sentry/nextjs').captureRequestError
  >
) {
  if (!isSentryConfigured()) {
    return;
  }
  const { captureRequestError } = await import('@sentry/nextjs');
  return captureRequestError(...args);
}
