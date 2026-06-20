import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { ActorRole } from '../../common/domain/actor-role';
import {
  canActorEditGuestPreferences,
  preferenceEditFeedbackMessage,
} from '../domain/preference-edit.policy';
import type { PreferenceControlMode } from '../domain/preference-control-mode';
import {
  EVENT_PREFERENCE_SETTINGS_REPOSITORY,
  type EventPreferenceSettingsRepositoryPort,
} from '../infrastructure/persistence/event-preference-settings.repository.port';

export type PreferencePermissionsResult = {
  eventId: string;
  mode: PreferenceControlMode;
  actorRole: ActorRole;
  canEditGuestPreferences: boolean;
  feedbackMessage: string | null;
};

@Injectable()
export class GetPreferencePermissionsUseCase {
  constructor(
    @Inject(EVENT_PREFERENCE_SETTINGS_REPOSITORY)
    private readonly settingsRepository: EventPreferenceSettingsRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    actorRole: ActorRole,
  ): Promise<PreferencePermissionsResult> {
    const settings = await this.settingsRepository.getSettings(eventId);
    return {
      eventId,
      mode: settings.currentMode,
      actorRole,
      canEditGuestPreferences: canActorEditGuestPreferences(
        settings.currentMode,
        actorRole,
      ),
      feedbackMessage: preferenceEditFeedbackMessage(
        settings.currentMode,
        actorRole,
      ),
    };
  }
}

@Injectable()
export class AssertPreferenceEditPermissionUseCase {
  constructor(
    @Inject(EVENT_PREFERENCE_SETTINGS_REPOSITORY)
    private readonly settingsRepository: EventPreferenceSettingsRepositoryPort,
  ) {}

  async execute(eventId: string, actorRole: ActorRole): Promise<void> {
    const settings = await this.settingsRepository.getSettings(eventId);

    if (canActorEditGuestPreferences(settings.currentMode, actorRole)) {
      return;
    }

    throw new ForbiddenException({
      code: 'PREF-001',
      message:
        preferenceEditFeedbackMessage(settings.currentMode, actorRole) ??
        'No tienes permiso para editar preferencias en este evento.',
      details: {
        mode: settings.currentMode,
        actorRole,
      },
    });
  }
}

@Injectable()
export class AssertAdminActorUseCase {
  execute(actorRole: ActorRole): void {
    if (actorRole === 'admin') {
      return;
    }

    throw new ForbiddenException({
      code: 'ADMIN_REQUIRED',
      message: 'Esta operacion solo esta permitida para administradores.',
      details: { actorRole },
    });
  }
}
