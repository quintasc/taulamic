import { ApiProperty } from '@nestjs/swagger';
import { EditableLayoutTableDto } from './editable-layout-table.dto';

export class LayoutDraftResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  floorPlanId!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: 'draft' })
  status!: 'draft';

  @ApiProperty({ type: [EditableLayoutTableDto] })
  tables!: EditableLayoutTableDto[];

  @ApiProperty({ example: '2026-06-18T10:15:30.000Z' })
  updatedAt!: string;
}
