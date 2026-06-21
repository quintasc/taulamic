import { Module, forwardRef } from '@nestjs/common';
import { EventGovernanceAuditModule } from '../event-governance-audit/event-governance-audit.module';
import {
  AddEventTableUseCase,
  CreateEventUseCase,
  GetEventUseCase,
  RemoveEventTableUseCase,
  UpdateEventTableUseCase,
  UpdateEventUseCase,
} from './application/manage-event-config.use-case';
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
import { EventConfigController } from './event-config.controller';
import { EventsController } from './events.controller';
import { EVENT_CONFIG_REPOSITORY } from './infrastructure/persistence/event-config.repository.port';
import { FileEventConfigRepository } from './infrastructure/persistence/file-event-config.repository';
import { FileEventPreferenceSettingsRepository } from './infrastructure/persistence/file-event-preference-settings.repository';
import { EVENT_PREFERENCE_SETTINGS_REPOSITORY } from './infrastructure/persistence/event-preference-settings.repository.port';

@Module({
  imports: [forwardRef(() => EventGovernanceAuditModule)],
  controllers: [EventConfigController, EventsController],
  providers: [
    CreateEventUseCase,
    GetEventUseCase,
    UpdateEventUseCase,
    AddEventTableUseCase,
    UpdateEventTableUseCase,
    RemoveEventTableUseCase,
    FileEventConfigRepository,
    {
      provide: EVENT_CONFIG_REPOSITORY,
      useExisting: FileEventConfigRepository,
    },
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
