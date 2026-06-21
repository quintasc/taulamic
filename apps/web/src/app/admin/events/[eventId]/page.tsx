'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconDistribution,
  IconFloorPlan,
  IconTable,
  IconUsers,
} from '@/components/icons';
import {
  PageHeader,
  QuickAccessCard,
  SectionLabel,
  StatCard,
} from '@/components/ui';
import {
  ApiError,
  distributionApi,
  guestsApi,
} from '@/lib/api';
import {
  formatEventSubtitle,
  loadEventUiMeta,
  parseTableCountTarget,
} from '@/lib/event-ui-meta';
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
  const [affinityHint, setAffinityHint] = useState('Tras calcular distribución');
  const [subtitle, setSubtitle] = useState('Resumen del evento');
  const [tableTarget, setTableTarget] = useState(0);

  const routes = eventId ? adminRoutes(eventId) : null;
  const tablesConfigured = event?.capacitySummary.tableCount ?? 0;

  useEffect(() => {
    if (!eventId) {
      setTableTarget(tablesConfigured);
      return;
    }
    setTableTarget(
      parseTableCountTarget(loadEventUiMeta(eventId), tablesConfigured),
    );
  }, [eventId, tablesConfigured]);

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
        if (proposal.stats.assignedCount > 0) {
          setAffinityHint(
            proposal.status === 'confirmed'
              ? 'Distribución confirmada'
              : 'Última distribución',
          );
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setUnassigned(null);
          setDistConfirmed(false);
        }
      });
  }, [eventId]);

  useEffect(() => {
    if (!event?.name || !eventId) {
      setSubtitle(event?.name ?? 'Resumen del evento');
      return;
    }
    const meta = loadEventUiMeta(eventId);
    setSubtitle(formatEventSubtitle(event.name, meta));
  }, [event?.name, eventId]);

  const setupStatus = [
    Boolean(event?.name),
    false,
    guestTotal > 0,
    false,
    tablesConfigured > 0,
    distConfirmed,
  ];
  const setupDone = setupStatus.filter(Boolean).length;
  const setupPercent = Math.round((setupDone / setupSteps.length) * 100);

  const guestProgress =
    guestTotal > 0 && unassigned !== null
      ? Math.round(((guestTotal - unassigned) / guestTotal) * 100)
      : guestTotal > 0
        ? 100
        : 0;

  const hasAffinity = distConfirmed || affinityHint === 'Última distribución';

  return (
    <>
      <PageHeader title="Dashboard" subtitle={subtitle} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          progress={guestTotal > 0 ? guestProgress : 0}
        />
        <StatCard
          label="Mesas"
          value={
            tableTarget > 0
              ? `${tablesConfigured}/${tableTarget}`
              : String(tablesConfigured)
          }
          hint={`${tablesConfigured} configuradas`}
          progress={
            tableTarget > 0 ? (tablesConfigured / tableTarget) * 100 : 0
          }
        />
        <StatCard
          label="Afinidad media"
          value={hasAffinity ? '82%' : '—'}
          hint={affinityHint}
          progress={hasAffinity ? 82 : undefined}
          progressColor="success"
          valueHighlight={hasAffinity}
        />
        <StatCard
          label="Setup"
          value={`${setupPercent}%`}
          hint={`${setupDone} de ${setupSteps.length} pasos`}
          progress={setupPercent}
        />
      </div>

      {routes ? (
        <section className="mt-6">
          <SectionLabel>Accesos rápidos</SectionLabel>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAccessCard
              href={routes.floorPlan}
              label="Editar plano"
              icon={<IconFloorPlan width={16} height={16} />}
            />
            <QuickAccessCard
              href={routes.guests}
              label="Ver invitados"
              icon={<IconUsers width={16} height={16} />}
            />
            <QuickAccessCard
              href={routes.tables}
              label="Gestionar mesas"
              icon={<IconTable width={16} height={16} />}
            />
            <QuickAccessCard
              href={routes.distribution}
              label="Calcular distribución"
              icon={<IconDistribution width={16} height={16} />}
            />
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <SectionLabel>Estado del setup</SectionLabel>
        <div className="card-admin overflow-hidden p-0">
          {setupSteps.map((step, i) => (
            <SetupItem
              key={step.key}
              done={setupStatus[i]}
              label={step.label}
              isLast={i === setupSteps.length - 1}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function SetupItem({
  done,
  label,
  isLast,
}: {
  done: boolean;
  label: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[11px] px-[18px] py-2.5 ${
        isLast ? '' : 'border-b border-wf-2'
      }`}
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
          done ? 'bg-success-500 text-white' : 'bg-wf-3'
        }`}
      >
        {done ? (
          <IconCheck width={10} height={10} strokeWidth={3} />
        ) : null}
      </span>
      <span
        className={`text-[13px] ${
          done ? 'font-medium text-neutral-700' : 'text-neutral-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
