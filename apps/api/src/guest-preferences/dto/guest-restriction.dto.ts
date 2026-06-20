import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import {
  RESTRICTION_KINDS,
  RESTRICTION_ORIGINS,
  type GuestRestriction,
  type RestrictionKind,
} from '../../guest-import/domain/restriction-suggestion';

export class GuestRestrictionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: RESTRICTION_KINDS })
  kind!: RestrictionKind;

  @ApiProperty({ nullable: true })
  targetHint!: string | null;

  @ApiProperty()
  description!: string;

  @ApiProperty({ enum: RESTRICTION_ORIGINS })
  origin!: string;

  @ApiProperty()
  createdAt!: string;
}

export class GuestRestrictionListResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty()
  guestId!: string;

  @ApiProperty({ type: [GuestRestrictionDto] })
  restrictions!: GuestRestrictionDto[];
}

export class AddGuestRestrictionDto {
  @ApiProperty({ enum: RESTRICTION_KINDS })
  @IsEnum(RESTRICTION_KINDS)
  kind!: RestrictionKind;

  @ApiPropertyOptional({ nullable: true, example: 'Juan Perez' })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  targetHint?: string | null;

  @ApiProperty({ example: 'Prefiere sentar con Maria Lopez' })
  @IsString()
  description!: string;
}

export function toGuestRestrictionDto(
  restriction: GuestRestriction,
): GuestRestrictionDto {
  return {
    id: restriction.id,
    kind: restriction.kind,
    targetHint: restriction.targetHint,
    description: restriction.description,
    origin: restriction.origin,
    createdAt: restriction.createdAt,
  };
}
