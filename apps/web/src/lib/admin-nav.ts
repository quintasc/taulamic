import type { ComponentType, SVGProps } from 'react';
import { navIcons } from '@/components/icons';
import { adminRoutes } from '@/lib/routes';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
};

export const setupSteps = [
  { key: 'config', label: 'Configuración del evento' },
  { key: 'plano', label: 'Plano subido' },
  { key: 'guests', label: 'Invitados importados' },
  { key: 'prefs', label: 'Preferencias configuradas' },
  { key: 'tables', label: 'Mesas configuradas' },
  { key: 'dist', label: 'Distribución calculada o confirmada' },
] as const;

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
    { href: routes.floorPlan, label: 'Plano', icon: navIcons.floorPlan },
    { href: routes.guests, label: 'Invitados', icon: navIcons.guests },
    {
      href: routes.preferences,
      label: 'Preferencias',
      icon: navIcons.preferences,
    },
    { href: routes.tables, label: 'Mesas', icon: navIcons.tables },
    {
      href: routes.distribution,
      label: 'Distribución',
      icon: navIcons.distribution,
    },
  ];
}

export function isAdminNavActive(
  pathname: string,
  href: string,
  exact?: boolean,
): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
