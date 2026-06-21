'use client';

import {
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
import { SetupChecklist } from '@/components/admin/setup-checklist';
import { useEventDashboard } from '@/hooks/use-event-dashboard';
import { setupSteps } from '@/lib/admin-nav';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

export function EventDashboard() {
  const { event, eventId } = useEvent();
  const routes = eventId ? adminRoutes(eventId) : null;
  const {
    subtitle,
    guestTotal,
    unassigned,
    tablesConfigured,
    tableTarget,
    guestProgress,
    hasAffinity,
    affinityHint,
    setupPercent,
    setupDone,
    setupStatus,
  } = useEventDashboard(event, eventId);

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
        <SetupChecklist setupStatus={setupStatus} />
      </section>
    </>
  );
}
