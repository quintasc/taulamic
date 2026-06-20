import { ApiProperty } from '@nestjs/swagger';
import { LAYOUT_CONFIGURATION_ORIGINS } from '../domain/table-origin';
import type { LayoutConfigurationOrigin } from '../domain/table-origin';
import { PersistedLayoutTableDto } from './persisted-layout-table.dto';

export class ConfirmedLayoutResponseDto {
  @ApiProperty({ example: 1 })
  version!: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  floorPlanId!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: 'confirmed' })
  status!: 'confirmed';

  @ApiProperty({ enum: LAYOUT_CONFIGURATION_ORIGINS, example: 'imported_edited' })
  configurationOrigin!: LayoutConfigurationOrigin;

  @ApiProperty({ type: [PersistedLayoutTableDto] })
  tables!: PersistedLayoutTableDto[];

  @ApiProperty({ example: '2026-06-18T10:20:00.000Z' })
  confirmedAt!: string;
}
