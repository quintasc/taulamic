'use client';

import { useState } from 'react';
import { DistributionTableAccordion } from '@/components/admin/distribution/distribution-table-accordion';
import { StatCard } from '@/components/ui';
import type { DistributionProposal } from '@/lib/api';
import {
  PILOT_AVERAGE_AFFINITY_PERCENT,
  type DistributionTableGroup,
} from '@/lib/distribution-view';

export function DistributionCalculatedView({
  proposal,
  tableGroups,
  confirming,
  onConfirm,
}: {
  proposal: DistributionProposal;
  tableGroups: DistributionTableGroup[];
  confirming: boolean;
  onConfirm: () => void;
}) {
  const [openTableId, setOpenTableId] = useState<string | null>(
    tableGroups[0]?.tableId ?? null,
  );

  const guestTotal =
    proposal.stats.assignedCount + proposal.stats.unassignedCount;
  const tableCount = tableGroups.length;

  return (
    <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Afinidad media"
          value={`${PILOT_AVERAGE_AFFINITY_PERCENT}%`}
          progress={PILOT_AVERAGE_AFFINITY_PERCENT}
          progressColor="success"
          valueHighlight
        />
        <StatCard label="Invitados" value={String(guestTotal)} />
        <StatCard label="Mesas" value={String(tableCount)} />
        <StatCard
          label="Sin asignar"
          value={String(proposal.stats.unassignedCount)}
        />
      </div>

      <div className="space-y-3">
        {tableGroups.map((group) => (
          <DistributionTableAccordion
            key={group.tableId}
            group={group}
            open={openTableId === group.tableId}
            onToggle={() =>
              setOpenTableId((current) =>
                current === group.tableId ? null : group.tableId,
              )
            }
          />
        ))}
      </div>

      {proposal.status !== 'confirmed' ? (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            Comparador Top-K — disponible post-piloto
          </p>
          <button
            type="button"
            className="btn-primary shrink-0"
            disabled={confirming || proposal.unassignedGuestIds.length > 0}
            onClick={onConfirm}
          >
            {confirming
              ? 'Confirmando…'
              : 'Confirmar distribución para el evento'}
          </button>
        </div>
      ) : null}
    </>
  );
}
