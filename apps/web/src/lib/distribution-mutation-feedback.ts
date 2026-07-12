import { distributionApi, type DistributionProposal } from '@/lib/api';

export function extractManualPlacementWarning(
  proposal: DistributionProposal,
): string | null {
  const warning = proposal.manualWarnings?.[0];
  return warning?.message ?? null;
}

/**
 * Tras una mutación manual, sincroniza la propuesta con GET (re-calcula scores
 * en servidor) y conserva los avisos de la respuesta de la mutación.
 */
export async function syncProposalAfterMutation(
  eventId: string,
  mutationResult: DistributionProposal,
): Promise<DistributionProposal> {
  try {
    const fresh = await distributionApi.get(eventId);
    return {
      ...fresh,
      manualWarnings: mutationResult.manualWarnings,
    };
  } catch {
    return mutationResult;
  }
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
