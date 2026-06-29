import { ApiProperty } from '@nestjs/swagger';
import { GuestImportRowErrorDto } from './guest-import-validation-response.dto';

export class GuestImportDetailMetaDto {
  @ApiProperty({ example: true })
  dietaryAlert!: boolean;

  @ApiProperty({ example: false })
  mobilityAlert!: boolean;

  @ApiProperty({ example: 'Intolerancia lactosa', required: false })
  notes!: string;
}

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

  @ApiProperty({
    example: {
      'ana@ejemplo.com': {
        dietaryAlert: true,
        mobilityAlert: false,
        notes: 'Intolerancia lactosa',
      },
    },
  })
  detailMetaByCorreo!: Record<string, GuestImportDetailMetaDto>;
}
