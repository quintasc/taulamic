'use client';

import { useState } from 'react';
import { UnassignedGuestsListDialog } from '@/components/admin/distribution/unassigned-guests-list-dialog';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { PageHeader, SectionLabel, StatCard } from '@/components/ui';
import { EventCountdown } from '@/components/admin/event-countdown';
import { SetupJourney } from '@/components/admin/setup-journey';
import { useEventDashboard } from '@/hooks/use-event-dashboard';
import { getCountableSetupSteps } from '@/lib/domain/setup-steps';
import { useEvent } from '@/lib/event-context';
import { loadEventUiMeta } from '@/lib/event-ui-meta';
import { adminRoutes } from '@/lib/routes';
import { getDashboardSetupNav } from '@/lib/setup-flow';

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
  } = useEventDashboard(event, eventId);

  const dashboardNav =
    eventId !== null ? getDashboardSetupNav(eventId, setupStatus) : null;

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

      {eventId && dashboardNav ? (
        <SetupNavBar
          variant="inline"
          hidePrimary
          nextHref={dashboardNav.next.href}
          nextLabel={dashboardNav.next.nextLabel}
          nextReady
        />
      ) : null}

      {eventId ? (
        <section className="mt-6">
          <SectionLabel>Recorrido del setup</SectionLabel>
          <SetupJourney eventId={eventId} setupStatus={setupStatus} />
        </section>
      ) : null}

      <UnassignedGuestsListDialog
        open={unassignedListOpen}
        guests={unassignedGuests}
        distributionHref={routes?.distribution}
        onClose={() => setUnassignedListOpen(false)}
      />
    </>
  );
}
