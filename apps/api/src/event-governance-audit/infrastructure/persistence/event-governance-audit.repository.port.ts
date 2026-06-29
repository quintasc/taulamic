import type {
  GovernanceAuditEntry,
  RecordCompanionSeparationAuditInput,
  RecordDistributionPlacementAuditInput,
  RecordPreferenceModeAuditInput,
} from '../../domain/governance-audit-entry';

export type EventGovernanceAuditRepositoryPort = {
  appendPreferenceModeChange(
    input: RecordPreferenceModeAuditInput,
  ): Promise<GovernanceAuditEntry>;
  appendCompanionSeparationChange(
    input: RecordCompanionSeparationAuditInput,
  ): Promise<GovernanceAuditEntry>;
  appendDistributionPlacementChange(
    input: RecordDistributionPlacementAuditInput,
  ): Promise<GovernanceAuditEntry>;
  listEntries(eventId: string): Promise<GovernanceAuditEntry[]>;
};

export const EVENT_GOVERNANCE_AUDIT_REPOSITORY = Symbol(
  'EVENT_GOVERNANCE_AUDIT_REPOSITORY',
);
