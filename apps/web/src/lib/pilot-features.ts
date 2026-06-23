import type { PreferenceControlMode } from '@/lib/event-ui-meta';

/** Piloto julio 2026: portal invitado y modo colaborativo fuera de alcance. */
export const PILOT_COLLABORATIVE_MODE_ENABLED = false;

export const PILOT_PREFERENCE_MODE: PreferenceControlMode = 'anfitrion_exclusivo';

export function resolvePreferenceModeForPilot(
  mode: PreferenceControlMode,
): PreferenceControlMode {
  if (PILOT_COLLABORATIVE_MODE_ENABLED) {
    return mode;
  }
  return PILOT_PREFERENCE_MODE;
}

/**
 * Vista previa panel Invitados v2 (tabla + drawer + bulk bar).
 * Ruta: `/admin/events/[id]/guests-v2` — no sustituye `/guests` hasta activar flag.
 */
export const PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED = true;
