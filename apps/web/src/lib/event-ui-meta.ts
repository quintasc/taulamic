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

export type EventDaysRemainingMetric = {
  /** Texto principal, p. ej. «42 días» o «—». */
  value: string;
  hint?: string;
};

export type EventCountdownState =
  | { status: 'no-date' }
  | { status: 'past'; daysAgo: number; dateLabel: string }
  | {
      status: 'active';
      days: number;
      hours: number;
      minutes: number;
      progressPercent: number;
      dateLabel: string;
    };

const COUNTDOWN_PLANNING_WINDOW_DAYS = 120;

function parseEventDateParts(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return { year, month, day };
}

/** Cuenta atrás en tiempo real hasta el mediodía del día del evento. */
export function getEventCountdown(
  date?: string,
  now = new Date(),
): EventCountdownState {
  if (!date?.trim()) {
    return { status: 'no-date' };
  }

  const parts = parseEventDateParts(date);
  if (!parts) {
    return { status: 'no-date' };
  }

  const { year, month, day } = parts;
  const eventAt = new Date(year, month - 1, day, 12, 0, 0, 0);
  const dateLabel = formatEventDate(date);
  const msRemaining = eventAt.getTime() - now.getTime();

  if (msRemaining <= 0) {
    const daysAgo = Math.max(
      1,
      Math.ceil(Math.abs(msRemaining) / 86_400_000),
    );
    return { status: 'past', daysAgo, dateLabel };
  }

  const totalMinutes = Math.floor(msRemaining / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const windowStart = new Date(eventAt);
  windowStart.setDate(windowStart.getDate() - COUNTDOWN_PLANNING_WINDOW_DAYS);
  const windowMs = eventAt.getTime() - windowStart.getTime();
  const elapsedMs = now.getTime() - windowStart.getTime();
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((elapsedMs / windowMs) * 100)),
  );

  return {
    status: 'active',
    days,
    hours,
    minutes,
    progressPercent,
    dateLabel,
  };
}

/** Cuenta atrás hasta la fecha del evento (meta local, zona horaria local). */
export function getEventDaysRemaining(date?: string): EventDaysRemainingMetric {
  if (!date?.trim()) {
    return { value: '—', hint: 'Indica la fecha del evento' };
  }

  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) {
    return { value: '—', hint: 'Fecha no válida' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(year, month - 1, day);
  eventDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (eventDay.getTime() - today.getTime()) / 86_400_000,
  );
  const dateLabel = formatEventDate(date);

  if (diffDays > 1) {
    return { value: `${diffDays} días`, hint: dateLabel };
  }
  if (diffDays === 1) {
    return { value: '1 día', hint: dateLabel };
  }
  if (diffDays === 0) {
    return { value: '0 días', hint: `¡Es hoy! · ${dateLabel}` };
  }

  const pastDays = Math.abs(diffDays);
  return {
    value: '—',
    hint:
      pastDays === 1
        ? `El evento fue ayer · ${dateLabel}`
        : `El evento fue hace ${pastDays} días · ${dateLabel}`,
  };
}
