import { buildCompanionGroups } from '../../guest-import/domain/companion-group.engine';
import type { Guest } from '../../guest-import/domain/guest';
import type {
  DistributionProposal,
  ManualPlacementWarning,
} from './distribution.types';

const COMPANION_SEPARATION_MESSAGE =
  'Los acompanantes quedan en mesas distintas. El motor no propondria esta separacion; el cambio manual queda registrado.';

export function buildCompanionSeparationWarning(
  guests: Guest[],
  proposal: DistributionProposal,
  affectedGuestId: string,
): ManualPlacementWarning | null {
  for (const group of buildCompanionGroups(guests)) {
    if (!group.keepTogether || !group.guestIds.includes(affectedGuestId)) {
      continue;
    }

    if (!isCompanionGroupSeparated(proposal, group.guestIds)) {
      continue;
    }

    return {
      code: 'COMPANION_SEPARATED',
      message: COMPANION_SEPARATION_MESSAGE,
      guestIds: group.guestIds,
    };
  }

  return null;
}

function isCompanionGroupSeparated(
  proposal: DistributionProposal,
  guestIds: string[],
): boolean {
  const tableIds = new Set<string>();
  let assignedCount = 0;

  for (const guestId of guestIds) {
    const placement = proposal.placements.find((item) => item.guestId === guestId);
    if (placement) {
      assignedCount += 1;
      tableIds.add(placement.tableId);
      continue;
    }

    if (proposal.unassignedGuestIds.includes(guestId)) {
      continue;
    }

    return false;
  }

  if (assignedCount === 0) {
    return false;
  }

  return tableIds.size > 1 || assignedCount < guestIds.length;
}

export function attachManualWarnings(
  proposal: DistributionProposal,
  warnings: ManualPlacementWarning[],
): DistributionProposal {
  if (warnings.length === 0) {
    return proposal;
  }

  return {
    ...proposal,
    manualWarnings: warnings,
  };
}

export function stripManualWarnings(
  proposal: DistributionProposal,
): DistributionProposal {
  const { manualWarnings: _removed, ...persisted } = proposal as DistributionProposal & {
    manualWarnings?: ManualPlacementWarning[];
  };
  return persisted;
}
