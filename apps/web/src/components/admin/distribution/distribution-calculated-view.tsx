'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DistributionTableList } from '@/components/admin/distribution/distribution-table-list';
import { UnassignedGuestsListDialog } from '@/components/admin/distribution/unassigned-guests-list-dialog';
import { IconMap } from '@/components/icons';
import { StatCard } from '@/components/ui';
import { ResponsiveButtonLabel } from '@/components/ui/responsive-button-label';
import type { DistributionProposal, GuestView } from '@/lib/api';
import { DISTRIBUTION_COPY } from '@/lib/ui-copy';
import {
  type DistributionTableGroup,
  type UnassignedGuestOption,
} from '@/lib/distribution-view';
import type { AffinityRelationInput, CompanionGroupInput } from '@/lib/table-affinity-score';
import type { TableEditDraft } from '@/lib/table-form';

export function DistributionCalculatedView({
  proposal,
  tableGroups,
  guestTotal,
  floorPlanHref,
  confirming,
  unassigningGuestId,
  assigningGuestId,
  movingGuestId = null,
  unassignedGuests,
  onConfirm,
  onUnassignGuest,
  onAssignGuest,
  onMoveGuest,
  onUpdateGuestSeat,
  mutationWarning = null,
  mutationError = null,
  eventId,
  guests = [],
  affinityRelations = [],
  companionGroups = [],
  allTables = [],
  savingTableId = null,
  downloadingReport = false,
  onUpdateTable,
  onDownloadReport,
}: {
  eventId: string;
  proposal: DistributionProposal;
  tableGroups: DistributionTableGroup[];
  guestTotal: number;
  floorPlanHref: string;
  confirming: boolean;
  unassigningGuestId?: string | null;
  assigningGuestId?: string | null;
  movingGuestId?: string | null;
  unassignedGuests?: UnassignedGuestOption[];
  onConfirm: () => void;
  onUnassignGuest?: (guestId: string) => void;
  onAssignGuest?: (
    tableId: string,
    guestId: string,
    seatIndex?: number,
  ) => void | Promise<void>;
  onMoveGuest?: (
    guestId: string,
    targetTableId: string,
    seatIndex?: number,
  ) => void | Promise<void>;
  onUpdateGuestSeat?: (guestId: string, seatIndex: number) => void | Promise<void>;
  mutationWarning?: string | null;
  mutationError?: string | null;
  guests?: GuestView[];
  affinityRelations?: AffinityRelationInput[];
  companionGroups?: CompanionGroupInput[];
  allTables?: Array<{ id: string; label: string }>;
  savingTableId?: string | null;
  downloadingReport?: boolean;
  onUpdateTable?: (tableId: string, draft: TableEditDraft) => Promise<boolean>;
  onDownloadReport?: () => void;
}) {
  const editable = proposal.status === 'draft';
  const [unassignedListOpen, setUnassignedListOpen] = useState(false);
  const freeSeats = Math.max(
    0,
    proposal.stats.totalCapacity - proposal.stats.assignedCount,
  );
  const unassigned = proposal.stats.unassignedCount;
  const compatibilityPercent = proposal.compatibilityScore?.globalPercent;

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Compatibilidad"
          value={
            compatibilityPercent !== undefined
              ? `${compatibilityPercent}%`
              : '—'
          }
        />
        <StatCard label="Total invitados" value={String(guestTotal)} />
        <StatCard
          label="Sin asignar"
          value={String(unassigned)}
          valueHighlight={unassigned === 0}
          hint={
            unassigned > 0
              ? 'Pulsa para ver la lista'
              : 'Todos con mesa asignada'
          }
          onClick={
            unassigned > 0 && (unassignedGuests?.length ?? 0) > 0
              ? () => setUnassignedListOpen(true)
              : undefined
          }
          ariaLabel="Ver invitados sin asignar"
        />
        <StatCard label="Plazas libres" value={String(freeSeats)} />
      </div>

      <DistributionTableList
        eventId={eventId}
        proposal={proposal}
        tableGroups={tableGroups}
        editable={editable}
        unassigningGuestId={unassigningGuestId}
        assigningGuestId={assigningGuestId}
        movingGuestId={movingGuestId}
        unassignedGuests={unassignedGuests}
        onUnassignGuest={onUnassignGuest}
        onAssignGuest={onAssignGuest}
        onMoveGuest={onMoveGuest}
        onUpdateGuestSeat={onUpdateGuestSeat}
        mutationWarning={mutationWarning}
        mutationError={mutationError}
        guests={guests}
        affinityRelations={affinityRelations}
        companionGroups={companionGroups}
        allTables={allTables}
        savingTableId={savingTableId}
        onUpdateTable={onUpdateTable}
      />

      <div className="mt-8 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-xs text-neutral-500">
          {DISTRIBUTION_COPY.comparadorTopK}
        </p>
        <div className="flex w-full min-w-0 flex-col gap-2 lg:w-auto lg:flex-row lg:items-center">
          <Link
            href={floorPlanHref}
            className="btn-secondary w-full gap-2 whitespace-nowrap lg:w-auto"
            aria-label={DISTRIBUTION_COPY.viewFloorPlan.full}
          >
            <IconMap width={16} height={16} />
            <ResponsiveButtonLabel
              short={DISTRIBUTION_COPY.viewFloorPlan.short}
              full={DISTRIBUTION_COPY.viewFloorPlan.full}
            />
          </Link>
          {proposal.status !== 'confirmed' ? (
            <button
              type="button"
              className="btn-primary w-full min-w-0 lg:w-auto"
              disabled={confirming || proposal.unassignedGuestIds.length > 0}
              onClick={onConfirm}
              aria-label={DISTRIBUTION_COPY.confirm.full}
            >
              {confirming ? (
                DISTRIBUTION_COPY.confirming
              ) : (
                <ResponsiveButtonLabel
                  short={DISTRIBUTION_COPY.confirm.short}
                  full={DISTRIBUTION_COPY.confirm.full}
                />
              )}
            </button>
          ) : (
            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <p className="text-sm font-medium text-success-500">
                Distribución confirmada
              </p>
              <button
                type="button"
                className="btn-secondary w-full whitespace-nowrap sm:w-auto"
                onClick={onDownloadReport}
                disabled={downloadingReport}
                aria-label={DISTRIBUTION_COPY.downloadReport.full}
              >
                {downloadingReport ? (
                  DISTRIBUTION_COPY.downloadingReport
                ) : (
                  <ResponsiveButtonLabel
                    short={DISTRIBUTION_COPY.downloadReport.short}
                    full={DISTRIBUTION_COPY.downloadReport.full}
                  />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <UnassignedGuestsListDialog
        open={unassignedListOpen}
        guests={unassignedGuests ?? []}
        onClose={() => setUnassignedListOpen(false)}
      />
    </>
  );
}
