import { Module, forwardRef } from '@nestjs/common';
import { EventGovernanceAuditModule } from '../event-governance-audit/event-governance-audit.module';
import {
  GetEventPreferenceModeUseCase,
  ListEventPreferenceModeRevisionsUseCase,
} from './application/get-event-preference-mode.use-case';
import {
  AssertAdminActorUseCase,
  AssertPreferenceEditPermissionUseCase,
  GetPreferencePermissionsUseCase,
} from './application/preference-permissions.use-case';
import { UpdateEventPreferenceModeUseCase } from './application/update-event-preference-mode.use-case';
import { EventsController } from './events.controller';
import { FileEventPreferenceSettingsRepository } from './infrastructure/persistence/file-event-preference-settings.repository';
import { EVENT_PREFERENCE_SETTINGS_REPOSITORY } from './infrastructure/persistence/event-preference-settings.repository.port';

@Module({
  imports: [forwardRef(() => EventGovernanceAuditModule)],
  controllers: [EventsController],
  providers: [
    GetEventPreferenceModeUseCase,
    UpdateEventPreferenceModeUseCase,
    ListEventPreferenceModeRevisionsUseCase,
    GetPreferencePermissionsUseCase,
    AssertPreferenceEditPermissionUseCase,
    AssertAdminActorUseCase,
    FileEventPreferenceSettingsRepository,
    {
      provide: EVENT_PREFERENCE_SETTINGS_REPOSITORY,
      useExisting: FileEventPreferenceSettingsRepository,
    },
  ],
  exports: [
    AssertPreferenceEditPermissionUseCase,
    AssertAdminActorUseCase,
    GetPreferencePermissionsUseCase,
  ],
})
export class EventsModule {}
