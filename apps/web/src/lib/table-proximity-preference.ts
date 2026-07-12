export const TABLE_PROXIMITY_OPTIONS = [
  { value: 'indiferente', label: 'Indiferente' },
  { value: 'al-lado', label: 'Al lado' },
  { value: 'cerca', label: 'Cerca' },
  { value: 'fondo', label: 'Fondo' },
] as const;

export type TableProximityPreference =
  (typeof TABLE_PROXIMITY_OPTIONS)[number]['value'];

const STORAGE_PREFIX = 'taulamic:tableProximity:';

function storageKey(eventId: string): string {
  return `${STORAGE_PREFIX}${eventId}`;
}

export function loadTableProximityPreferences(
  eventId: string,
): Record<string, TableProximityPreference> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(storageKey(eventId));
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, string>;
    const valid = new Set(TABLE_PROXIMITY_OPTIONS.map((item) => item.value));
    const result: Record<string, TableProximityPreference> = {};
    for (const [tableId, value] of Object.entries(parsed)) {
      if (valid.has(value as TableProximityPreference)) {
        result[tableId] = value as TableProximityPreference;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function saveTableProximityPreference(
  eventId: string,
  tableId: string,
  preference: TableProximityPreference,
): void {
  const current = loadTableProximityPreferences(eventId);
  current[tableId] = preference;
  localStorage.setItem(storageKey(eventId), JSON.stringify(current));
}

export function resolveTableProximityPreference(
  preferences: Record<string, TableProximityPreference>,
  tableId: string,
): TableProximityPreference {
  return preferences[tableId] ?? 'indiferente';
}
