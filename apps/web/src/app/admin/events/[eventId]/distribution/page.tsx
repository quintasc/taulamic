'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { DistributionCalculatedView } from '@/components/admin/distribution';
import { IconRefresh } from '@/components/icons';
import { Alert, EmptyState, PageHeader, ResponsiveButtonLabel } from '@/components/ui';
import { buildDistributionTableGroups, buildUnassignedGuestOptions } from '@/lib/distribution-view';
import { notifyDistributionChanged } from '@/lib/distribution-events';
import { useDistributionPlacementMutations } from '@/hooks/use-distribution-placement-mutations';
import {
  ApiError,
  companionGroupsApi,
  distributionApi,
  eventsApi,
  guestsApi,
  type DistributionCalculationStatus,
  type DistributionProposal,
  type GuestView,
} from '@/lib/api';
import { apiShapeFromUi, type TableEditDraft } from '@/lib/table-form';
import { useEvent } from '@/lib/event-context';
import { getActiveAffinityRulesOrdered, loadEventUiMeta } from '@/lib/event-ui-meta';
import {
  loadFloorPlanSetup,
  normalizeSetupForShape,
  saveFloorPlanSetup,
} from '@/lib/floor-plan-setup';
import { downloadDistributionReportPdf } from '@/lib/distribution-report-pdf';
import { getSetupNav } from '@/lib/setup-flow';
import { adminRoutes } from '@/lib/routes';
import {
  clearDistributionCalculationSession,
  readDistributionCalculationSession,
  writeDistributionCalculationSession,
} from '@/lib/distribution-calculation-session';
import { DISTRIBUTION_COPY } from '@/lib/ui-copy';

const CALCULATION_PHASE_LABEL: Record<
  DistributionCalculationStatus['phase'],
  string
> = {
  queued: 'En cola',
  computing: 'Calculando',
  persisting: 'Guardando',
  completed: 'Completado',
  failed: 'Falló',
};

const ASYNC_DISTRIBUTION_ERROR = 'ASYNC_DISTRIBUTION_ERROR';

