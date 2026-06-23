export const GUEST_UI_META_KEY = 'taulamic:guestUiMeta';

export type GuestRsvpStatus = 'pending' | 'confirmed' | 'declined';

export type GuestPilotMeta = {
  invitationSent?: boolean;
  rsvpStatus?: GuestRsvpStatus;
};

type GuestMetaStore = Record<string, GuestPilotMeta>;

function storageKey(eventId: string): string {
  return `${GUEST_UI_META_KEY}:${eventId}`;
}

export function loadGuestMetaStore(eventId: string): GuestMetaStore {
  if (typeof window === 'undefined') {
    return {};
  }
  const raw = localStorage.getItem(storageKey(eventId));
  return raw ? (JSON.parse(raw) as GuestMetaStore) : {};
}

export function saveGuestMetaStore(eventId: string, store: GuestMetaStore) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(storageKey(eventId), JSON.stringify(store));
}

export function getGuestPilotMeta(
  eventId: string,
  guestId: string,
): GuestPilotMeta {
  const store = loadGuestMetaStore(eventId);
  return store[guestId] ?? { rsvpStatus: 'pending', invitationSent: false };
}

export function updateGuestPilotMeta(
  eventId: string,
  guestId: string,
  patch: Partial<GuestPilotMeta>,
) {
  const store = loadGuestMetaStore(eventId);
  store[guestId] = { ...getGuestPilotMeta(eventId, guestId), ...patch };
  saveGuestMetaStore(eventId, store);
}

export function cycleGuestRsvpStatus(
  current: GuestRsvpStatus,
): GuestRsvpStatus {
  if (current === 'pending') {
    return 'confirmed';
  }
  if (current === 'confirmed') {
    return 'declined';
  }
  return 'pending';
}

export const RSVP_STATUS_LABEL: Record<GuestRsvpStatus, string> = {
  pending: 'Sin respuesta',
  confirmed: 'Asistencia confirmada',
  declined: 'Invitación rechazada',
};
