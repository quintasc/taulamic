/** Piloto julio 2026: portal invitado y modo colaborativo fuera de alcance. */
export const PILOT_COLLABORATIVE_MODE_ENABLED = false;

export const PILOT_PREFERENCE_MODE = 'anfitrion_exclusivo' as const;

export function resolvePreferenceModeForPilot(
  mode: 'colaborativo' | 'anfitrion_exclusivo',
): 'colaborativo' | 'anfitrion_exclusivo' {
  if (PILOT_COLLABORATIVE_MODE_ENABLED) {
    return mode;
  }
  return PILOT_PREFERENCE_MODE;
}

/** Paso «Tarjetas» (invitaciones) — desbloqueo post-piloto (HU-10). */
export const PILOT_INVITATION_DESIGN_ENABLED = false;

export const PILOT_INVITATION_DESIGN_LOCKED_HINT =
  'Próximamente — disponible tras el piloto (HU-10)';
