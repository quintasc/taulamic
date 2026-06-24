import type { ComponentType, SVGProps } from 'react';
import { navIcons } from '@/components/icons';
import {
  PILOT_INVITATION_DESIGN_ENABLED,
  PILOT_INVITATION_DESIGN_LOCKED_HINT,
} from '@/lib/pilot-features';
import { adminRoutes } from '@/lib/routes';

export type SetupStep = {
  key: string;
  label: string;
  locked?: boolean;
  lockedHint?: string;
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
  /** Resaltar nav en subrutas (p. ej. plano upload + layout). */
  activeBasePath?: string;
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

export function getAdminNavItems(eventId: string): AdminNavItem[] {
  const routes = adminRoutes(eventId);

  return [
    {
      href: routes.dashboard,
      label: 'Dashboard',
      icon: navIcons.dashboard,
      exact: true,
    },
    { href: routes.config, label: 'Configuración', icon: navIcons.config },
    { href: routes.guests, label: 'Invitados', icon: navIcons.guests },
    {
      href: routes.invitationDesign,
      label: 'Tarjetas',
      icon: navIcons.invitations,
      locked: !PILOT_INVITATION_DESIGN_ENABLED,
      lockedHint: PILOT_INVITATION_DESIGN_LOCKED_HINT,
    },
    {
      href: routes.floorPlan,
      label: 'Plano',
      icon: navIcons.floorPlan,
      activeBasePath: routes.floorPlan,
    },
    { href: routes.tables, label: 'Mesas', icon: navIcons.tables },
    {
      href: routes.preferences,
      label: 'Afinidades',
      icon: navIcons.preferences,
    },
    {
      href: routes.distribution,
      label: 'Distribución',
      icon: navIcons.distribution,
    },
  ];
}

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.locked) {
    return false;
  }

  const href = item.activeBasePath ?? item.href;

  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
