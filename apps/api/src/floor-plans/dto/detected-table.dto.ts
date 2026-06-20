import { ApiProperty } from '@nestjs/swagger';
import { TABLE_SHAPES } from '../domain/table-shape';
import type { TableShape } from '../domain/table-shape';

export class DetectedTableDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Mesa 1' })
  label!: string;

  @ApiProperty({ enum: TABLE_SHAPES, example: 'redonda' })
  shape!: TableShape;

  @ApiProperty({ example: 10 })
  estimatedCapacity!: number;

  @ApiProperty({
    example: 0.85,
    description: 'Nivel de confianza entre 0 y 1',
  })
  confidence!: number;
}
