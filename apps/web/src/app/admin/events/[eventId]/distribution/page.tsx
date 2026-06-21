'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Alert, EmptyState, PageHeader, StatCard } from '@/components/ui';
import {
  ApiError,
  distributionApi,
  type DistributionProposal,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

function groupByTable(proposal: DistributionProposal) {
  const groups = new Map<
    string,
    { tableLabel: string; guestNames: string[] }
  >();

  for (const placement of proposal.placements) {
    const current = groups.get(placement.tableId) ?? {
      tableLabel: placement.tableLabel,
      guestNames: [],
    };
    current.guestNames.push(placement.guestName);
    groups.set(placement.tableId, current);
  }

  return [...groups.values()];
}

export default function DistributionPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const routes = adminRoutes(params.eventId);
  const { eventId, refreshEvent } = useEvent();
  const [proposal, setProposal] = useState<DistributionProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }
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
    () => (proposal ? groupByTable(proposal) : []),
    [proposal],
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
      router.push(routes.dashboard);
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

  return (
    <>
      <PageHeader
        title="Distribución"
        subtitle="Asigna invitados a las mesas por afinidad."
        action={
          proposal ? (
            <button
              type="button"
              className="btn-secondary"
              disabled={running || proposal.status === 'confirmed'}
              onClick={() => void calculate()}
            >
              Recalcular distribución
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
      ) : proposal && proposal.placements.length > 0 ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Invitados asignados"
              value={String(proposal.stats.assignedCount)}
            />
            <StatCard
              label="Mesas usadas"
              value={String(tableGroups.length)}
            />
            <StatCard
              label="Sin asignar"
              value={String(proposal.stats.unassignedCount)}
            />
            <StatCard
              label="Motor"
              value={proposal.motorVersion}
              hint={proposal.status === 'confirmed' ? 'Confirmada' : 'Borrador'}
            />
          </div>

          <div className="space-y-4">
            {tableGroups.map((group) => (
              <details
                key={group.tableLabel}
                className="card-admin"
                open
              >
                <summary className="cursor-pointer text-sm font-semibold text-neutral-900">
                  {group.tableLabel} — {group.guestNames.length} pax
                </summary>
                <ul className="mt-3 space-y-1 text-sm text-neutral-700">
                  {group.guestNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          {proposal.status !== 'confirmed' ? (
            <div className="mt-8 flex flex-col items-end gap-2">
              <button
                type="button"
                className="btn-primary"
                disabled={
                  confirming || proposal.unassignedGuestIds.length > 0
                }
                onClick={() => void confirm()}
              >
                {confirming
                  ? 'Confirmando…'
                  : 'Confirmar distribución para el evento'}
              </button>
              <p className="text-xs text-neutral-500">
                Comparador Top-K — disponible post-piloto
              </p>
            </div>
          ) : null}
        </>
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
