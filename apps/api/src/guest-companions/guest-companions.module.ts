import { Module } from '@nestjs/common';
import { EventGovernanceAuditModule } from '../event-governance-audit/event-governance-audit.module';
import { EventsModule } from '../events/events.module';
import { GuestImportModule } from '../guest-import/guest-import.module';
import {
  EvaluateCompanionGroupUseCase,
  ListCompanionGroupsUseCase,
  RevertCompanionGroupSeparationUseCase,
  SeparateCompanionGroupUseCase,
} from './application/manage-companion-groups.use-case';
import { GuestCompanionsController } from './guest-companions.controller';

@Module({
  imports: [GuestImportModule, EventsModule, EventGovernanceAuditModule],
  controllers: [GuestCompanionsController],
  providers: [
    ListCompanionGroupsUseCase,
    EvaluateCompanionGroupUseCase,
    SeparateCompanionGroupUseCase,
    RevertCompanionGroupSeparationUseCase,
  ],
})
export class GuestCompanionsModule {}
