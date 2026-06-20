import type { ActorRole } from '../../../common/domain/actor-role';
import type {
  EventPreferenceControlSettings,
  PreferenceControlMode,
  PreferenceControlModeRevision,
} from '../../domain/preference-control-mode';

export type EventPreferenceSettingsRepositoryPort = {
  getSettings(eventId: string): Promise<EventPreferenceControlSettings>;
  updateMode(
    eventId: string,
    mode: PreferenceControlMode,
    actorRole: ActorRole,
  ): Promise<EventPreferenceControlSettings>;
  listRevisions(eventId: string): Promise<PreferenceControlModeRevision[]>;
};

export const EVENT_PREFERENCE_SETTINGS_REPOSITORY = Symbol(
  'EVENT_PREFERENCE_SETTINGS_REPOSITORY',
);
