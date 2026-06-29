import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { GuestImportModule } from '../guest-import/guest-import.module';
import {
  ConfirmDistributionUseCase,
  GetDistributionUseCase,
  RunDistributionUseCase,
} from './application/manage-distribution.use-case';
import { AssignGuestToDistributionUseCase } from './application/assign-guest-to-distribution.use-case';
import { UnassignGuestFromDistributionUseCase } from './application/unassign-guest-from-distribution.use-case';
import { ReconcileDistributionAfterTableRemovalUseCase } from './application/reconcile-distribution-after-table-removal.use-case';
import { DistributionController } from './distribution.controller';
import { DistributionPersistenceModule } from './distribution-persistence.module';

@Module({
  imports: [EventsModule, GuestImportModule, DistributionPersistenceModule],
  controllers: [DistributionController],
  providers: [
    RunDistributionUseCase,
    GetDistributionUseCase,
    ConfirmDistributionUseCase,
    UnassignGuestFromDistributionUseCase,
    AssignGuestToDistributionUseCase,
    ReconcileDistributionAfterTableRemovalUseCase,
  ],
  exports: [ReconcileDistributionAfterTableRemovalUseCase],
})
export class DistributionModule {}