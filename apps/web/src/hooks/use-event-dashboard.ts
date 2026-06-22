'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiError, distributionApi, guestsApi } from '@/lib/api';
import { formatEventSubtitle, loadEventUiMeta } from '@/lib/event-ui-meta';
import { PILOT_AFFINITY_LABEL } from '@/lib/distribution-view';
import { setupSteps } from '@/lib/admin-nav';
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
    return { hint: 'Importa desde Excel' };
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
  const [distConfirmed, setDistConfirmed] = useState(false);
  const [subtitle, setSubtitle] = useState('Resumen del evento');

  const tablesConfigured = event?.capacitySummary.tableCount ?? 0;
  const totalCapacity = event?.capacitySummary.totalCapacity ?? 0;

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
