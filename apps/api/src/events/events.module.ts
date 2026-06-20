import { Module } from '@nestjs/common';
import {
  GetEventPreferenceModeUseCase,
  ListEventPreferenceModeRevisionsUseCase,
} from './application/get-event-preference-mode.use-case';
import { UpdateEventPreferenceModeUseCase } from './application/update-event-preference-mode.use-case';
import { EventsController } from './events.controller';
import { FileEventPreferenceSettingsRepository } from './infrastructure/persistence/file-event-preference-settings.repository';
import { EVENT_PREFERENCE_SETTINGS_REPOSITORY } from './infrastructure/persistence/event-preference-settings.repository.port';

@Module({
  controllers: [EventsController],
  providers: [
    GetEventPreferenceModeUseCase,
    UpdateEventPreferenceModeUseCase,
    ListEventPreferenceModeRevisionsUseCase,
    FileEventPreferenceSettingsRepository,
    {
      provide: EVENT_PREFERENCE_SETTINGS_REPOSITORY,
      useExisting: FileEventPreferenceSettingsRepository,
    },
  ],
})
export class EventsModule {}
