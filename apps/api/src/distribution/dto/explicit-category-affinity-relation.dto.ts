import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class ExplicitCategoryAffinityRelationDto {
  @ApiProperty({ example: 'Amigos novia' })
  @IsString()
  @MinLength(1)
  categoryA!: string;

  @ApiProperty({ example: 'Amigos novio' })
  @IsString()
  @MinLength(1)
  categoryB!: string;

  @ApiProperty({ enum: ['afinidad', 'incompatibilidad'] })
  @IsIn(['afinidad', 'incompatibilidad'])
  type!: 'afinidad' | 'incompatibilidad';
}
