'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AdminSidebar,
  AdminSidebarPanel,
} from '@/components/admin/admin-sidebar';
import { TaulamicLogo } from '@/components/brand/taulamic-logo';
import { IconClose, IconMenu } from '@/components/icons';
import {
  EVENT_CONFIG_STATUS_CHANGED,
  getDisplayEventName,
} from '@/lib/event-ui-meta';
import { useEvent } from '@/lib/event-context';

export function AdminShell({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { event } = useEvent();
  const [configStatusRevision, setConfigStatusRevision] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeMobileNav();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen, closeMobileNav]);

  useEffect(() => {
    function handleConfigStatusChanged(event: Event) {
      const detail = (event as CustomEvent<{ eventId: string }>).detail;
      if (detail?.eventId === eventId) {
        setConfigStatusRevision((current) => current + 1);
      }
    }

    window.addEventListener(
      EVENT_CONFIG_STATUS_CHANGED,
      handleConfigStatusChanged,
    );
    return () => {
      window.removeEventListener(
        EVENT_CONFIG_STATUS_CHANGED,
        handleConfigStatusChanged,
      );
    };
  }, [eventId]);

  const displayName = useMemo(
    () => getDisplayEventName(event?.name, eventId),
    [event?.name, eventId, configStatusRevision],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-wf-1">
      <AdminSidebar eventId={eventId} eventName={displayName} />

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-neutral-900/40 lg:hidden"
            aria-label="Cerrar menú de navegación"
            onClick={closeMobileNav}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="fixed inset-y-0 left-0 z-[60] flex w-[var(--admin-sidebar-width)] flex-col border-r border-wf-3 bg-wf-1 shadow-xl lg:hidden"
          >
            <div className="flex shrink-0 items-center justify-end border-b border-wf-3 px-2 py-1.5">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-neutral-600 hover:bg-wf-2 hover:text-neutral-900"
                aria-label="Cerrar menú"
                onClick={closeMobileNav}
              >
                <IconClose width={20} height={20} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <AdminSidebarPanel
                eventId={eventId}
                eventName={displayName}
                onNavigate={closeMobileNav}
              />
            </div>
          </aside>
        </>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-wf-3 bg-wf-1 px-4 py-2 lg:hidden">
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-neutral-700 hover:bg-wf-2 hover:text-primary-600"
            aria-label="Abrir menú de navegación"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <IconMenu width={22} height={22} />
          </button>
          {!mobileNavOpen ? (
            <Link
              href="/"
              className="shrink-0 rounded-[7px] outline-offset-2 hover:opacity-90"
            >
              <TaulamicLogo compact />
            </Link>
          ) : null}
          <div className="ml-auto flex min-w-0 items-center">
            <p className="min-w-0 max-w-[50%] truncate text-right text-sm font-medium text-neutral-900">
              {displayName}
            </p>
            <span className="inline-flex h-11 w-11 shrink-0" aria-hidden />
          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-wf-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
