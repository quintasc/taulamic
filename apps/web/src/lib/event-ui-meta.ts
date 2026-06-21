export const UI_META_KEY = 'taulamic:eventUiMeta';

export type EventUiMeta = {
  date?: string;
  location?: string;
  tableCount?: string;
  notes?: string;
};

export function loadEventUiMeta(eventId: string): EventUiMeta {
  if (typeof window === 'undefined') {
    return {};
  }
  const raw = localStorage.getItem(`${UI_META_KEY}:${eventId}`);
  return raw ? (JSON.parse(raw) as EventUiMeta) : {};
}

export function parseTableCountTarget(
  meta: EventUiMeta,
  configured = 0,
): number {
  const parsed = Number(meta.tableCount);
  const target =
    Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  return Math.max(configured, target);
}

export function saveEventUiMeta(eventId: string, meta: EventUiMeta) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(`${UI_META_KEY}:${eventId}`, JSON.stringify(meta));
}

function formatEventDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatEventSubtitle(name: string, meta: EventUiMeta): string {
  const parts = [name];
  if (meta.date) {
    parts.push(formatEventDate(meta.date));
  }
  if (meta.location) {
    parts.push(meta.location);
  }
  return parts.join(' · ');
}
