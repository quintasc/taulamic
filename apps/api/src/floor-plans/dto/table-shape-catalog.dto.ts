import { ApiProperty } from '@nestjs/swagger';
import { TABLE_SHAPES } from '../domain/table-shape';
import type { TableShape } from '../domain/table-shape';

export class TableShapeCatalogEntryDto {
  @ApiProperty({ enum: TABLE_SHAPES, example: 'redonda' })
  shape!: TableShape;

  @ApiProperty({ example: 'Redonda' })
  label!: string;

  @ApiProperty({
    example:
      'Asientos en circulo. Vecindad: adyacente en el arco, enfrente en el diametro opuesto.',
  })
  description!: string;

  @ApiProperty({ example: 2 })
  minCapacity!: number;

  @ApiProperty({ example: 50 })
  maxCapacity!: number;
}

export class TableShapeCatalogResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ type: [TableShapeCatalogEntryDto] })
  shapes!: TableShapeCatalogEntryDto[];
}
