import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MinLength } from 'class-validator';

export class ExplicitAffinityRelationDto {
  @ApiProperty({ example: 'Inés Blanco' })
  @IsString()
  @MinLength(1)
  guestA!: string;

  @ApiProperty({ example: 'Blanca Gómez' })
  @IsString()
  @MinLength(1)
  guestB!: string;

  @ApiProperty({ enum: ['afinidad', 'incompatibilidad'] })
  @IsIn(['afinidad', 'incompatibilidad'])
  type!: 'afinidad' | 'incompatibilidad';
}
