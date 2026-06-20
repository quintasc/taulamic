import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { TABLE_SHAPES } from '../domain/table-shape';

export class UpsertDraftTableDto {
  @ApiProperty({ example: 'Mesa 3' })
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
