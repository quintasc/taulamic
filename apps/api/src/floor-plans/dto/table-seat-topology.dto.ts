import { ApiProperty } from '@nestjs/swagger';
import { PROXIMITY_KINDS } from '../domain/seat-proximity';
import type { ProximityKind } from '../domain/seat-proximity';
import { TABLE_SHAPES } from '../domain/table-shape';
import type { TableShape } from '../domain/table-shape';

export class SeatRefDto {
  @ApiProperty({ example: 0 })
  index!: number;

  @ApiProperty({ example: 'S1' })
  label!: string;
}

export class SeatProximityDto {
  @ApiProperty({ example: 0 })
  from!: number;

  @ApiProperty({ example: 1 })
  to!: number;

  @ApiProperty({ enum: PROXIMITY_KINDS, example: 'adyacente' })
  kind!: ProximityKind;
}

export class TableSeatTopologyDto {
  @ApiProperty({ enum: TABLE_SHAPES, example: 'redonda' })
  shape!: TableShape;

  @ApiProperty({ example: 8 })
  capacity!: number;

  @ApiProperty({ type: [SeatRefDto] })
  seats!: SeatRefDto[];

  @ApiProperty({ type: [SeatProximityDto] })
  proximities!: SeatProximityDto[];
}
