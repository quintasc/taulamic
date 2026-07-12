import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DISTRIBUTION_STATUSES,
  MOTOR_VERSION_V1_CPSAT,
  type DistributionStatus,
  type HardRuleViolation,
  type MotorVersion,
} from '../domain/distribution.types';
import { SOFT_RULE_KINDS } from '../domain/distribution-engine.port';
import {
  DISTRIBUTION_CALCULATION_PHASES,
  DISTRIBUTION_CALCULATION_STATES,
  type DistributionCalculationPhase,
  type DistributionCalculationState,
} from '../application/distribution-calculation-status';

export class GuestPlacementDto {
  @ApiProperty({ example: 'guest-1' })
  guestId!: string;

  @ApiProperty({ example: 'Ana Garcia' })
  guestName!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tableId!: string;

  @ApiProperty({ example: 'Mesa 1' })
  tableLabel!: string;

  @ApiPropertyOptional({
    description: 'Asiento intra-mesa (Fase 2, ADR-023); ausente en motor v0.',
    example: 2,
  })
  seatIndex?: number;

  @ApiPropertyOptional({
    description: 'Etiqueta del asiento (Fase 2, ADR-023); ausente en motor v0.',
    example: 'S3',
  })
  seatLabel?: string;
}

export class ManualPlacementWarningDto {
  @ApiProperty({ example: 'COMPANION_SEPARATED' })
  code!: 'COMPANION_SEPARATED';

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: [String] })
  guestIds!: string[];
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

export class CompatibilityCriterionScoreDto {
  @ApiProperty({ example: 'groupByCategory' })
  key!: string;

  @ApiProperty({ example: 'Agrupar por categoría' })
  label!: string;

  @ApiProperty({ example: 8 })
  earnedPoints!: number;

  @ApiProperty({ example: 10 })
  maxPoints!: number;

  @ApiProperty({ example: 80, description: 'Porcentaje 0-100 con un decimal.' })
  percent!: number;

  @ApiPropertyOptional({
    example: '62 de 80 invitados con alguien de su categoría en la mesa',
    description: 'Aclaracion legible del criterio para la UI.',
  })
  detail?: string;
}

export class DistributionCompatibilityScoreDto {
  @ApiProperty({
    example: 78.5,
    description: 'Compatibilidad global de la propuesta (0-100).',
  })
  globalPercent!: number;

  @ApiProperty({ example: 42 })
  earnedPoints!: number;

  @ApiProperty({ example: 53 })
  maxPoints!: number;

  @ApiProperty({ type: [CompatibilityCriterionScoreDto] })
  criteria!: CompatibilityCriterionScoreDto[];
}

export class TableAffinityScoreDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tableId!: string;

  @ApiProperty({ example: 4 })
  earnedPoints!: number;

  @ApiProperty({ example: 4 })
  maxPoints!: number;

  @ApiProperty({ example: 100 })
  percent!: number;

  @ApiProperty({
    example: '4 de 4 invitados con vínculos cumplidos en la mesa',
  })
  detail!: string;
}

export class DistributionProposalDto {
  @ApiProperty({ example: 'dist_550e8400' })
  id!: string;

  @ApiProperty({ example: 'evt_550e8400' })
  eventId!: string;

  @ApiProperty({ example: MOTOR_VERSION_V1_CPSAT })
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

  @ApiProperty({ type: [ManualPlacementWarningDto], required: false })
  manualWarnings?: ManualPlacementWarningDto[];

  @ApiPropertyOptional({
    enum: SOFT_RULE_KINDS,
    isArray: true,
    description: 'Reglas blandas usadas al calcular la propuesta.',
  })
  appliedSoftRules?: string[];

  @ApiPropertyOptional({ type: DistributionCompatibilityScoreDto })
  compatibilityScore?: DistributionCompatibilityScoreDto;

  @ApiPropertyOptional({
    type: [TableAffinityScoreDto],
    description: 'Afinidad por mesa (parejas y afinidades declaradas).',
  })
  tableAffinityScores?: TableAffinityScoreDto[];
}

export class DistributionCalculationStatusDto {
  @ApiProperty({ example: 'evt_550e8400' })
  eventId!: string;

  @ApiPropertyOptional({ example: 'dist_550e8400', nullable: true })
  proposalId!: string | null;

  @ApiProperty({ enum: DISTRIBUTION_CALCULATION_STATES, example: 'calculating' })
  state!: DistributionCalculationState;

  @ApiProperty({ enum: DISTRIBUTION_CALCULATION_PHASES, example: 'computing' })
  phase!: DistributionCalculationPhase;

  @ApiProperty({ example: 42 })
  progressPercent!: number;

  @ApiPropertyOptional({
    example: '2026-07-10T10:20:00.000Z',
    nullable: true,
  })
  startedAt!: string | null;

  @ApiPropertyOptional({
    example: '2026-07-10T10:20:12.000Z',
    nullable: true,
  })
  updatedAt!: string | null;

  @ApiPropertyOptional({
    example: 12000,
    nullable: true,
    description: 'Milisegundos transcurridos desde el inicio del cálculo.',
  })
  elapsedMs!: number | null;

  @ApiPropertyOptional({
    example: 18000,
    nullable: true,
    description: 'Estimación de milisegundos restantes; null si no aplica.',
  })
  estimatedRemainingMs!: number | null;

  @ApiPropertyOptional({
    example: 'Resolviendo distribución con CP-SAT.',
  })
  message?: string;
}
