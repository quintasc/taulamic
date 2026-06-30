'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconLock, IconMap } from '@/components/icons';
import { TaulamicLogo } from '@/components/brand/taulamic-logo';
import {
  getAdminNavItems,
  isAdminNavActive,
} from '@/components/admin/admin-nav';
import { adminRoutes } from '@/lib/routes';

export function AdminSidebarPanel({
  eventId,
  eventName,
  onNavigate,
}: {
  eventId: string;
  eventName?: string;
  /** Cierra el drawer móvil tras elegir una sección. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const routes = adminRoutes(eventId);
  const navItems = getAdminNavItems(eventId);
  const navMapActive = pathname === routes.navMap;

  return (
    <>
      <div className="shrink-0 border-b border-wf-3 px-4 py-3.5">
        <Link
          href="/"
          className="inline-flex rounded-[7px] outline-offset-2 hover:opacity-90"
          onClick={onNavigate}
        >
          <TaulamicLogo compact />
        </Link>
      </div>

      <div className="shrink-0 border-b border-wf-3 px-3 py-2.5">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.09em] text-wf-5">
          Evento en curso
        </p>
        <div className="flex items-center gap-1.5 rounded-[7px] border border-wf-3 bg-neutral-0 px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success-500" />
          <p className="flex-1 truncate text-xs font-medium text-neutral-900">
            {eventName ?? 'Sin evento'}
          </p>
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1.5"
        aria-label="Secciones del evento"
      >
        {navItems.map((item) => {
          const active = isAdminNavActive(pathname, item);
          const Icon = item.icon;

          if (item.locked) {
            return (
              <span
                key={item.label}
                title={item.lockedHint}
                className="flex w-full cursor-not-allowed items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-normal text-neutral-400"
              >
                <Icon className="shrink-0 text-wf-4" width={14} height={14} />
                <span className="flex-1">{item.label}</span>
                <IconLock
                  className="shrink-0 text-neutral-400"
                  width={12}
                  height={12}
                  aria-hidden
                />
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex w-full items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] transition ${
                active
                  ? 'nav-item-active'
                  : 'font-normal text-neutral-700 hover:bg-wf-2'
              }`}
            >
              <Icon
                className={`shrink-0 ${active ? 'text-primary-500' : 'text-wf-4'}`}
                width={14}
                height={14}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="admin-setup-bar-shell px-1.5">
        <Link
          href={routes.navMap}
          onClick={onNavigate}
          className={`admin-setup-bar-inner inline-flex w-full gap-2 rounded-[7px] px-2.5 text-[11px] transition ${
            navMapActive
              ? 'nav-item-active font-semibold'
              : 'text-wf-5 hover:bg-wf-1'
          }`}
        >
          <IconMap width={12} height={12} />
          Mapa navegación
        </Link>
      </div>
    </>
  );
}

/** Sidebar fija en escritorio (`lg+`). En móvil usar drawer vía `AdminShell`. */
export function AdminSidebar({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName?: string;
}) {
  return (
    <aside className="hidden h-full w-[var(--admin-sidebar-width)] shrink-0 flex-col border-r border-wf-3 bg-wf-1 lg:flex">
      <AdminSidebarPanel eventId={eventId} eventName={eventName} />
    </aside>
  );
}
