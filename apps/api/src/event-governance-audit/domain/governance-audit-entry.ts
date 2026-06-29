import type { ActorRole } from '../../common/domain/actor-role';
import type { PreferenceControlMode } from '../../events/domain/preference-control-mode';
import type { CompanionSeparationOrigin } from '../../guest-import/domain/guest';

export const GOVERNANCE_AUDIT_EVENT_TYPES = [
  'preference_mode_changed',
  'companion_separation_changed',
  'distribution_placement_changed',
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

export type DistributionPlacementAction = 'assign' | 'unassign' | 'move';

export type DistributionPlacementAuditSnapshot = {
  action: DistributionPlacementAction;
  guestId: string;
  fromTableId: string | null;
  fromTableLabel: string | null;
  toTableId: string | null;
  toTableLabel: string | null;
  companionSeparationWarning: boolean;
};

export type GovernanceAuditSnapshot =
  | PreferenceModeAuditSnapshot
  | CompanionSeparationAuditSnapshot
  | DistributionPlacementAuditSnapshot;

export type GovernanceAuditEntry = {
  id: string;
  eventId: string;
  type: GovernanceAuditEventType;
  actorRole: ActorRole;
  changedAt: string;
  before: GovernanceAuditSnapshot | null;
  after: GovernanceAuditSnapshot;
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

export type RecordDistributionPlacementAuditInput = {
  eventId: string;
  actorRole: ActorRole;
  before: DistributionPlacementAuditSnapshot | null;
  after: DistributionPlacementAuditSnapshot;
};
