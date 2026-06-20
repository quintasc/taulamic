import { ApiProperty } from '@nestjs/swagger';
import { GUEST_IMPORT_ERROR_CODES } from '../domain/guest-import-error-code';

export class GuestImportRowErrorDto {
  @ApiProperty({ example: 3 })
  row!: number;

  @ApiProperty({ example: 'correo' })
  field!: string;

  @ApiProperty({ enum: GUEST_IMPORT_ERROR_CODES, example: 'XLS-002' })
  code!: string;

  @ApiProperty({ example: 'Formato de correo invalido.' })
  message!: string;
}

export class GuestImportValidationResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: false })
  valid!: boolean;

  @ApiProperty({ example: 2 })
  totalRows!: number;

  @ApiProperty({ example: 1 })
  validRows!: number;

  @ApiProperty({ example: 1 })
  invalidRows!: number;

  @ApiProperty({ type: [GuestImportRowErrorDto] })
  errors!: GuestImportRowErrorDto[];
}
