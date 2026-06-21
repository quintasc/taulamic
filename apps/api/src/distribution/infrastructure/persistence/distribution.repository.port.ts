import type { DistributionProposal } from '../../domain/distribution.types';

export const DISTRIBUTION_REPOSITORY = Symbol('DISTRIBUTION_REPOSITORY');

export interface DistributionRepositoryPort {
  save(proposal: DistributionProposal): Promise<DistributionProposal>;
  findLatestByEventId(eventId: string): Promise<DistributionProposal | null>;
  findById(
    eventId: string,
    proposalId: string,
  ): Promise<DistributionProposal | null>;
}
