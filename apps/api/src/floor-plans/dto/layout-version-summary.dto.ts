import { ApiProperty } from '@nestjs/swagger';
import { LAYOUT_CONFIGURATION_ORIGINS } from '../domain/table-origin';
import type { LayoutConfigurationOrigin } from '../domain/table-origin';

export class LayoutVersionSummaryDto {
  @ApiProperty({ example: 1 })
  version!: number;

  @ApiProperty({ example: '2026-06-18T10:20:00.000Z' })
  confirmedAt!: string;

  @ApiProperty({ enum: LAYOUT_CONFIGURATION_ORIGINS, example: 'imported_edited' })
  configurationOrigin!: LayoutConfigurationOrigin;

  @ApiProperty({ example: 2 })
  tableCount!: number;
}

export class LayoutVersionListResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  floorPlanId!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: 1 })
  latestVersion!: number;

  @ApiProperty({ type: [LayoutVersionSummaryDto] })
  versions!: LayoutVersionSummaryDto[];
}
