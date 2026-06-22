import { Inject, Injectable } from '@nestjs/common';
import { reconcileProposalAfterTableRemoved } from '../domain/reconcile-proposal-after-table-removed';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';

type RemainingTableRef = {
  id: string;
  capacity: number;
};

@Injectable()
export class ReconcileDistributionAfterTableRemovalUseCase {
  constructor(
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    removedTableId: string,
    remainingTables: RemainingTableRef[],
  ): Promise<void> {
    const proposal =
      await this.distributionRepository.findLatestByEventId(eventId);

    if (!proposal) {
      return;
    }

    const reconciled = reconcileProposalAfterTableRemoved(
      proposal,
      removedTableId,
      remainingTables,
    );

    if (reconciled) {
      await this.distributionRepository.save(reconciled);
    }
  }
}
