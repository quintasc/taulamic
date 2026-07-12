import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventGovernanceAuditModule } from '../event-governance-audit/event-governance-audit.module';
import { EventsModule } from '../events/events.module';
import { GuestImportModule } from '../guest-import/guest-import.module';
import { CpSatDistributionEngine } from './domain/cp-sat-distribution.engine';
import { DISTRIBUTION_ENGINE } from './domain/distribution-engine.port';
import { MotorV0Engine } from './domain/motor-v0.strategy';
import {
  ConfirmDistributionUseCase,
  GetDistributionUseCase,
  RunDistributionUseCase,
} from './application/manage-distribution.use-case';
import { GetDistributionCalculationStatusUseCase } from './application/get-distribution-calculation-status.use-case';
import { DistributionCalculationTrackerService } from './application/distribution-calculation-tracker.service';
import { RunDistributionAsyncService } from './application/run-distribution-async.service';
import { AssignGuestToDistributionUseCase } from './application/assign-guest-to-distribution.use-case';
import { MoveGuestInDistributionUseCase } from './application/move-guest-in-distribution.use-case';
import { UnassignGuestFromDistributionUseCase } from './application/unassign-guest-from-distribution.use-case';
import { UpdateGuestSeatInDistributionUseCase } from './application/update-guest-seat-in-distribution.use-case';
import { ReconcileDistributionAfterTableRemovalUseCase } from './application/reconcile-distribution-after-table-removal.use-case';
import { DistributionController } from './distribution.controller';
import { DistributionPersistenceModule } from './distribution-persistence.module';

@Module({
  imports: [EventsModule, GuestImportModule, DistributionPersistenceModule, EventGovernanceAuditModule],
  controllers: [DistributionController],
  providers: [
    {
      provide: DISTRIBUTION_ENGINE,
      useFactory: (config: ConfigService) => {
        const engine = config.get<string>('distribution.engine') ?? 'v1';
        const useCpSat = engine === 'v1' || engine === 'cpsat';
        return useCpSat ? new CpSatDistributionEngine() : new MotorV0Engine();
      },
      inject: [ConfigService],
    },
    RunDistributionUseCase,
    GetDistributionCalculationStatusUseCase,
    DistributionCalculationTrackerService,
    RunDistributionAsyncService,
    GetDistributionUseCase,
    ConfirmDistributionUseCase,
    UnassignGuestFromDistributionUseCase,
    AssignGuestToDistributionUseCase,
    MoveGuestInDistributionUseCase,
    UpdateGuestSeatInDistributionUseCase,
    ReconcileDistributionAfterTableRemovalUseCase,
  ],
  exports: [ReconcileDistributionAfterTableRemovalUseCase],
})
export class DistributionModule {}