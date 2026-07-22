/** Meta local solo para vista previa Invitados v2 (reversible). */
export const GUEST_V2_DETAIL_META_KEY = 'taulamic:guestV2DetailMeta';

export type GuestV2DetailMeta = {
  dietaryAlert?: boolean;
  mobilityAlert?: boolean;
  notes?: string;
  /**
   * Grupo local (preview). Hoy no escribe `acompananteKey` en API → no es keepTogether duro.
   * Futuro: enlazar este valor (o un toggle) a `acompananteKey` para keepTogether desde alta manual.
   */
  companionGroup?: string;
};

type Store = Record<string, GuestV2DetailMeta>;

function storageKey(eventId: string): string {
  return `${GUEST_V2_DETAIL_META_KEY}:${eventId}`;
}

export function getGuestV2DetailMeta(
  eventId: string,
  guestId: string,
): GuestV2DetailMeta {
  if (typeof window === 'undefined') {
    return {};
  }
  const raw = localStorage.getItem(storageKey(eventId));
  const store: Store = raw ? (JSON.parse(raw) as Store) : {};
  return store[guestId] ?? {};
}

export function updateGuestV2DetailMeta(
  eventId: string,
  guestId: string,
  patch: Partial<GuestV2DetailMeta>,
) {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = localStorage.getItem(storageKey(eventId));
  const store: Store = raw ? (JSON.parse(raw) as Store) : {};
  store[guestId] = { ...getGuestV2DetailMeta(eventId, guestId), ...patch };
  localStorage.setItem(storageKey(eventId), JSON.stringify(store));
}
