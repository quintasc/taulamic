import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpsertGuestDto {
  @ApiProperty({ example: 'Ana Garcia Lopez' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'ana.garcia@ejemplo.com' })
  @IsString()
  correo!: string;

  @ApiProperty({ example: '+34600111222' })
  @IsString()
  telefono!: string;

  @ApiPropertyOptional({ example: 'Calle Mayor 1, Madrid' })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({ example: ['Familia novia'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryNames?: string[];

  @ApiPropertyOptional({ example: 'Intolerancia lactosa' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: 'PAREJA_001' })
  @IsOptional()
  @IsString()
  acompananteKey?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  separarAcompanante?: boolean | null;

  @ApiPropertyOptional({ enum: ['colaborativo', 'anfitrion_exclusivo'] })
  @IsOptional()
  @IsIn(['colaborativo', 'anfitrion_exclusivo'])
  preferenciaControl?: 'colaborativo' | 'anfitrion_exclusivo' | null;
}

export class GuestCategoryViewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Familia novia' })
  name!: string;
}

export class GuestViewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: 'Ana Garcia Lopez' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'ana.garcia@ejemplo.com', nullable: true })
  correo!: string | null;

  @ApiPropertyOptional({ example: '+34600111222', nullable: true })
  telefono!: string | null;

  @ApiPropertyOptional({ nullable: true })
  direccion!: string | null;

  @ApiProperty({ type: [GuestCategoryViewDto] })
  categories!: GuestCategoryViewDto[];

  @ApiPropertyOptional({ nullable: true })
  observaciones!: string | null;

  @ApiPropertyOptional({ nullable: true })
  acompananteKey!: string | null;

  @ApiPropertyOptional({ nullable: true })
  separarAcompanante!: boolean | null;

  @ApiPropertyOptional({ enum: ['colaborativo', 'anfitrion_exclusivo'], nullable: true })
  preferenciaControl!: 'colaborativo' | 'anfitrion_exclusivo' | null;

  @ApiProperty({ example: 1 })
  restrictionCount!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class GuestListResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ type: [GuestViewDto] })
  guests!: GuestViewDto[];
}

export class GuestCategoryListResponseDto {
  @ApiProperty({ example: 'evt_123' })
  eventId!: string;

  @ApiProperty({ type: [GuestCategoryViewDto] })
  categories!: GuestCategoryViewDto[];
}
