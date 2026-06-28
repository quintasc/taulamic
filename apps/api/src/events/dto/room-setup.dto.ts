import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  MAX_ROOM_DIMENSION_M,
  MIN_ROOM_DIMENSION_M,
} from '../domain/room-setup';

const ROOM_SHAPES = ['rectangular', 'round', 'oval'] as const;

export class UpsertRoomSetupDto {
  @ApiProperty({ enum: ROOM_SHAPES, example: 'rectangular' })
  @IsString()
  @IsIn([...ROOM_SHAPES])
  shape!: 'rectangular' | 'round' | 'oval';

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(MIN_ROOM_DIMENSION_M)
  @Max(MAX_ROOM_DIMENSION_M)
  widthM!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(MIN_ROOM_DIMENSION_M)
  @Max(MAX_ROOM_DIMENSION_M)
  lengthM!: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Min(MIN_ROOM_DIMENSION_M)
  @Max(MAX_ROOM_DIMENSION_M)
  radiusM!: number;

  @ApiProperty({ type: [String], example: ['mesa-presidencial'] })
  @IsArray()
  @IsString({ each: true })
  placedAccessories!: string[];
}

export class RoomSetupResponseDto extends UpsertRoomSetupDto {
  @ApiProperty({ example: '2026-06-21T12:00:00.000Z' })
  updatedAt!: string;
}
