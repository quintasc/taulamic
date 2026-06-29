export const DISTRIBUTION_CHANGED_EVENT = 'taulamic:distribution-changed';

export function notifyDistributionChanged(eventId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(DISTRIBUTION_CHANGED_EVENT, {
      detail: { eventId },
    }),
  );
}
