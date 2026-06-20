import { ApiProperty } from '@nestjs/swagger';
import { ACTOR_ROLES } from '../../common/domain/actor-role';
import {
  GOVERNANCE_AUDIT_EVENT_TYPES,
  type CompanionSeparationAuditSnapshot,
  type GovernanceAuditEntry,
  type PreferenceModeAuditSnapshot,
} from '../domain/governance-audit-entry';

export class PreferenceModeAuditSnapshotDto {
  @ApiProperty({ enum: ['colaborativo', 'anfitrion_exclusivo'], nullable: true })
  mode!: PreferenceModeAuditSnapshot['mode'];

  @ApiProperty()
  version!: number;
}

export class CompanionSeparationAuditSnapshotDto {
  @ApiProperty()
  groupKey!: string;

  @ApiProperty()
  keepTogether!: boolean;

  @ApiProperty({ nullable: true })
  reason!: string | null;

  @ApiProperty({ enum: ['excel', 'admin'], nullable: true })
  origin!: CompanionSeparationAuditSnapshot['origin'];
}

export class GovernanceAuditEntryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ enum: GOVERNANCE_AUDIT_EVENT_TYPES })
  type!: GovernanceAuditEntry['type'];

  @ApiProperty({ enum: ACTOR_ROLES })
  actorRole!: GovernanceAuditEntry['actorRole'];

  @ApiProperty()
  changedAt!: string;

  @ApiProperty({
    nullable: true,
    description: 'Estado anterior. Null en primer cambio de modo.',
  })
  before!:
    | PreferenceModeAuditSnapshotDto
    | CompanionSeparationAuditSnapshotDto
    | null;

  @ApiProperty()
  after!:
    | PreferenceModeAuditSnapshotDto
    | CompanionSeparationAuditSnapshotDto;
}

export class GovernanceAuditListResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ type: [GovernanceAuditEntryDto] })
  entries!: GovernanceAuditEntryDto[];
}

export function toGovernanceAuditEntryDto(
  entry: GovernanceAuditEntry,
): GovernanceAuditEntryDto {
  return {
    id: entry.id,
    eventId: entry.eventId,
    type: entry.type,
    actorRole: entry.actorRole,
    changedAt: entry.changedAt,
    before: entry.before,
    after: entry.after,
  };
}
