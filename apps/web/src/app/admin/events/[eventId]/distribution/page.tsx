'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { DistributionCalculatedView } from '@/components/admin/distribution';
import { IconRefresh } from '@/components/icons';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import { buildDistributionTableGroups, buildUnassignedGuestOptions } from '@/lib/distribution-view';
import {
  ApiError,
  distributionApi,
  guestsApi,
  type DistributionProposal,
  type GuestView,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { getSetupNav } from '@/lib/setup-flow';
import { adminRoutes } from '@/lib/routes';

export default function DistributionPage() {
  const params = useParams<{ eventId: string }>();
  const routes = adminRoutes(params.eventId);
  const { event, eventId, refreshEvent } = useEvent();
  const setupNav = eventId ? getSetupNav(eventId, 'dist') : null;
  const [proposal, setProposal] = useState<DistributionProposal | null>(null);
  const [guests, setGuests] = useState<GuestView[]>([]);
  const [guestTotal, setGuestTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [unassigningGuestId, setUnassigningGuestId] = useState<string | null>(
    null,
  );
  const [assigningGuestId, setAssigningGuestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    void guestsApi
      .list(eventId)
      .then((response) => {
        setGuests(response.guests);
        setGuestTotal(response.total);
      })
      .catch(() => {
        setGuests([]);
        setGuestTotal(0);
      });

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

  const unassignedGuests = useMemo(
    () =>
      proposal
        ? buildUnassignedGuestOptions(proposal.unassignedGuestIds, guests)
        : [],
    [proposal, guests],
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
      const guestsResponse = await guestsApi.list(eventId);
      setGuests(guestsResponse.guests);
      setGuestTotal(guestsResponse.total);
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

  async function unassignGuest(guestId: string) {
    if (!eventId) {
      return;
    }
    setUnassigningGuestId(guestId);
    setError(null);
    try {
      const result = await distributionApi.unassignGuest(eventId, guestId);
      setProposal(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo quitar el invitado de la mesa.',
      );
    } finally {
      setUnassigningGuestId(null);
    }
  }

  async function assignGuest(tableId: string, guestId: string) {
    if (!eventId) {
      return;
    }
    setAssigningGuestId(guestId);
    setError(null);
    try {
      const result = await distributionApi.assignGuest(
        eventId,
        guestId,
        tableId,
      );
      setProposal(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo asignar el invitado a la mesa.',
      );
    } finally {
      setAssigningGuestId(null);
    }
  }

  const hasCalculatedView = proposal !== null;

  return (
    <>
      <PageHeader
        title="Distribución"
        subtitle="Paso 7 del setup: asigna invitados a las mesas por afinidad"
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
          floorPlanHref={routes.floorPlanLayout}
          confirming={confirming}
          unassigningGuestId={unassigningGuestId}
          assigningGuestId={assigningGuestId}
          unassignedGuests={unassignedGuests}
          onConfirm={() => void confirm()}
          onUnassignGuest={(guestId) => void unassignGuest(guestId)}
          onAssignGuest={(tableId, guestId) => assignGuest(tableId, guestId)}
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

      {eventId ? (
        <SetupNavBar
          hidePrimary
          previousHref={setupNav?.previous?.href}
          previousLabel={setupNav?.previous?.previousLabel}
          nextHref={setupNav?.next?.href}
          nextLabel={setupNav?.next?.nextLabel}
          nextReady
        />
      ) : null}
    </>
  );
}
