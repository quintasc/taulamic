import { ApiProperty } from '@nestjs/swagger';

export class UpsertRoomSetupDto {
  @ApiProperty({ enum: ['rectangular', 'round', 'oval'], example: 'rectangular' })
  shape!: 'rectangular' | 'round' | 'oval';

  @ApiProperty({ example: 25 })
  widthM!: number;

  @ApiProperty({ example: 15 })
  lengthM!: number;

  @ApiProperty({ example: 12 })
  radiusM!: number;

  @ApiProperty({ type: [String], example: ['mesa-novios'] })
  placedAccessories!: string[];
}

export class RoomSetupResponseDto extends UpsertRoomSetupDto {
  @ApiProperty({ example: '2026-06-21T12:00:00.000Z' })
  updatedAt!: string;
}
