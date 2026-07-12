import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateGuestSeatDto {
  @ApiProperty({
    example: 0,
    description: 'Indice de asiento (0 = S1).',
  })
  @IsInt()
  @Min(0)
  seatIndex!: number;
}
