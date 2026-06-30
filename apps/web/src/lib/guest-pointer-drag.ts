import {
  canDropGuestOnTable,
  clearGuestDrag,
  setActiveGuestDrag,
  type GuestDragPayload,
} from '@/lib/distribution-dnd';

const DRAG_THRESHOLD_PX = 10;

export const GUEST_DROP_TABLE_ATTR = 'data-guest-drop-table';
export const GUEST_DROP_FREE_SEATS_ATTR = 'data-guest-drop-free-seats';

export type GuestPointerDragSnapshot = {
  active: boolean;
  guestName: string;
  x: number;
  y: number;
  hoverTableId: string | null;
};

type PendingDrag = GuestDragPayload & {
  guestName: string;
  startX: number;
  startY: number;
  pointerId: number;
};

let snapshot: GuestPointerDragSnapshot | null = null;
let pending: PendingDrag | null = null;
let activePayload: GuestDragPayload | null = null;
let lastPointerDragEndAt = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: GuestPointerDragSnapshot | null) {
  snapshot = next;
  notify();
}

export function subscribeGuestPointerDrag(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGuestPointerDragSnapshot(): GuestPointerDragSnapshot | null {
  return snapshot;
}

export function getGuestPointerDragHoverTableId(): string | null {
  return snapshot?.hoverTableId ?? null;
}

export function shouldUsePointerGuestDrag(pointerType: string): boolean {
  if (pointerType === 'touch') {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    pointerType === 'pen' &&
    window.matchMedia('(pointer: coarse)').matches
  );
}

function findDropTargetAt(
  x: number,
  y: number,
): { tableId: string; freeSeats: number } | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const elements = document.elementsFromPoint(x, y);
  for (const element of elements) {
    const target = element.closest(`[${GUEST_DROP_TABLE_ATTR}]`);
    if (!target) {
      continue;
    }
    const tableId = target.getAttribute(GUEST_DROP_TABLE_ATTR);
    const freeSeats = Number.parseInt(
      target.getAttribute(GUEST_DROP_FREE_SEATS_ATTR) ?? '0',
      10,
    );
    if (!tableId || !Number.isFinite(freeSeats)) {
      continue;
    }
    return { tableId, freeSeats };
  }
  return null;
}

function resolveHoverTableId(
  payload: GuestDragPayload,
  x: number,
  y: number,
): string | null {
  const hover = findDropTargetAt(x, y);
  if (!hover) {
    return null;
  }
  return canDropGuestOnTable(payload, hover.tableId, hover.freeSeats)
    ? hover.tableId
    : null;
}

export function armGuestPointerDrag(input: {
  guestId: string;
  sourceTableId: string;
  guestName: string;
  pointerId: number;
  x: number;
  y: number;
}): void {
  pending = {
    guestId: input.guestId,
    sourceTableId: input.sourceTableId,
    guestName: input.guestName,
    pointerId: input.pointerId,
    startX: input.x,
    startY: input.y,
  };
}

export function moveGuestPointerDrag(x: number, y: number): void {
  if (pending && !snapshot?.active) {
    const dx = x - pending.startX;
    const dy = y - pending.startY;
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
      return;
    }

    const payload = {
      guestId: pending.guestId,
      sourceTableId: pending.sourceTableId,
    };
    activePayload = payload;
    setActiveGuestDrag(payload);
    setSnapshot({
      active: true,
      guestName: pending.guestName,
      x,
      y,
      hoverTableId: resolveHoverTableId(payload, x, y),
    });
    pending = null;
    return;
  }

  if (!snapshot?.active || !activePayload) {
    return;
  }

  setSnapshot({
    ...snapshot,
    x,
    y,
    hoverTableId: resolveHoverTableId(activePayload, x, y),
  });
}

export function endGuestPointerDrag(): {
  guestId: string;
  sourceTableId: string;
  targetTableId: string;
} | null {
  const payload = activePayload;
  const targetTableId = snapshot?.hoverTableId ?? null;
  const lastX = snapshot?.x ?? 0;
  const lastY = snapshot?.y ?? 0;
  const wasActive = Boolean(snapshot?.active);

  pending = null;
  activePayload = null;
  setSnapshot(null);
  clearGuestDrag();

  if (wasActive) {
    lastPointerDragEndAt = Date.now();
  }

  if (!payload || !targetTableId) {
    return null;
  }

  const hover = findDropTargetAt(lastX, lastY);
  if (
    !hover ||
    hover.tableId !== targetTableId ||
    !canDropGuestOnTable(payload, targetTableId, hover.freeSeats)
  ) {
    return null;
  }

  return {
    guestId: payload.guestId,
    sourceTableId: payload.sourceTableId,
    targetTableId,
  };
}

export function cancelGuestPointerDrag(): void {
  pending = null;
  activePayload = null;
  setSnapshot(null);
  clearGuestDrag();
}

/** Hay un arrastre táctil pendiente o en curso (no confundir con HTML5 drag). */
export function isGuestPointerDragSessionActive(): boolean {
  return Boolean(pending || snapshot?.active);
}

/** Evita clics fantasma en el destino tras soltar con el dedo. */
export function wasGuestPointerDragRecent(): boolean {
  return Date.now() - lastPointerDragEndAt < 400;
}

/** Atributos para zonas de soltar (mesas en plano o lista). */
export function guestDropTargetProps(tableId: string, freeSeats: number) {
  return {
    [GUEST_DROP_TABLE_ATTR]: tableId,
    [GUEST_DROP_FREE_SEATS_ATTR]: String(freeSeats),
  } as const;
}
