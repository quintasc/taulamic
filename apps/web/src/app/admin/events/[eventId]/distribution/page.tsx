'use client';

import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { DistributionCalculatedView } from '@/components/admin/distribution';
import { IconRefresh } from '@/components/icons';
import { Alert, EmptyState, PageHeader, ResponsiveButtonLabel } from '@/components/ui';
import { useDistributionPage } from '@/hooks/use-distribution-page';
import { DISTRIBUTION_COPY } from '@/lib/ui-copy';

export default function DistributionPage() {
  const {
    eventId,
    routeEventId,
    routes,
    setupNav,
    proposal,
    guests,
    guestTotal,
    loading,
    running,
    confirming,
    savingTableId,
    downloadingReport,
    error,
    warning,
    mutationError,
    calculationStatus,
    companionGroups,
    unassigningGuestId,
    assigningGuestId,
    movingGuestId,
    unassignGuest,
    assignGuest,
    moveGuest,
    updateGuestSeat,
    tableGroups,
    unassignedGuests,
    calculate,
    confirm,
    updateTable,
    downloadConfirmedReport,
    isCalculating,
    failedEmptyProposal,
    hasCalculatedView,
    allTables,
    visibleProgressPercent,
    calculationPhaseLabel,
    calculationElapsedLabel,
    affinityRelations,
  } = useDistributionPage();

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
                running ||
                isCalculating ||
                proposal?.status === 'confirmed'
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
      ) : hasCalculatedView && proposal ? (
        <DistributionCalculatedView
          key={proposal.id}
          eventId={routeEventId}
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
          affinityRelations={affinityRelations}
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
