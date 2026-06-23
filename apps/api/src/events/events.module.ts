import { Module, forwardRef } from '@nestjs/common';
import { DistributionPersistenceModule } from '../distribution/distribution-persistence.module';
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
  GetRoomSetupUseCase,
  UpsertRoomSetupUseCase,
} from './application/room-setup.use-case';
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
import { FileRoomSetupRepository } from './infrastructure/persistence/file-room-setup.repository';
import { EVENT_PREFERENCE_SETTINGS_REPOSITORY } from './infrastructure/persistence/event-preference-settings.repository.port';
import { ROOM_SETUP_REPOSITORY } from './infrastructure/persistence/room-setup.repository.port';

@Module({
  imports: [
    forwardRef(() => EventGovernanceAuditModule),
    DistributionPersistenceModule,
  ],
  controllers: [EventConfigController, EventsController],
  providers: [
    CreateEventUseCase,
    GetEventUseCase,
    UpdateEventUseCase,
    AddEventTableUseCase,
    UpdateEventTableUseCase,
    RemoveEventTableUseCase,
    GetRoomSetupUseCase,
    UpsertRoomSetupUseCase,
    FileEventConfigRepository,
    {
      provide: EVENT_CONFIG_REPOSITORY,
      useExisting: FileEventConfigRepository,
    },
    FileRoomSetupRepository,
    {
      provide: ROOM_SETUP_REPOSITORY,
      useExisting: FileRoomSetupRepository,
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
    EVENT_CONFIG_REPOSITORY,
  ],
})
export class EventsModule {}
