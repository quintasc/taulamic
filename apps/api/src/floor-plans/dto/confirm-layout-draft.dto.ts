import { ApiProperty } from '@nestjs/swagger';
import { Equals } from 'class-validator';

export class ConfirmLayoutDraftDto {
  @ApiProperty({
    example: true,
    description: 'Debe ser true para confirmar explicitamente la configuracion.',
  })
  @Equals(true, {
    message: 'Debes confirmar explicitamente la configuracion antes de guardar.',
  })
  confirmed!: true;
}
