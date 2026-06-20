import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import type {
  CompanionGroup,
  CompanionGroupEvaluation,
  CompanionPlacementBlocker,
  CompanionSeparationException,
} from '../../guest-import/domain/companion-group.engine';

export class CompanionSeparationExceptionDto {
  @ApiProperty()
  reason!: string;

  @ApiProperty({ enum: ['excel', 'admin'] })
  origin!: string;

  @ApiProperty()
  recordedAt!: string;
}

export class CompanionGroupDto {
  @ApiProperty({ example: 'PAREJA_001' })
  key!: string;

  @ApiProperty({ type: [String] })
  guestIds!: string[];

  @ApiProperty({ type: [String] })
  guestNames!: string[];

  @ApiProperty({
    description: 'Si el grupo debe sentarse junto segun regla vigente.',
  })
  keepTogether!: boolean;

  @ApiProperty({ type: CompanionSeparationExceptionDto, nullable: true })
  exception!: CompanionSeparationExceptionDto | null;
}

export class CompanionGroupListResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ type: [CompanionGroupDto] })
  groups!: CompanionGroupDto[];
}

export class CompanionPlacementBlockerDto {
  @ApiProperty()
  guestId!: string;

  @ApiProperty()
  guestName!: string;

  @ApiProperty()
  otherGuestId!: string;

  @ApiProperty()
  otherGuestName!: string;

  @ApiProperty()
  restrictionKind!: string;
}

export class CompanionGroupEvaluationDto {
  @ApiProperty({ example: 'PAREJA_001' })
  groupKey!: string;

  @ApiProperty()
  keepTogether!: boolean;

  @ApiProperty()
  canKeepTogether!: boolean;

  @ApiProperty({ nullable: true })
  explanation!: string | null;

  @ApiProperty({ type: [CompanionPlacementBlockerDto] })
  blockers!: CompanionPlacementBlockerDto[];
}

export class SeparateCompanionGroupDto {
  @ApiProperty({
    example: 'Separacion solicitada por los novios por conflicto familiar.',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export function toCompanionSeparationExceptionDto(
  exception: CompanionSeparationException,
): CompanionSeparationExceptionDto {
  return {
    reason: exception.reason,
    origin: exception.origin,
    recordedAt: exception.recordedAt,
  };
}

export function toCompanionGroupDto(group: CompanionGroup): CompanionGroupDto {
  return {
    key: group.key,
    guestIds: group.guestIds,
    guestNames: group.guestNames,
    keepTogether: group.keepTogether,
    exception: group.exception
      ? toCompanionSeparationExceptionDto(group.exception)
      : null,
  };
}

export function toCompanionPlacementBlockerDto(
  blocker: CompanionPlacementBlocker,
): CompanionPlacementBlockerDto {
  return {
    guestId: blocker.guestId,
    guestName: blocker.guestName,
    otherGuestId: blocker.otherGuestId,
    otherGuestName: blocker.otherGuestName,
    restrictionKind: blocker.restrictionKind,
  };
}

export function toCompanionGroupEvaluationDto(
  evaluation: CompanionGroupEvaluation,
): CompanionGroupEvaluationDto {
  return {
    groupKey: evaluation.groupKey,
    keepTogether: evaluation.keepTogether,
    canKeepTogether: evaluation.canKeepTogether,
    explanation: evaluation.explanation,
    blockers: evaluation.blockers.map(toCompanionPlacementBlockerDto),
  };
}
