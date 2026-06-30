export const GUEST_DRAG_MIME = 'application/x-taulamic-guest';

export type GuestDragPayload = {
  guestId: string;
  sourceTableId: string;
};

let activeGuestDrag: GuestDragPayload | null = null;

/** Los navegadores no exponen getData() en dragover; usamos estado en memoria. */
export function setActiveGuestDrag(payload: GuestDragPayload | null): void {
  activeGuestDrag = payload;
}

export function getActiveGuestDrag(): GuestDragPayload | null {
  return activeGuestDrag;
}

export function setGuestDragData(
  dataTransfer: DataTransfer,
  payload: GuestDragPayload,
): void {
  dataTransfer.setData(GUEST_DRAG_MIME, JSON.stringify(payload));
  dataTransfer.setData('text/plain', payload.guestId);
  dataTransfer.effectAllowed = 'move';
  setActiveGuestDrag(payload);
}

export function readGuestDragData(
  dataTransfer: DataTransfer,
): GuestDragPayload | null {
  const fromMemory = getActiveGuestDrag();
  if (fromMemory) {
    return fromMemory;
  }

  const raw = dataTransfer.getData(GUEST_DRAG_MIME);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GuestDragPayload;
    if (
      typeof parsed.guestId === 'string' &&
      typeof parsed.sourceTableId === 'string'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearGuestDrag(): void {
  setActiveGuestDrag(null);
}

export function canDropGuestOnTable(
  payload: GuestDragPayload,
  targetTableId: string,
  freeSeats: number,
): boolean {
  if (payload.sourceTableId === targetTableId) {
    return false;
  }
  return freeSeats > 0;
}

export function acceptGuestDragOver(
  event: Pick<DragEvent, 'preventDefault' | 'dataTransfer'>,
  targetTableId: string,
  freeSeats: number,
): boolean {
  const payload = getActiveGuestDrag();
  if (!payload || !canDropGuestOnTable(payload, targetTableId, freeSeats)) {
    return false;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  return true;
}
