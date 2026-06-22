'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { DistributionCalculatedView } from '@/components/admin/distribution';
import { IconRefresh } from '@/components/icons';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import {
  ApiError,
  distributionApi,
  guestsApi,
  type DistributionProposal,
} from '@/lib/api';
import { buildDistributionTableGroups } from '@/lib/distribution-view';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

export default function DistributionPage() {
  const params = useParams<{ eventId: string }>();
  const routes = adminRoutes(params.eventId);
  const { event, eventId, refreshEvent } = useEvent();
  const [proposal, setProposal] = useState<DistributionProposal | null>(null);
  const [guestTotal, setGuestTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      .then(setProposal)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setProposal(null);
          return;
        }
        setError('No se pudo cargar la distribución.');
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const tableGroups = useMemo(
    () => (proposal ? buildDistributionTableGroups(proposal, event) : []),
    [proposal, event],
  );

  async function calculate() {
    if (!eventId) {
      return;
    }
    setRunning(true);
    setError(null);
    try {
      const result = await distributionApi.run(eventId);
      setProposal(result);
      const guests = await guestsApi.list(eventId);
      setGuestTotal(guests.total);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Error al calcular la distribución.',
      );
    } finally {
      setRunning(false);
    }
  }

  async function confirm() {
    if (!eventId) {
      return;
    }
    setConfirming(true);
    setError(null);
    try {
      const result = await distributionApi.confirm(eventId);
      setProposal(result);
      await refreshEvent();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo confirmar la distribución.',
      );
    } finally {
      setConfirming(false);
    }
  }

  const hasCalculatedView = proposal !== null;

  return (
    <>
      <PageHeader
        title="Distribución"
        subtitle="Asigna invitados a las mesas por afinidad"
        action={
          hasCalculatedView ? (
            <button
              type="button"
              className="btn-secondary gap-2"
              disabled={running || proposal.status === 'confirmed'}
              onClick={() => void calculate()}
            >
              <IconRefresh width={16} height={16} />
              {running ? 'Recalculando…' : 'Recalcular'}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={running}
              onClick={() => void calculate()}
            >
              {running ? 'Calculando…' : 'Calcular distribución'}
            </button>
          )
        }
      />

      {error ? (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando…</p>
      ) : hasCalculatedView ? (
        <DistributionCalculatedView
          key={proposal.id}
          proposal={proposal}
          tableGroups={tableGroups}
          guestTotal={guestTotal}
          floorPlanHref={routes.floorPlan}
          confirming={confirming}
          onConfirm={() => void confirm()}
        />
      ) : (
        <EmptyState
          title="Sin distribución calculada"
          description="Pulsa «Calcular distribución» para asignar invitados a las mesas según afinidad."
          action={
            <button
              type="button"
              className="btn-primary"
              disabled={running}
              onClick={() => void calculate()}
            >
              Calcular distribución
            </button>
          }
        />
      )}
    </>
  );
}
