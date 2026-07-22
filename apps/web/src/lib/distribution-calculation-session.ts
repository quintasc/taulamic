/** Sesión de cálculo en curso: sobrevive a navegar fuera de Distribución. */

export type DistributionCalculationSession = {
  proposalId: string;
  startedAt: string;
};

function storageKey(eventId: string): string {
  return `taulamic:dist-calc:${eventId}`;
}

export function readDistributionCalculationSession(
  eventId: string,
): DistributionCalculationSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(storageKey(eventId));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as DistributionCalculationSession;
    if (
      typeof parsed?.proposalId !== 'string' ||
      typeof parsed?.startedAt !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeDistributionCalculationSession(
  eventId: string,
  session: DistributionCalculationSession,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(storageKey(eventId), JSON.stringify(session));
}

export function clearDistributionCalculationSession(eventId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(storageKey(eventId));
}
