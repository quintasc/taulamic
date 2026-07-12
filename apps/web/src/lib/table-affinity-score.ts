import type { DistributionProposal, EventDetail, TableAffinityScore } from '@/lib/api';

export type CompanionGroupInput = {
  guestIds: string[];
  keepTogether: boolean;
};

export type AffinityRelationInput = {
  guestA: string;
  guestB: string;
  type: 'afinidad' | 'incompatibilidad';
};

/**
 * Los scores por mesa se calculan en la API (misma lógica que compatibilidad global).
 * En cliente solo se usan los valores devueltos por la propuesta.
 */
export function resolveTableAffinityScores(
  proposal: DistributionProposal,
  _event: EventDetail | null,
  _guests: unknown[] = [],
  _companionGroups: CompanionGroupInput[] = [],
  _affinityRelations: AffinityRelationInput[] = [],
): TableAffinityScore[] {
  return proposal.tableAffinityScores ?? [];
}
