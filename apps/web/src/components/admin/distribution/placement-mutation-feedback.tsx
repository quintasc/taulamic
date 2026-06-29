export function PlacementMutationFeedback({
  warning,
  error,
  overlay = false,
  compact = false,
}: {
  warning?: string | null;
  error?: string | null;
  overlay?: boolean;
  compact?: boolean;
}) {
  if (!warning && !error) {
    return null;
  }

  const containerClass = overlay
    ? 'pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2 sm:inset-x-4 sm:bottom-4'
    : compact
      ? 'flex flex-col gap-2'
      : 'mb-3 flex flex-col gap-2';

  return (
    <div className={containerClass} aria-live="polite">
      {warning ? (
        <p
          role="status"
          className="rounded-lg border border-warning-500/50 bg-warning-500/20 px-3 py-2.5 text-sm font-medium leading-snug text-neutral-900 shadow-md backdrop-blur-sm"
        >
          {warning}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-error-500/50 bg-error-500/15 px-3 py-2.5 text-sm font-medium leading-snug text-neutral-900 shadow-md backdrop-blur-sm"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