function isFailedEmptyProposal(
  proposal: DistributionProposal | null,
): boolean {
  if (!proposal || proposal.status === 'calculating') {
    return false;
  }
  const asyncError = proposal.hardRuleViolations.some(
    (violation) => violation.code === ASYNC_DISTRIBUTION_ERROR,
  );
  return asyncError && proposal.stats.assignedCount === 0;
}

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
  const [savingTableId, setSavingTableId] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [calculationStatus, setCalculationStatus] =
    useState<DistributionCalculationStatus | null>(null);
  /** Cálculo en curso recordado al navegar (session) o mientras se reconecta. */
  const [resumingCalculation, setResumingCalculation] = useState(false);
  const [companionGroups, setCompanionGroups] = useState<
    Array<{ guestIds: string[]; keepTogether: boolean }>
  >([]);

  const {
    unassigningGuestId,
    assigningGuestId,
    movingGuestId,
    unassignGuest,
    assignGuest,
    moveGuest,
    updateGuestSeat,
  } = useDistributionPlacementMutations(
    eventId,
    setProposal,
    setWarning,
    setMutationError,
  );

  const refreshDistribution = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!eventId) {
        return null;
      }
      try {
        const latest = await distributionApi.get(eventId);
        setProposal(latest);
        if (!options?.silent) {
          setError(null);
        }
        return latest;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setProposal(null);
          clearDistributionCalculationSession(eventId);
          setResumingCalculation(false);
          return null;
        }
        if (!options?.silent) {
          setError('No se pudo cargar la distribución.');
        }
        return null;
      }
    },
    [eventId],
  );

  const refreshCalculationStatus = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!eventId) {
        return null;
      }
      try {
        const current = await distributionApi.status(eventId);
        setCalculationStatus((previous) => {
          // No mezclar progreso de un intento anterior (p. ej. failed al 100%).
          if (
            previous?.proposalId &&
            current.proposalId &&
            previous.proposalId !== current.proposalId &&
            current.state === 'calculating' &&
            (previous.progressPercent ?? 0) > (current.progressPercent ?? 0)
          ) {
            return {
              ...current,
              progressPercent: Math.min(current.progressPercent ?? 5, 12),
            };
          }
          if (
            previous?.proposalId &&
            current.proposalId &&
            previous.proposalId === current.proposalId &&
            current.state === 'calculating'
          ) {
            return {
              ...current,
              progressPercent: Math.max(
                previous.progressPercent ?? 0,
                current.progressPercent ?? 0,
              ),
            };
          }
          return current;
        });
        return current;
      } catch (err) {
        if (!options?.silent) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'No se pudo consultar el estado del cálculo.',
          );
        }
        return null;
      }
    },
    [eventId],
  );

  const applyCalculationTerminalStatus = useCallback(
    async (latestStatus: DistributionCalculationStatus) => {
      if (!eventId) {
        return;
      }
      if (latestStatus.state === 'calculating') {
        setResumingCalculation(true);
        if (latestStatus.proposalId) {
          writeDistributionCalculationSession(eventId, {
            proposalId: latestStatus.proposalId,
            startedAt: latestStatus.startedAt ?? new Date().toISOString(),
          });
        }
        return;
      }

      clearDistributionCalculationSession(eventId);
      setResumingCalculation(false);
      const latest = await refreshDistribution({ silent: true });
      if (latestStatus.state === 'failed') {
        setError(
          latestStatus.message ??
            'El cálculo de distribución falló. Puedes relanzarlo.',
        );
      } else if (isFailedEmptyProposal(latest)) {
        const asyncMessage = latest?.hardRuleViolations.find(
          (violation) => violation.code === ASYNC_DISTRIBUTION_ERROR,
        )?.message;
        setError(
          asyncMessage ??
            'El cálculo de distribución falló. Puedes relanzarlo.',
        );
      }
    },
    [eventId, refreshDistribution],
  );

  useEffect(() => {
    if (!eventId) {
      return;
    }

    let cancelled = false;

    void guestsApi
      .list(eventId)
      .then((response) => {
        if (!cancelled) {
          setGuests(response.guests);
          setGuestTotal(response.total);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGuests([]);
          setGuestTotal(0);
        }
      });

    void companionGroupsApi
      .list(eventId)
      .then((response) => {
        if (!cancelled) {
          setCompanionGroups(response.groups);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompanionGroups([]);
        }
      });

    async function hydrate() {
      setLoading(true);
      const session = readDistributionCalculationSession(eventId);
      if (session) {
        setResumingCalculation(true);
      }

      try {
        // status primero: puede recuperar jobs huérfanos en disco
        const latestStatus = await distributionApi
          .status(eventId)
          .catch(() => null);
        if (cancelled) {
          return;
        }

        if (latestStatus) {
          setCalculationStatus(latestStatus);
        }

        let latest: DistributionProposal | null = null;
        try {
          latest = await distributionApi.get(eventId);
          if (!cancelled) {
            setProposal(latest);
          }
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            if (!cancelled) {
              setProposal(null);
            }
          } else if (!cancelled && !session) {
            setError('No se pudo cargar la distribución.');
          }
        }

        if (cancelled) {
          return;
        }

        if (
          latestStatus?.state === 'calculating' ||
          latest?.status === 'calculating'
        ) {
          setResumingCalculation(true);
          const proposalId =
            latestStatus?.proposalId ?? latest?.id ?? session?.proposalId;
          if (proposalId) {
            writeDistributionCalculationSession(eventId, {
              proposalId,
              startedAt:
                latestStatus?.startedAt ??
                latest?.createdAt ??
                session?.startedAt ??
                new Date().toISOString(),
            });
          }
          setError(null);
          return;
        }

        if (session && !latestStatus && !latest) {
          setResumingCalculation(true);
          setError(
            'No se pudo reconectar con el cálculo en curso. Reintentando…',
          );
          return;
        }

        clearDistributionCalculationSession(eventId);
        setResumingCalculation(false);

        if (latestStatus?.state === 'failed') {
          setError(
            latestStatus.message ??
              'El cálculo de distribución falló. Puedes relanzarlo.',
          );
        } else if (isFailedEmptyProposal(latest)) {
          const asyncMessage = latest?.hardRuleViolations.find(
            (violation) => violation.code === ASYNC_DISTRIBUTION_ERROR,
          )?.message;
          setError(
            asyncMessage ??
              'El cálculo de distribución falló. Puedes relanzarlo.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const shouldPoll =
      proposal?.status === 'calculating' || resumingCalculation;
    if (!shouldPoll) {
      return;
    }

    const poll = async () => {
      const latestStatus = await refreshCalculationStatus({ silent: true });
      if (!latestStatus) {
        setError(
          'No se pudo reconectar con el cálculo en curso. Reintentando…',
        );
        return;
      }
      if (latestStatus.state === 'calculating') {
        setError(null);
        setResumingCalculation(true);
        if (latestStatus.proposalId) {
          writeDistributionCalculationSession(eventId, {
            proposalId: latestStatus.proposalId,
            startedAt: latestStatus.startedAt ?? new Date().toISOString(),
          });
        }
        if (proposal?.status !== 'calculating') {
          await refreshDistribution({ silent: true });
        }
        return;
      }
      await applyCalculationTerminalStatus(latestStatus);
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 1200);

    return () => window.clearInterval(timer);
  }, [
    eventId,
    proposal?.status,
    resumingCalculation,
    refreshCalculationStatus,
    refreshDistribution,
    applyCalculationTerminalStatus,
  ]);

  const tableGroups = useMemo(() => {
    if (!proposal || !eventId) {
      return [];
    }
    const affinityRelations = loadEventUiMeta(eventId).affinityRelations ?? [];
    return buildDistributionTableGroups(proposal, event, {
      guests,
      companionGroups,
      affinityRelations,
    });
  }, [proposal, event, eventId, guests, companionGroups]);

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
    // Reinicio inmediato: evita que la barra baje desde el 100% del intento anterior.
    setCalculationStatus({
      eventId,
      proposalId: null,
      state: 'calculating',
      phase: 'queued',
      progressPercent: 5,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elapsedMs: 0,
      estimatedRemainingMs: null,
      message: 'Iniciando cálculo…',
    });
    setResumingCalculation(true);
    try {
      const affinityMeta = loadEventUiMeta(eventId);
      const affinityRelations = affinityMeta.affinityRelations ?? [];
      const categoryAffinityRelations =
        affinityMeta.categoryAffinityRelations ?? [];
      const result = await distributionApi.run(
        eventId,
        getActiveAffinityRulesOrdered(eventId),
        affinityRelations.map((relation) => ({
          guestA: relation.guestA,
          guestB: relation.guestB,
          type: relation.type,
        })),
        categoryAffinityRelations.map((relation) => ({
          categoryA: relation.categoryA,
          categoryB: relation.categoryB,
          type: relation.type,
        })),
      );
      setProposal(result);
      if (result.status === 'calculating') {
        setResumingCalculation(true);
        writeDistributionCalculationSession(eventId, {
          proposalId: result.id,
          startedAt: result.createdAt,
        });
        setCalculationStatus((current) => ({
          eventId,
          proposalId: result.id,
          state: 'calculating',
          phase: 'queued',
          progressPercent: Math.min(current?.progressPercent ?? 5, 8),
          startedAt: result.createdAt,
          updatedAt: result.createdAt,
          elapsedMs: 0,
          estimatedRemainingMs: null,
          message: 'Cálculo en cola.',
        }));
        await refreshCalculationStatus({ silent: true });
      } else {
        clearDistributionCalculationSession(eventId);
        setResumingCalculation(false);
      }
      const guestsResponse = await guestsApi.list(eventId);
      setGuests(guestsResponse.guests);
      setGuestTotal(guestsResponse.total);
    } catch (err) {
      setResumingCalculation(false);
      setCalculationStatus(null);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Error al iniciar el cálculo de distribución.',
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

  async function updateTable(tableId: string, draft: TableEditDraft) {
    if (!eventId) {
      return false;
    }
    setSavingTableId(tableId);
    setMutationError(null);
    try {
      await eventsApi.updateTable(eventId, tableId, {
        label: draft.label.trim(),
        shape: apiShapeFromUi(draft.shape),
        estimatedCapacity: draft.capacity,
      });
      await refreshEvent({ silent: true });
      const updated = await distributionApi.get(eventId);
      setProposal(updated);
      notifyDistributionChanged(eventId);
      return true;
    } catch (err) {
      setMutationError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo actualizar la mesa.',
      );
      return false;
    } finally {
      setSavingTableId(null);
    }
  }

  const downloadConfirmedReport = useCallback(async () => {
    if (!eventId || !proposal || proposal.status !== 'confirmed') {
      return;
    }

    setDownloadingReport(true);
    try {
      const eventMeta = loadEventUiMeta(eventId);
      let roomSetup = loadFloorPlanSetup(eventId);

      try {
        const remoteSetup = await eventsApi.getRoomSetup(eventId);
        roomSetup = normalizeSetupForShape({
          shape: remoteSetup.shape,
          widthM: remoteSetup.widthM,
          lengthM: remoteSetup.lengthM,
          radiusM: remoteSetup.radiusM,
          placedAccessories: remoteSetup.placedAccessories,
        });
        saveFloorPlanSetup(eventId, roomSetup);
      } catch (remoteError) {
        if (!(remoteError instanceof ApiError && remoteError.status === 404)) {
          // Continuamos con el setup local si hay fallo puntual remoto.
        }
      }

      const customLayoutPositions: Record<string, { x: number; y: number }> = {};
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(
          `taulamic:customLayoutPositions:${eventId}`,
        );
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Record<
              string,
              { x: number; y: number }
            >;
            Object.entries(parsed).forEach(([key, value]) => {
              if (
                Number.isFinite(value?.x) &&
                Number.isFinite(value?.y)
              ) {
                customLayoutPositions[key] = {
                  x: Math.max(0, Math.min(100, value.x)),
                  y: Math.max(0, Math.min(100, value.y)),
                };
              }
            });
          } catch {
            // Si el JSON local está corrupto, ignoramos posiciones custom.
          }
        }
      }

      await downloadDistributionReportPdf({
        eventName: event?.name ?? 'Evento sin nombre',
        eventMeta,
        guests,
        companionGroups,
        guestTotal,
        proposal,
        tableGroups,
        roomSetup,
        customLayoutPositions,
      });
    } catch (reportError) {
      setError(
        reportError instanceof Error
          ? reportError.message
          : 'No se pudo generar el informe PDF.',
      );
    } finally {
      setDownloadingReport(false);
    }
  }, [
    companionGroups,
    event?.name,
    eventId,
    guests,
    guestTotal,
    proposal,
    tableGroups,
  ]);

  const isCalculating =
    proposal?.status === 'calculating' || resumingCalculation;
  const failedEmptyProposal = isFailedEmptyProposal(proposal);
  const hasCalculatedView =
    proposal !== null && !isCalculating && !failedEmptyProposal;
  const allTables = useMemo(
    () =>
      (event?.tables ?? []).map((table) => ({
        id: table.id,
        label: table.label,
      })),
    [event?.tables],
  );
  const calculationProgressPercent = Math.max(
    0,
    Math.min(100, calculationStatus?.progressPercent ?? 12),
  );
  const visibleProgressPercent = Math.max(18, calculationProgressPercent);
  const calculationPhaseLabel = CALCULATION_PHASE_LABEL[
    calculationStatus?.phase ?? 'computing'
  ];
  const calculationElapsedLabel =
    calculationStatus?.elapsedMs !== null && calculationStatus?.elapsedMs !== undefined
      ? `${Math.round(calculationStatus.elapsedMs / 1000)} s`
      : null;

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
              disabled={
                running || isCalculating || proposal.status === 'confirmed'
              }
              onClick={() => void calculate()}
            >
              <IconRefresh width={16} height={16} />
              {running || isCalculating ? 'Recalculando…' : 'Recalcular'}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              disabled={running || isCalculating}
              onClick={() => void calculate()}
              aria-label={DISTRIBUTION_COPY.calculate.full}
            >
              {running || isCalculating ? (
                DISTRIBUTION_COPY.calculating
              ) : (
                <ResponsiveButtonLabel
                  short={DISTRIBUTION_COPY.calculate.short}
                  full={DISTRIBUTION_COPY.calculate.full}
                />
              )}
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
      ) : isCalculating ? (
        <div className="space-y-3 rounded-xl border border-primary-500/35 bg-primary-100/30 p-4">
          <p className="text-sm font-medium text-neutral-900">
            {proposal?.status === 'calculating'
              ? 'Cálculo en curso. Puedes salir de esta pantalla: al volver se retoma el progreso.'
              : 'Reconectando con el cálculo en curso…'}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-primary-600">
              Progreso estimado: {visibleProgressPercent}%
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full border border-primary-300 bg-neutral-0">
              <div
                key={calculationStatus?.proposalId ?? 'starting'}
                className="h-full rounded-full bg-primary-500 transition-[width] duration-700 ease-out"
                style={{ width: `${visibleProgressPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-neutral-600">
            {calculationPhaseLabel}
            {calculationElapsedLabel ? ` · ${calculationElapsedLabel}` : ''}
          </p>
          {calculationStatus?.message ? (
            <p className="text-xs text-neutral-600">{calculationStatus.message}</p>
          ) : null}
        </div>
      ) : hasCalculatedView ? (
        <DistributionCalculatedView
          key={proposal.id}
          eventId={params.eventId}
          proposal={proposal}
          tableGroups={tableGroups}
          guestTotal={guestTotal}
          floorPlanHref={routes.floorPlanLayout}
          confirming={confirming}
          unassigningGuestId={unassigningGuestId}
          assigningGuestId={assigningGuestId}
          movingGuestId={movingGuestId}
          unassignedGuests={unassignedGuests}
          onConfirm={() => void confirm()}
          onUnassignGuest={(guestId) => void unassignGuest(guestId)}
          onAssignGuest={(tableId, guestId, seatIndex) =>
            assignGuest(tableId, guestId, seatIndex)
          }
          onMoveGuest={(guestId, tableId, seatIndex) =>
            moveGuest(guestId, tableId, seatIndex)
          }
          onUpdateGuestSeat={(guestId, seatIndex) =>
            updateGuestSeat(guestId, seatIndex)
          }
          mutationWarning={warning}
          mutationError={mutationError}
          guests={guests}
          affinityRelations={
            eventId ? loadEventUiMeta(eventId).affinityRelations ?? [] : []
          }
          companionGroups={companionGroups}
          allTables={allTables}
          savingTableId={savingTableId}
          onUpdateTable={(tableId, draft) => updateTable(tableId, draft)}
          downloadingReport={downloadingReport}
          onDownloadReport={() => {
            void downloadConfirmedReport();
          }}
        />
      ) : (
        <EmptyState
          title={
            failedEmptyProposal
              ? 'Cálculo interrumpido'
              : 'Sin distribución calculada'
          }
          description={
            failedEmptyProposal
              ? 'El cálculo anterior no terminó. Relanza para obtener una propuesta.'
              : DISTRIBUTION_COPY.emptyStateDescription
          }
          action={
            <button
              type="button"
              className="btn-primary"
              disabled={running || isCalculating}
              onClick={() => void calculate()}
              aria-label={DISTRIBUTION_COPY.calculate.full}
            >
              {running || isCalculating ? (
                DISTRIBUTION_COPY.calculating
              ) : (
                <ResponsiveButtonLabel
                  short={
                    failedEmptyProposal
                      ? 'Relanzar'
                      : DISTRIBUTION_COPY.calculate.short
                  }
                  full={
                    failedEmptyProposal
                      ? 'Relanzar cálculo'
                      : DISTRIBUTION_COPY.calculate.full
                  }
                />
              )}
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
