import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import {
  RESTRICTION_KINDS,
  SUGGESTION_STATUSES,
  type RestrictionKind,
} from '../domain/restriction-suggestion';
export class RestrictionSuggestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty()
  guestId!: string;

  @ApiProperty({ example: 'Ana Garcia' })
  guestName!: string;

  @ApiProperty({ enum: RESTRICTION_KINDS })
  kind!: string;

  @ApiProperty({ nullable: true, example: 'Juan Perez' })
  targetHint!: string | null;

  @ApiProperty({ example: 'No sentar con Juan Perez' })
  sourceText!: string;

  @ApiProperty({ enum: SUGGESTION_STATUSES })
  status!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ nullable: true })
  reviewedAt!: string | null;
}

export class RestrictionSuggestionListResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ type: [RestrictionSuggestionDto] })
  suggestions!: RestrictionSuggestionDto[];
}

export class UpdateRestrictionSuggestionDto {
  @ApiPropertyOptional({ enum: RESTRICTION_KINDS })
  @IsOptional()
  @IsEnum(RESTRICTION_KINDS)
  kind?: RestrictionKind;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  targetHint?: string | null;
}