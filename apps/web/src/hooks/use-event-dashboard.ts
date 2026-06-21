'use client';

import { useEffect, useState } from 'react';
import { ApiError, distributionApi, guestsApi } from '@/lib/api';
import {
  formatEventSubtitle,
  loadEventUiMeta,
  parseTableCountTarget,
} from '@/lib/event-ui-meta';
import { setupSteps } from '@/lib/admin-nav';
import type { EventDetail } from '@/lib/api';

export function useEventDashboard(event: EventDetail | null, eventId: string | null) {
  const [guestTotal, setGuestTotal] = useState(0);
  const [unassigned, setUnassigned] = useState<number | null>(null);
  const [distConfirmed, setDistConfirmed] = useState(false);
  const [affinityHint, setAffinityHint] = useState('Tras calcular distribución');
  const [subtitle, setSubtitle] = useState('Resumen del evento');
  const [tableTarget, setTableTarget] = useState(0);

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

  return {
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
  };
}
