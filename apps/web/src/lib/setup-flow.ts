import { setupSteps } from '@/lib/domain/setup-steps';
import { adminRoutes } from '@/lib/routes';

/** Claves de pantallas del setup (orden recomendado ADR-018). */
export type SetupFlowKey =
  | 'config'
  | 'guests'
  | 'invitations'
  | 'plano'
  | 'tables'
  | 'prefs'
  | 'dist';

const FLOW_ORDER: SetupFlowKey[] = [
  'config',
  'guests',
  'invitations',
  'plano',
  'tables',
  'prefs',
  'dist',
];

const STEP_LABELS: Record<SetupFlowKey, string> = {
  config: 'Configuración',
  guests: 'Invitados',
  invitations: 'Tarjetas',
  plano: 'Plano',
  tables: 'Mesas',
  prefs: 'Afinidades',
  dist: 'Distribución',
};

export function getSetupStepShortLabel(key: SetupFlowKey): string {
  return STEP_LABELS[key];
}

export function getSetupStepJourneyLabel(
  key: SetupFlowKey,
  stepIndex: number,
): string {
  return `Paso ${stepIndex + 1}: ${STEP_LABELS[key]}`;
}

function hrefForStep(eventId: string, key: SetupFlowKey): string {
  const routes = adminRoutes(eventId);
  const hrefByKey: Record<SetupFlowKey, string> = {
    config: routes.config,
    guests: routes.guests,
    invitations: routes.invitationDesign,
    plano: routes.floorPlan,
    tables: routes.tables,
    prefs: routes.preferences,
    dist: routes.distribution,
  };
  return hrefByKey[key];
}

function isStepLocked(key: SetupFlowKey): boolean {
  const step = setupSteps.find((item) => item.key === key);
  return Boolean(step?.locked);
}

/** Paso anterior operativo (omite pasos bloqueados). */
export function getPreviousSetupStep(
  eventId: string,
  currentKey: SetupFlowKey,
): { href: string; previousLabel: string } | null {
  const currentIndex = FLOW_ORDER.indexOf(currentKey);
  if (currentIndex <= 0) {
    return null;
  }

  for (let i = currentIndex - 1; i >= 0; i--) {
    const key = FLOW_ORDER[i];
    if (isStepLocked(key)) {
      continue;
    }
    const label = STEP_LABELS[key];
    return {
      href: hrefForStep(eventId, key),
      previousLabel: `Anterior: ${label}`,
    };
  }

  return null;
}

/** Siguiente paso operativo (omite pasos bloqueados, p. ej. Tarjetas en piloto). */
export function getNextSetupStep(
  eventId: string,
  currentKey: SetupFlowKey,
): { href: string; nextLabel: string } | null {
  const currentIndex = FLOW_ORDER.indexOf(currentKey);
  if (currentIndex === -1) {
    return null;
  }

  for (let i = currentIndex + 1; i < FLOW_ORDER.length; i++) {
    const key = FLOW_ORDER[i];
    if (isStepLocked(key)) {
      continue;
    }
    const label = STEP_LABELS[key];
    return {
      href: hrefForStep(eventId, key),
      nextLabel: `Siguiente: ${label}`,
    };
  }

  if (currentKey === 'dist') {
    return {
      href: adminRoutes(eventId).dashboard,
      nextLabel: 'Siguiente: Dashboard',
    };
  }

  return null;
}

export function getSetupNav(eventId: string, currentKey: SetupFlowKey) {
  return {
    previous: getPreviousSetupStep(eventId, currentKey),
    next: getNextSetupStep(eventId, currentKey),
  };
}

export function getSetupStepHref(eventId: string, key: SetupFlowKey): string {
  return hrefForStep(eventId, key);
}

export type SetupNavTarget = {
  key: SetupFlowKey;
  href: string;
  stepLabel: string;
  ctaLabel: string;
};

export function getDashboardSetupNav(
  eventId: string,
  setupStatus: boolean[],
): { next: { href: string; nextLabel: string } } | null {
  const nextStep = getNextIncompleteSetupStep(eventId, setupStatus);
  if (!nextStep) {
    return null;
  }

  const nextLabel =
    nextStep.key === 'config'
      ? 'Siguiente: Definir evento'
      : `Siguiente: ${nextStep.stepLabel}`;

  return {
    next: {
      href: nextStep.href,
      nextLabel,
    },
  };
}

/** Primer paso incompleto del setup (omite bloqueados). */
export function getNextIncompleteSetupStep(
  eventId: string,
  setupStatus: boolean[],
): SetupNavTarget | null {
  for (const key of FLOW_ORDER) {
    if (isStepLocked(key)) {
      continue;
    }
    const index = setupSteps.findIndex((step) => step.key === key);
    if (index === -1) {
      continue;
    }
    if (!setupStatus[index]) {
      const stepLabel = STEP_LABELS[key];
      return {
        key,
        href: hrefForStep(eventId, key),
        stepLabel,
        ctaLabel: key === 'config' ? 'Definir evento' : `Continuar: ${stepLabel}`,
      };
    }
  }
  return null;
}
