import type { DistributionProposal } from './distribution.types';

type TableCapacityRef = {
  id: string;
  capacity: number;
};

export function reconcileProposalAfterTableRemoved(
  proposal: DistributionProposal,
  removedTableId: string,
  remainingTables: TableCapacityRef[],
): DistributionProposal | null {
  if (proposal.status === 'confirmed') {
    return null;
  }

  const totalCapacity = remainingTables.reduce(
    (sum, table) => sum + table.capacity,
    0,
  );
  const affectedPlacements = proposal.placements.filter(
    (placement) => placement.tableId === removedTableId,
  );

  if (affectedPlacements.length === 0) {
    if (
      proposal.stats.tableCount === remainingTables.length &&
      proposal.stats.totalCapacity === totalCapacity
    ) {
      return null;
    }

    return {
      ...proposal,
      stats: {
        ...proposal.stats,
        tableCount: remainingTables.length,
        totalCapacity,
      },
    };
  }

  const placements = proposal.placements.filter(
    (placement) => placement.tableId !== removedTableId,
  );
  const affectedGuestIds = affectedPlacements.map(
    (placement) => placement.guestId,
  );
  const unassignedGuestIds = [
    ...new Set([...proposal.unassignedGuestIds, ...affectedGuestIds]),
  ];
  const assignedCount = placements.length;
  const unassignedCount = unassignedGuestIds.length;

  return {
    ...proposal,
    placements,
    unassignedGuestIds,
    stats: {
      assignedCount,
      unassignedCount,
      tableCount: remainingTables.length,
      totalCapacity,
    },
  };
}
