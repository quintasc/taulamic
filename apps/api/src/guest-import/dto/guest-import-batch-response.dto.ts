import { ApiProperty } from '@nestjs/swagger';
import { GuestImportRowErrorDto } from './guest-import-validation-response.dto';

export class GuestImportBatchResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: 2 })
  totalRows!: number;

  @ApiProperty({ example: 2 })
  created!: number;

  @ApiProperty({ example: 0 })
  updated!: number;

  @ApiProperty({ example: 0 })
  rejected!: number;

  @ApiProperty({ example: 1 })
  categoriesEnsured!: number;

  @ApiProperty({ example: 2 })
  suggestionsGenerated!: number;

  @ApiProperty({ type: [GuestImportRowErrorDto] })
  errors!: GuestImportRowErrorDto[];
}
