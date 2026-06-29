import type { DistributionProposal, HardRuleViolation } from './distribution.types';

export class UnassignGuestError extends Error {
  constructor(
    readonly code:
      | 'DISTRIBUTION_NOT_EDITABLE'
      | 'GUEST_NOT_ASSIGNED'
      | 'GUEST_ALREADY_UNASSIGNED',
    message: string,
  ) {
    super(message);
    this.name = 'UnassignGuestError';
  }
}

export function unassignGuestFromProposal(
  proposal: DistributionProposal,
  guestId: string,
): DistributionProposal {
  if (proposal.status !== 'draft') {
    throw new UnassignGuestError(
      'DISTRIBUTION_NOT_EDITABLE',
      'Solo se puede desasignar en una propuesta en borrador.',
    );
  }

  const placementIndex = proposal.placements.findIndex(
    (placement) => placement.guestId === guestId,
  );

  if (placementIndex < 0) {
    if (proposal.unassignedGuestIds.includes(guestId)) {
      throw new UnassignGuestError(
        'GUEST_ALREADY_UNASSIGNED',
        'El invitado ya esta sin asignar.',
      );
    }

    throw new UnassignGuestError(
      'GUEST_NOT_ASSIGNED',
      'El invitado no esta asignado a ninguna mesa.',
    );
  }

  const placements = proposal.placements.filter(
    (placement) => placement.guestId !== guestId,
  );
  const unassignedGuestIds = proposal.unassignedGuestIds.includes(guestId)
    ? proposal.unassignedGuestIds
    : [...proposal.unassignedGuestIds, guestId];

  return {
    ...proposal,
    placements,
    unassignedGuestIds,
    hardRuleViolations: pruneViolationsAfterUnassign(
      proposal.hardRuleViolations,
      guestId,
    ),
    stats: {
      ...proposal.stats,
      assignedCount: placements.length,
      unassignedCount: unassignedGuestIds.length,
    },
  };
}

function pruneViolationsAfterUnassign(
  violations: HardRuleViolation[],
  guestId: string,
): HardRuleViolation[] {
  return violations
    .map((violation) => ({
      ...violation,
      guestIds: violation.guestIds.filter((id) => id !== guestId),
    }))
    .filter((violation) => violation.guestIds.length > 0);
}
