'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError, distributionApi, guestsApi } from '@/lib/api';
import { DISTRIBUTION_CHANGED_EVENT } from '@/lib/distribution-events';
import {
  formatEventSubtitle,
  isEventConfigComplete,
  loadEventUiMeta,
} from '@/lib/event-ui-meta';
import { PILOT_AFFINITY_LABEL, buildUnassignedGuestOptions, type UnassignedGuestOption } from '@/lib/distribution-view';
import { hasFloorPlanSetupSaved } from '@/lib/floor-plan-setup';
import { getCountableSetupSteps, setupSteps } from '@/lib/domain/setup-steps';
import type { EventDetail } from '@/lib/api';

function getGuestDashboardMeta(
  guestTotal: number,
  unassigned: number | null,
): {
  hint: string;
  progress?: number;
  progressColor?: 'success' | 'warning';
  valueHighlight?: boolean;
} {
  if (guestTotal === 0) {
    return { hint: 'Importa o añade invitados' };
  }
  if (unassigned === null) {
    return { hint: 'Pendiente de calcular' };
  }
  if (unassigned === 0) {
    return {
      hint: 'Todos asignados',
      progress: 100,
      progressColor: 'success',
      valueHighlight: true,
    };
  }

  const assigned = guestTotal - unassigned;
  const percent = Math.round((assigned / guestTotal) * 100);

  return {
    hint: `${assigned} de ${guestTotal} asignados · ${unassigned} sin asignar`,
    progress: percent,
    progressColor: 'warning',
  };
}

function getTablesDashboardMeta(
  tablesConfigured: number,
  totalCapacity: number,
  guestTotal: number,
): { hint: string } {
  if (tablesConfigured === 0) {
    return { hint: 'Añade mesas en Mesas' };
  }

  const capacityLabel = `${totalCapacity} ${totalCapacity === 1 ? 'plaza' : 'plazas'}`;

  if (guestTotal === 0) {
    return { hint: capacityLabel };
  }

  const diff = totalCapacity - guestTotal;
  if (diff > 0) {
    return { hint: `${capacityLabel} · Sobran ${diff} plazas` };
  }
  if (diff < 0) {
    return { hint: `${capacityLabel} · Faltan ${-diff} plazas` };
  }
  return { hint: `${capacityLabel} · Capacidad cubierta` };
}

export function useEventDashboard(event: EventDetail | null, eventId: string | null) {
  const [guestTotal, setGuestTotal] = useState(0);
  const [unassigned, setUnassigned] = useState<number | null>(null);
  const [unassignedGuests, setUnassignedGuests] = useState<UnassignedGuestOption[]>(
    [],
  );
  const [hasDistribution, setHasDistribution] = useState(false);
  const [affinitiesConfigured, setAffinitiesConfigured] = useState(false);
  const [configComplete, setConfigComplete] = useState(false);
  const [floorPlanUploaded, setFloorPlanUploaded] = useState(false);
  const [subtitle, setSubtitle] = useState('Resumen del evento');

  const tablesConfigured = event?.capacitySummary.tableCount ?? 0;
  const totalCapacity = event?.capacitySummary.totalCapacity ?? 0;

  function loadDistributionStats() {
    if (!eventId) {
      return;
    }

    void Promise.all([
      guestsApi.list(eventId),
      distributionApi.get(eventId).catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }),
    ])
      .then(([guestsResponse, proposal]) => {
        setGuestTotal(guestsResponse.total);
        if (!proposal) {
          setHasDistribution(false);
          setUnassigned(null);
          setUnassignedGuests([]);
          return;
        }
        setHasDistribution(true);
        setUnassigned(proposal.stats.unassignedCount);
        setUnassignedGuests(
          buildUnassignedGuestOptions(
            proposal.unassignedGuestIds,
            guestsResponse.guests,
          ),
        );
      })
      .catch(() => {
        setGuestTotal(0);
        setHasDistribution(false);
        setUnassigned(null);
        setUnassignedGuests([]);
      });
  }

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const meta = loadEventUiMeta(eventId);
    setConfigComplete(isEventConfigComplete(eventId, event?.name));
    setAffinitiesConfigured(Boolean(meta.affinitiesDraftSaved));
    setFloorPlanUploaded(
      Boolean(meta.floorPlanUploaded) || hasFloorPlanSetupSaved(eventId),
    );

    loadDistributionStats();
  }, [event?.name, eventId]);

  useEffect(() => {
    if (!eventId || typeof window === 'undefined') {
      return;
    }

    function handleDistributionChanged(event: Event) {
      const detail = (event as CustomEvent<{ eventId: string }>).detail;
      if (detail?.eventId === eventId) {
        loadDistributionStats();
      }
    }

    window.addEventListener(
      DISTRIBUTION_CHANGED_EVENT,
      handleDistributionChanged,
    );
    return () => {
      window.removeEventListener(
        DISTRIBUTION_CHANGED_EVENT,
        handleDistributionChanged,
      );
    };
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      setSubtitle('Resumen del evento');
      return;
    }
    const meta = loadEventUiMeta(eventId);
    setSubtitle(
      formatEventSubtitle(event?.name ?? '', meta, eventId),
    );
  }, [event?.name, eventId]);

  const setupStatus = useMemo(() => {
    const statusByKey: Record<string, boolean> = {
      config: configComplete,
      plano: floorPlanUploaded,
      guests: guestTotal > 0,
      invitations: false,
      tables: tablesConfigured > 0,
      prefs: affinitiesConfigured,
      dist: hasDistribution,
    };
    return setupSteps.map((step) => statusByKey[step.key] ?? false);
  }, [
    configComplete,
    floorPlanUploaded,
    guestTotal,
    tablesConfigured,
    affinitiesConfigured,
    hasDistribution,
  ]);

  const countableSetupSteps = getCountableSetupSteps();
  const setupDone = setupStatus.filter(
    (done, index) => done && !setupSteps[index]?.locked,
  ).length;
  const setupPercent = Math.round(
    (setupDone / countableSetupSteps.length) * 100,
  );

  const guestMeta = useMemo(
    () => getGuestDashboardMeta(guestTotal, unassigned),
    [guestTotal, unassigned],
  );

  const tablesMeta = useMemo(
    () => getTablesDashboardMeta(tablesConfigured, totalCapacity, guestTotal),
    [tablesConfigured, totalCapacity, guestTotal],
  );

  return {
    subtitle,
    guestTotal,
    unassigned,
    unassignedGuests,
    tablesConfigured,
    totalCapacity,
    guestMeta,
    tablesMeta,
    affinityHint: PILOT_AFFINITY_LABEL,
    setupPercent,
    setupDone,
    setupStatus,
  };
}
