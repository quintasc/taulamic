import { Inject, Injectable } from '@nestjs/common';
import type {
  EventPreferenceControlSettings,
  PreferenceControlMode,
} from '../domain/preference-control-mode';
import {
  EVENT_PREFERENCE_SETTINGS_REPOSITORY,
  type EventPreferenceSettingsRepositoryPort,
} from '../infrastructure/persistence/event-preference-settings.repository.port';

@Injectable()
export class UpdateEventPreferenceModeUseCase {
  constructor(
    @Inject(EVENT_PREFERENCE_SETTINGS_REPOSITORY)
    private readonly repository: EventPreferenceSettingsRepositoryPort,
  ) {}

  execute(
    eventId: string,
    mode: PreferenceControlMode,
  ): Promise<EventPreferenceControlSettings> {
    return this.repository.updateMode(eventId, mode);
  }
}
