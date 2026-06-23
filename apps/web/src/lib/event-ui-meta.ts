export const UI_META_KEY = 'taulamic:eventUiMeta';

/** Nombre técnico al crear evento en API (no mostrar como nombre configurado). */
export const EVENT_API_PLACEHOLDER_NAME = 'Evento nuevo';

export const EVENT_NAME_INPUT_PLACEHOLDER = 'Ej. Boda García-López';

const LEGACY_PLACEHOLDER_NAMES = new Set([
  EVENT_API_PLACEHOLDER_NAME,
  'Boda García-López',
]);

export type PreferenceControlMode = 'colaborativo' | 'anfitrion_exclusivo';

export type AffinityRuleToggles = {
  groupByCategory?: boolean;
  keepFamiliesTogether?: boolean;
  singlesTable?: boolean;
  separateKnownIncompatibles?: boolean;
};

export type EventUiMeta = {
  date?: string;
  location?: string;
  notes?: string;
  /** Invitados aproximados (orientación plano/mesas). */
  approximateGuestCount?: string;
  /** Paso 1 completado: nombre real guardado por el organizador. */
  configSaved?: boolean;
  preferenceMode?: PreferenceControlMode;
  /** Piloto: plano subido en esta sesión/dispositivo (sin API list). */
  floorPlanUploaded?: boolean;
  /** Piloto: borrador de afinidades/reglas revisado. */
  affinitiesDraftSaved?: boolean;
  affinityRules?: AffinityRuleToggles;
  /** @deprecated Sustituido por approximateGuestCount. */
  tableCount?: string;
};

export function loadEventUiMeta(eventId: string): EventUiMeta {
  if (typeof window === 'undefined') {
    return {};
  }
  const raw = localStorage.getItem(`${UI_META_KEY}:${eventId}`);
  return raw ? (JSON.parse(raw) as EventUiMeta) : {};
}

export function saveEventUiMeta(eventId: string, meta: EventUiMeta) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(`${UI_META_KEY}:${eventId}`, JSON.stringify(meta));
}

export function isApiPlaceholderEventName(name: string | undefined): boolean {
  if (!name?.trim()) {
    return true;
  }
  return LEGACY_PLACEHOLDER_NAMES.has(name.trim());
}

export function isEventConfigComplete(
  eventId: string,
  eventName: string | undefined,
): boolean {
  const meta = loadEventUiMeta(eventId);
  if (meta.configSaved) {
    return true;
  }
  return (
    Boolean(eventName?.trim()) && !isApiPlaceholderEventName(eventName)
  );
}

export function getDisplayEventName(
  eventName: string | undefined,
  eventId: string | null,
): string {
  if (!eventName?.trim()) {
    return 'Evento sin nombre';
  }
  if (eventId && !isEventConfigComplete(eventId, eventName)) {
    return 'Evento sin nombre';
  }
  return eventName.trim();
}

export function parseApproximateGuestCount(meta: EventUiMeta): number {
  const parsed = Number(meta.approximateGuestCount);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
}

/** @deprecated Usar parseApproximateGuestCount. */
export function parseTableCountTarget(
  meta: EventUiMeta,
  configured = 0,
): number {
  const parsed = Number(meta.tableCount);
  const target = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  return Math.max(configured, target);
}

export function markFloorPlanUploaded(eventId: string) {
  const meta = loadEventUiMeta(eventId);
  saveEventUiMeta(eventId, { ...meta, floorPlanUploaded: true });
}

export function markAffinitiesDraftSaved(eventId: string) {
  const meta = loadEventUiMeta(eventId);
  saveEventUiMeta(eventId, { ...meta, affinitiesDraftSaved: true });
}

function formatEventDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatEventSubtitle(
  name: string,
  meta: EventUiMeta,
  eventId?: string | null,
): string {
  const displayName = eventId
    ? getDisplayEventName(name, eventId)
    : name || 'Evento sin nombre';
  const parts = [displayName];
  if (meta.date) {
    parts.push(formatEventDate(meta.date));
  }
  if (meta.location) {
    parts.push(meta.location);
  }
  return parts.join(' · ');
}

export function configFormInitialName(
  eventName: string | undefined,
): string {
  if (!eventName || isApiPlaceholderEventName(eventName)) {
    return '';
  }
  return eventName;
}
