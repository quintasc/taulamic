/** Envía a Sentry solo si hay DSN configurado (import dinámico → sin chunk en dev local). */
export function reportClientError(error: unknown) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }
  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(error);
  });
}
