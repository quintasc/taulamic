import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { TABLE_SHAPES } from '../../floor-plans/domain/table-shape';
import { EVENT_CONFIG_STATUSES } from '../domain/event-config';
import type { EventConfigStatus } from '../domain/event-config';
import type { TableShape } from '../../floor-plans/domain/table-shape';

export class CreateEventDto {
  @ApiProperty({ example: 'Boda Ana y Luis' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateEventDto {
  @ApiProperty({ example: 'Boda Ana y Luis' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpsertEventTableDto {
  @ApiProperty({ example: 'Mesa 1' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ enum: TABLE_SHAPES, example: 'redonda' })
  @IsString()
  @IsIn([...TABLE_SHAPES])
  shape!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  estimatedCapacity!: number;
}

export class EventTableDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Mesa 1' })
  label!: string;

  @ApiProperty({ enum: TABLE_SHAPES, example: 'redonda' })
  shape!: TableShape;

  @ApiProperty({ example: 10 })
  capacity!: number;

  @ApiProperty({ example: '2026-06-21T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-21T10:00:00.000Z' })
  updatedAt!: string;
}

export class EventCapacityByShapeDto {
  @ApiProperty({ example: 2 })
  tableCount!: number;

  @ApiProperty({ example: 18 })
  totalCapacity!: number;
}

export class EventCapacitySummaryDto {
  @ApiProperty({ example: 3 })
  tableCount!: number;

  @ApiProperty({ example: 28 })
  totalCapacity!: number;

  @ApiProperty({
    example: {
      redonda: { tableCount: 2, totalCapacity: 18 },
      rectangular: { tableCount: 1, totalCapacity: 10 },
    },
  })
  byShape!: Partial<Record<TableShape, EventCapacityByShapeDto>>;
}

export class EventDetailResponseDto {
  @ApiProperty({ example: 'evt_550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Boda Ana y Luis' })
  name!: string;

  @ApiProperty({ enum: EVENT_CONFIG_STATUSES, example: 'configuring' })
  status!: EventConfigStatus;

  @ApiProperty({ type: [EventTableDto] })
  tables!: EventTableDto[];

  @ApiProperty({ type: EventCapacitySummaryDto })
  capacitySummary!: EventCapacitySummaryDto;

  @ApiProperty({ example: '2026-06-21T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-06-21T10:00:00.000Z' })
  updatedAt!: string;
}
