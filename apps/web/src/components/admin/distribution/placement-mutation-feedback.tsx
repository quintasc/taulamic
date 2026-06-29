import { feedbackSurfaceClass } from '@/lib/feedback-surface';

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
          className={`rounded-xl px-3 py-2.5 text-sm font-medium leading-snug ${feedbackSurfaceClass.warning}`}
        >
          {warning}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className={`rounded-xl px-3 py-2.5 text-sm font-medium leading-snug ${feedbackSurfaceClass.error}`}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
