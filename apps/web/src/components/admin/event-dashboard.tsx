'use client';

import { useState } from 'react';
import {
  IconDistribution,
  IconFloorPlan,
  IconHeart,
  IconSettings,
  IconTable,
  IconUsers,
} from '@/components/icons';
import { UnassignedGuestsListDialog } from '@/components/admin/distribution/unassigned-guests-list-dialog';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import {
  PageHeader,
  QuickAccessCard,
  SectionLabel,
  StatCard,
} from '@/components/ui';
import { EventCountdown } from '@/components/admin/event-countdown';
import { SetupJourney } from '@/components/admin/setup-journey';
import { useEventDashboard } from '@/hooks/use-event-dashboard';
import { getCountableSetupSteps } from '@/lib/domain/setup-steps';
import { useEvent } from '@/lib/event-context';
import { loadEventUiMeta } from '@/lib/event-ui-meta';
import { adminRoutes } from '@/lib/routes';
import { getDashboardSetupNav, getSetupStepHref, type SetupFlowKey } from '@/lib/setup-flow';
import type { ReactNode } from 'react';

const QUICK_ACCESS_STEPS: {
  key: SetupFlowKey;
  label: string;
  icon: ReactNode;
}[] = [
  {
    key: 'config',
    label: 'Configuración',
    icon: <IconSettings width={16} height={16} />,
  },
  {
    key: 'guests',
    label: 'Invitados',
    icon: <IconUsers width={16} height={16} />,
  },
  {
    key: 'plano',
    label: 'Plano',
    icon: <IconFloorPlan width={16} height={16} />,
  },
  {
    key: 'tables',
    label: 'Mesas',
    icon: <IconTable width={16} height={16} />,
  },
  {
    key: 'prefs',
    label: 'Afinidades',
    icon: <IconHeart width={16} height={16} />,
  },
  {
    key: 'dist',
    label: 'Distribución',
    icon: <IconDistribution width={16} height={16} />,
  },
];

export function EventDashboard() {
  const { event, eventId } = useEvent();
  const routes = eventId ? adminRoutes(eventId) : null;
  const [unassignedListOpen, setUnassignedListOpen] = useState(false);
  const {
    subtitle,
    guestTotal,
    unassigned,
    unassignedGuests,
    tablesConfigured,
    guestMeta,
    tablesMeta,
    affinityHint,
    setupPercent,
    setupDone,
    setupStatus,
    configComplete,
  } = useEventDashboard(event, eventId);

  const dashboardNav =
    eventId !== null ? getDashboardSetupNav(eventId, configComplete) : null;

  const unassignedHintFragment =
    unassigned !== null && unassigned > 0
      ? `${unassigned} sin asignar`
      : undefined;
  const canOpenUnassignedList =
    unassigned !== null && unassigned > 0 && unassignedGuests.length > 0;

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
          clickableHint={unassignedHintFragment}
          onClick={
            canOpenUnassignedList
              ? () => setUnassignedListOpen(true)
              : undefined
          }
          ariaLabel="Ver invitados sin asignar"
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

      {eventId ? (
        <section className="mt-6">
          <SectionLabel>Recorrido del setup</SectionLabel>
          <SetupJourney eventId={eventId} setupStatus={setupStatus} />
        </section>
      ) : null}

      {eventId ? (
        <section className="mt-6">
          <SectionLabel>Accesos rápidos</SectionLabel>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACCESS_STEPS.map((step) => (
              <QuickAccessCard
                key={step.key}
                href={getSetupStepHref(eventId, step.key)}
                label={step.label}
                icon={step.icon}
              />
            ))}
          </div>
        </section>
      ) : null}

      <UnassignedGuestsListDialog
        open={unassignedListOpen}
        guests={unassignedGuests}
        distributionHref={routes?.distribution}
        onClose={() => setUnassignedListOpen(false)}
      />

      {eventId && dashboardNav ? (
        <SetupNavBar
          hidePrimary
          nextHref={dashboardNav.next.href}
          nextLabel={dashboardNav.next.nextLabel}
          nextReady
        />
      ) : null}
    </>
  );
}
