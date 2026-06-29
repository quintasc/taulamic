'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DistributionTableList } from '@/components/admin/distribution/distribution-table-list';
import { UnassignedGuestsListDialog } from '@/components/admin/distribution/unassigned-guests-list-dialog';
import { IconMap } from '@/components/icons';
import { StatCard } from '@/components/ui';
import type { DistributionProposal } from '@/lib/api';
import {
  PILOT_AFFINITY_LABEL,
  type DistributionTableGroup,
  type UnassignedGuestOption,
} from '@/lib/distribution-view';

export function DistributionCalculatedView({
  proposal,
  tableGroups,
  guestTotal,
  floorPlanHref,
  confirming,
  unassigningGuestId,
  assigningGuestId,
  unassignedGuests,
  onConfirm,
  onUnassignGuest,
  onAssignGuest,
}: {
  proposal: DistributionProposal;
  tableGroups: DistributionTableGroup[];
  guestTotal: number;
  floorPlanHref: string;
  confirming: boolean;
  unassigningGuestId?: string | null;
  assigningGuestId?: string | null;
  unassignedGuests?: UnassignedGuestOption[];
  onConfirm: () => void;
  onUnassignGuest?: (guestId: string) => void;
  onAssignGuest?: (tableId: string, guestId: string) => void | Promise<void>;
}) {
  const editable = proposal.status === 'draft';
  const [unassignedListOpen, setUnassignedListOpen] = useState(false);
  const freeSeats = Math.max(
    0,
    proposal.stats.totalCapacity - proposal.stats.assignedCount,
  );
  const unassigned = proposal.stats.unassignedCount;

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Afinidad media"
          value="—"
          hint={PILOT_AFFINITY_LABEL}
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
        tableGroups={tableGroups}
        editable={editable}
        unassigningGuestId={unassigningGuestId}
        assigningGuestId={assigningGuestId}
        unassignedGuests={unassignedGuests}
        onUnassignGuest={onUnassignGuest}
        onAssignGuest={onAssignGuest}
      />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          Comparador Top-K — disponible post-piloto
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href={floorPlanHref} className="btn-secondary gap-2">
            <IconMap width={16} height={16} />
            Ver en plano
          </Link>
          {proposal.status !== 'confirmed' ? (
            <button
              type="button"
              className="btn-primary shrink-0"
              disabled={confirming || proposal.unassignedGuestIds.length > 0}
              onClick={onConfirm}
            >
              {confirming ? 'Confirmando…' : 'Confirmar distribución'}
            </button>
          ) : (
            <p className="text-sm font-medium text-success-500">
              Distribución confirmada
            </p>
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
