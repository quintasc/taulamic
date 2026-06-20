import { Inject, Injectable } from '@nestjs/common';
import type { ActorRole } from '../../common/domain/actor-role';
import { RecordPreferenceModeAuditUseCase } from '../../event-governance-audit/application/governance-audit.use-case';
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
    private readonly recordPreferenceModeAuditUseCase: RecordPreferenceModeAuditUseCase,
  ) {}

  async execute(
    eventId: string,
    mode: PreferenceControlMode,
    actorRole: ActorRole,
  ): Promise<EventPreferenceControlSettings> {
    const before = await this.repository.getSettings(eventId);
    const after = await this.repository.updateMode(eventId, mode, actorRole);

    if (after.latestVersion > before.latestVersion) {
      await this.recordPreferenceModeAuditUseCase.execute({
        eventId,
        actorRole,
        before: {
          mode: before.latestVersion > 0 ? before.currentMode : null,
          version: before.latestVersion,
        },
        after: {
          mode: after.currentMode,
          version: after.latestVersion,
        },
      });
    }

    return after;
  }
}
