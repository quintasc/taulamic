'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader, StatCard } from '@/components/ui';
import {
  ApiError,
  distributionApi,
  guestsApi,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

const setupSteps = [
  { key: 'config', label: 'Configuración del evento' },
  { key: 'plano', label: 'Plano subido y confirmado' },
  { key: 'guests', label: 'Invitados importados' },
  { key: 'prefs', label: 'Preferencias configuradas' },
  { key: 'tables', label: 'Mesas configuradas' },
  { key: 'dist', label: 'Distribución calculada' },
];

export default function EventDashboardPage() {
  const { event, eventId } = useEvent();
  const [guestTotal, setGuestTotal] = useState(0);
  const [unassigned, setUnassigned] = useState<number | null>(null);
  const [distConfirmed, setDistConfirmed] = useState(false);

  const routes = eventId ? adminRoutes(eventId) : null;

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void guestsApi
      .list(eventId)
      .then((response) => setGuestTotal(response.total))
      .catch(() => setGuestTotal(0));

    void distributionApi
      .get(eventId)
      .then((proposal) => {
        setUnassigned(proposal.stats.unassignedCount);
        setDistConfirmed(proposal.status === 'confirmed');
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setUnassigned(null);
          setDistConfirmed(false);
        }
      });
  }, [eventId]);

  const tablesConfigured = event?.capacitySummary.tableCount ?? 0;
  let setupDone = 0;
  if (event?.name) setupDone += 1;
  if (tablesConfigured > 0) setupDone += 1;
  if (guestTotal > 0) setupDone += 1;
  if (distConfirmed) setupDone += 1;
  const setupPercent = Math.round((setupDone / setupSteps.length) * 100);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Resumen del evento ${event?.name ?? ''}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invitados"
          value={String(guestTotal)}
          hint={
            unassigned !== null && unassigned > 0
              ? `${unassigned} sin asignar`
              : guestTotal > 0
                ? 'Todos asignados'
                : 'Importa desde Excel'
          }
        />
        <StatCard
          label="Mesas"
          value={String(tablesConfigured)}
          hint={`${event?.capacitySummary.totalCapacity ?? 0} plazas`}
        />
        <StatCard
          label="Afinidad media"
          value={distConfirmed ? '—' : '—'}
          hint="Tras calcular distribución"
        />
        <StatCard
          label="Setup"
          value={`${setupPercent}%`}
          hint={`${setupDone} de ${setupSteps.length} pasos`}
        />
      </div>

      {routes ? (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Accesos rápidos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: routes.floorPlan, label: 'Editar plano' },
              { href: routes.guests, label: 'Ver invitados' },
              { href: routes.tables, label: 'Gestionar mesas' },
              { href: routes.distribution, label: 'Calcular distribución' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card-admin text-center text-sm font-semibold text-neutral-900 transition hover:border-primary-500/40 hover:bg-primary-100/30"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 card-admin">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Estado del setup
        </h2>
        <ul className="mt-4 space-y-3">
          <SetupItem done={Boolean(event?.name)} label={setupSteps[0].label} />
          <SetupItem done={false} label={setupSteps[1].label} />
          <SetupItem done={guestTotal > 0} label={setupSteps[2].label} />
          <SetupItem done={false} label={setupSteps[3].label} />
          <SetupItem done={tablesConfigured > 0} label={setupSteps[4].label} />
          <SetupItem done={distConfirmed} label={setupSteps[5].label} />
        </ul>
      </section>
    </>
  );
}

function SetupItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? 'bg-success-500/15 text-success-500'
            : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        {done ? '✓' : '○'}
      </span>
      <span className={done ? 'text-neutral-900' : 'text-neutral-500'}>
        {label}
      </span>
    </li>
  );
}
