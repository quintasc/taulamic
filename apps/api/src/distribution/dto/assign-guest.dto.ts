import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AssignGuestDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty()
  tableId!: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Indice de asiento (0 = S1).',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  seatIndex?: number;
}
