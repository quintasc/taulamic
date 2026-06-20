import { Module, forwardRef } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import {
  ListEventGovernanceAuditUseCase,
  RecordCompanionSeparationAuditUseCase,
  RecordPreferenceModeAuditUseCase,
} from './application/governance-audit.use-case';
import { EventGovernanceAuditController } from './event-governance-audit.controller';
import { FileEventGovernanceAuditRepository } from './infrastructure/persistence/file-event-governance-audit.repository';
import { EVENT_GOVERNANCE_AUDIT_REPOSITORY } from './infrastructure/persistence/event-governance-audit.repository.port';

@Module({
  imports: [forwardRef(() => EventsModule)],
  controllers: [EventGovernanceAuditController],
  providers: [
    RecordPreferenceModeAuditUseCase,
    RecordCompanionSeparationAuditUseCase,
    ListEventGovernanceAuditUseCase,
    FileEventGovernanceAuditRepository,
    {
      provide: EVENT_GOVERNANCE_AUDIT_REPOSITORY,
      useExisting: FileEventGovernanceAuditRepository,
    },
  ],
  exports: [
    RecordPreferenceModeAuditUseCase,
    RecordCompanionSeparationAuditUseCase,
  ],
})
export class EventGovernanceAuditModule {}
