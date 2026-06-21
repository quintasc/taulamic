'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { event } = useEvent();
  const routes = adminRoutes(eventId);

  const navItems = [
    { href: routes.dashboard, label: 'Dashboard', exact: true },
    { href: routes.config, label: 'Configuración' },
    { href: routes.floorPlan, label: 'Plano' },
    { href: routes.guests, label: 'Invitados' },
    { href: routes.preferences, label: 'Preferencias' },
    { href: routes.tables, label: 'Mesas' },
    { href: routes.distribution, label: 'Distribución' },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-0">
      <aside className="flex w-sidebar shrink-0 flex-col border-r border-neutral-200 bg-neutral-100/60">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-5">
          <Image
            src="/taulamic-logo.png"
            alt="Taulamic"
            width={28}
            height={28}
          />
          <span className="text-sm font-semibold lowercase">taulamic</span>
        </div>

        <div className="border-b border-neutral-200 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Evento activo
          </p>
          <p className="mt-1 truncate text-sm font-medium text-neutral-900">
            {event?.name ?? 'Sin evento'}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {active ? (
                  <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r bg-primary-500" />
                ) : null}
                <span className={active ? 'pl-2' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 p-4">
          <Link href="/" className="text-xs text-neutral-500 hover:text-primary-500">
            ← Volver a marketing
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-neutral-0 p-8">{children}</main>
    </div>
  );
}

export function RequireEvent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { eventId, loading, error } = useEvent();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        Cargando evento…
      </div>
    );
  }

  if (!eventId || error) {
    return (
      <div className="card-admin max-w-lg">
        <h2 className="text-lg font-semibold">Sin evento activo</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Crea un evento o selecciona uno válido en la URL.
        </p>
        <Link href="/admin/events/new" className="btn-primary mt-4 inline-flex">
          Crear evento
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
