import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { SoftRuleKind } from '../domain/distribution-engine.port';
import type { DistributionProposal } from '../domain/distribution.types';
import { attachCompatibilityScore } from '../domain/evaluate-distribution-score';
import type { DistributionRepositoryPort } from '../infrastructure/persistence/distribution.repository.port';

/**
 * Persiste la propuesta y devuelve la versión puntuada (compatibilidad global
 * y por mesa) para la respuesta HTTP. Los warnings de mutación manual se
 * conservan en la respuesta aunque no se persistan.
 */
export async function persistScoredProposal(
  repository: DistributionRepositoryPort,
  proposal: DistributionProposal,
  guests: Guest[],
  tables: EventTable[],
  softRules?: SoftRuleKind[],
): Promise<DistributionProposal> {
  const rules = softRules ?? proposal.appliedSoftRules ?? [];
  const scored = attachCompatibilityScore(proposal, guests, tables, rules);
  await repository.save(scored);
  return scored;
}
