import type { ActorRole } from '../../common/domain/actor-role';

export const PREFERENCE_CONTROL_MODES = [
  'colaborativo',
  'anfitrion_exclusivo',
] as const;

export type PreferenceControlMode = (typeof PREFERENCE_CONTROL_MODES)[number];

export const DEFAULT_PREFERENCE_CONTROL_MODE: PreferenceControlMode =
  'colaborativo';

export type PreferenceControlModeRevision = {
  version: number;
  mode: PreferenceControlMode;
  previousMode: PreferenceControlMode | null;
  actorRole: ActorRole;
  changedAt: string;
};

export type EventPreferenceControlSettings = {
  eventId: string;
  currentMode: PreferenceControlMode;
  latestVersion: number;
  updatedAt: string;
  revisions: PreferenceControlModeRevision[];
};
