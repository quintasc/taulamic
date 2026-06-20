import type { ActorRole } from '../../common/domain/actor-role';
import type { PreferenceControlMode } from '../../events/domain/preference-control-mode';
import type { CompanionSeparationOrigin } from '../../guest-import/domain/guest';

export const GOVERNANCE_AUDIT_EVENT_TYPES = [
  'preference_mode_changed',
  'companion_separation_changed',
] as const;

export type GovernanceAuditEventType =
  (typeof GOVERNANCE_AUDIT_EVENT_TYPES)[number];

export type PreferenceModeAuditSnapshot = {
  mode: PreferenceControlMode | null;
  version: number;
};

export type CompanionSeparationAuditSnapshot = {
  groupKey: string;
  keepTogether: boolean;
  reason: string | null;
  origin: CompanionSeparationOrigin | null;
};

export type GovernanceAuditEntry = {
  id: string;
  eventId: string;
  type: GovernanceAuditEventType;
  actorRole: ActorRole;
  changedAt: string;
  before: PreferenceModeAuditSnapshot | CompanionSeparationAuditSnapshot | null;
  after: PreferenceModeAuditSnapshot | CompanionSeparationAuditSnapshot;
};

export type RecordPreferenceModeAuditInput = {
  eventId: string;
  actorRole: ActorRole;
  before: PreferenceModeAuditSnapshot;
  after: PreferenceModeAuditSnapshot;
};

export type RecordCompanionSeparationAuditInput = {
  eventId: string;
  actorRole: ActorRole;
  before: CompanionSeparationAuditSnapshot | null;
  after: CompanionSeparationAuditSnapshot;
};
