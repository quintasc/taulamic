import type { DistributionProposal } from '@/lib/api';

export function extractManualPlacementWarning(
  proposal: DistributionProposal,
): string | null {
  const warning = proposal.manualWarnings?.[0];
  return warning?.message ?? null;
}

export function applyDistributionMutationResult(
  setProposal: (proposal: DistributionProposal) => void,
  setWarning: (message: string | null) => void,
  setError: (message: string | null) => void,
  result: DistributionProposal,
): void {
  setProposal(result);
  setError(null);
  setWarning(extractManualPlacementWarning(result));
}
