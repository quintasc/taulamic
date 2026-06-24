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
import { EventCountdown } from '@/components/admin/event-countdown';
import { SetupChecklist } from '@/components/admin/setup-checklist';
import { useEventDashboard } from '@/hooks/use-event-dashboard';
import { getCountableSetupSteps } from '@/lib/admin-nav';
import { useEvent } from '@/lib/event-context';
import { loadEventUiMeta } from '@/lib/event-ui-meta';
import { adminRoutes } from '@/lib/routes';

export function EventDashboard() {
  const { event, eventId } = useEvent();
  const routes = eventId ? adminRoutes(eventId) : null;
  const {
    subtitle,
    guestTotal,
    tablesConfigured,
    guestMeta,
    tablesMeta,
    affinityHint,
    setupPercent,
    setupDone,
    setupStatus,
  } = useEventDashboard(event, eventId);

  const eventDate = eventId ? loadEventUiMeta(eventId).date : undefined;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={subtitle} />

      <EventCountdown eventDate={eventDate} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invitados"
          value={String(guestTotal)}
          hint={guestMeta.hint}
          progress={guestMeta.progress}
          progressColor={guestMeta.progressColor}
          valueHighlight={guestMeta.valueHighlight}
        />
        <StatCard
          label="Mesas"
          value={String(tablesConfigured)}
          hint={tablesMeta.hint}
        />
        <StatCard
          label="Afinidad media"
          value="—"
          hint={affinityHint}
        />
        <StatCard
          label="Setup"
          value={`${setupPercent}%`}
          hint={`${setupDone} de ${getCountableSetupSteps().length} pasos`}
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
