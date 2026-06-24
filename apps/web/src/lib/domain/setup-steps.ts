import {
  PILOT_INVITATION_DESIGN_ENABLED,
  PILOT_INVITATION_DESIGN_LOCKED_HINT,
} from '@/lib/pilot-features';

export type SetupStep = {
  key: string;
  label: string;
  locked?: boolean;
  lockedHint?: string;
};

/** Orden recomendado: Quién → Dónde → Cómo (ADR-018 enmienda jun 2026). */
export const setupSteps: SetupStep[] = [
  { key: 'config', label: 'Configuración del evento' },
  { key: 'guests', label: 'Invitados cargados' },
  {
    key: 'invitations',
    label: 'Tarjetas preparadas',
    locked: !PILOT_INVITATION_DESIGN_ENABLED,
    lockedHint: PILOT_INVITATION_DESIGN_LOCKED_HINT,
  },
  { key: 'plano', label: 'Plano del salón configurado' },
  { key: 'tables', label: 'Mesas configuradas' },
  { key: 'prefs', label: 'Afinidades y reglas definidas' },
  { key: 'dist', label: 'Distribución calculada o confirmada' },
];

export function getCountableSetupSteps(): SetupStep[] {
  return setupSteps.filter((step) => !step.locked);
}
