import { ApiProperty } from '@nestjs/swagger';
import {
  DISTRIBUTION_STATUSES,
  MOTOR_VERSION_V0_PILOT,
  type DistributionStatus,
  type HardRuleViolation,
  type MotorVersion,
} from '../domain/distribution.types';

export class GuestPlacementDto {
  @ApiProperty({ example: 'guest-1' })
  guestId!: string;

  @ApiProperty({ example: 'Ana Garcia' })
  guestName!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tableId!: string;

  @ApiProperty({ example: 'Mesa 1' })
  tableLabel!: string;
}

export class HardRuleViolationDto {
  @ApiProperty({ example: 'NO_VALID_TABLE' })
  code!: string;

  @ApiProperty({
    example: 'No hay mesa valida que respete capacidad e incompatibilidades.',
  })
  message!: string;

  @ApiProperty({ type: [String], example: ['guest-1'] })
  guestIds!: string[];
}

export class DistributionStatsDto {
  @ApiProperty({ example: 8 })
  assignedCount!: number;

  @ApiProperty({ example: 0 })
  unassignedCount!: number;

  @ApiProperty({ example: 3 })
  tableCount!: number;

  @ApiProperty({ example: 24 })
  totalCapacity!: number;
}

export class DistributionProposalDto {
  @ApiProperty({ example: 'dist_550e8400' })
  id!: string;

  @ApiProperty({ example: 'evt_550e8400' })
  eventId!: string;

  @ApiProperty({ example: MOTOR_VERSION_V0_PILOT })
  motorVersion!: MotorVersion;

  @ApiProperty({ enum: DISTRIBUTION_STATUSES, example: 'draft' })
  status!: DistributionStatus;

  @ApiProperty({ type: [GuestPlacementDto] })
  placements!: GuestPlacementDto[];

  @ApiProperty({ type: [String], example: [] })
  unassignedGuestIds!: string[];

  @ApiProperty({ type: [HardRuleViolationDto] })
  hardRuleViolations!: HardRuleViolation[];

  @ApiProperty({ type: DistributionStatsDto })
  stats!: DistributionStatsDto;

  @ApiProperty({ example: '2026-06-21T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: null, nullable: true })
  confirmedAt!: string | null;
}
