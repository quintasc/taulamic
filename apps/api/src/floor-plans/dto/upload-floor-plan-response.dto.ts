import { ApiProperty } from '@nestjs/swagger';

export class UploadFloorPlanResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: 'salon-boda.pdf' })
  originalName!: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string;

  @ApiProperty({ example: 245760 })
  sizeBytes!: number;

  @ApiProperty({ example: 'uploaded' })
  status!: 'uploaded';
}
