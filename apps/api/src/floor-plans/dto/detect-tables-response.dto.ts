import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DETECTION_STATUSES } from '../domain/detection-status';
import type { DetectionStatus } from '../domain/detection-status';
import { DetectedTableDto } from './detected-table.dto';

export class DetectTablesResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  floorPlanId!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ enum: DETECTION_STATUSES, example: 'completed' })
  status!: DetectionStatus;

  @ApiProperty({ type: [DetectedTableDto] })
  tables!: DetectedTableDto[];

  @ApiProperty({ example: true })
  manualFallbackAvailable!: true;

  @ApiProperty({ example: '2026-06-18T10:15:30.000Z' })
  detectedAt!: string;

  @ApiPropertyOptional({
    example: 'Deteccion parcial: revisa forma y capacidad antes de confirmar.',
  })
  message?: string;
}
