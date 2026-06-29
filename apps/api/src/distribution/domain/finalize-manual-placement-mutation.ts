import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal } from './distribution.types';
import {
  attachManualWarnings,
  buildCompanionSeparationWarning,
} from './companion-separation-warning';

export function finalizeManualPlacementMutation(
  proposal: DistributionProposal,
  guests: Guest[],
  affectedGuestId: string,
): DistributionProposal {
  const warning = buildCompanionSeparationWarning(
    guests,
    proposal,
    affectedGuestId,
  );

  return attachManualWarnings(proposal, warning ? [warning] : []);
}
