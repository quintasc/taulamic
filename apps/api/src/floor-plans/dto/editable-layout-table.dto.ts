import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TABLE_ORIGINS } from '../domain/table-origin';
import type { TableOrigin } from '../domain/table-origin';
import { TABLE_SHAPES } from '../domain/table-shape';
import type { TableShape } from '../domain/table-shape';

export class EditableLayoutTableDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Mesa 1' })
  label!: string;

  @ApiProperty({ enum: TABLE_SHAPES, example: 'redonda' })
  shape!: TableShape;

  @ApiProperty({ example: 10 })
  estimatedCapacity!: number;

  @ApiPropertyOptional({ example: 0.85 })
  confidence?: number;

  @ApiProperty({ enum: TABLE_ORIGINS, example: 'detected' })
  origin!: TableOrigin;
}
