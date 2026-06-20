import { Inject, Injectable } from '@nestjs/common';
import type { EventPreferenceControlSettings } from '../domain/preference-control-mode';
import {
  EVENT_PREFERENCE_SETTINGS_REPOSITORY,
  type EventPreferenceSettingsRepositoryPort,
} from '../infrastructure/persistence/event-preference-settings.repository.port';

@Injectable()
export class GetEventPreferenceModeUseCase {
  constructor(
    @Inject(EVENT_PREFERENCE_SETTINGS_REPOSITORY)
    private readonly repository: EventPreferenceSettingsRepositoryPort,
  ) {}

  execute(eventId: string): Promise<EventPreferenceControlSettings> {
    return this.repository.getSettings(eventId);
  }
}

@Injectable()
export class ListEventPreferenceModeRevisionsUseCase {
  constructor(
    @Inject(EVENT_PREFERENCE_SETTINGS_REPOSITORY)
    private readonly repository: EventPreferenceSettingsRepositoryPort,
  ) {}

  execute(eventId: string) {
    return this.repository.listRevisions(eventId);
  }
}
