import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  SOFT_RULE_KINDS,
  type SoftRuleKind,
} from '../domain/distribution-engine.port';
import { ExplicitAffinityRelationDto } from './explicit-affinity-relation.dto';
import { ExplicitCategoryAffinityRelationDto } from './explicit-category-affinity-relation.dto';

export class RunDistributionDto {
  @ApiPropertyOptional({
    description:
      'Reglas blandas activas en orden de prioridad (posicion 1 = mas prioritaria). ' +
      'Corresponde al orden de la pantalla de afinidades (HU-17).',
    isArray: true,
    enum: SOFT_RULE_KINDS,
    example: ['keepFamiliesTogether', 'groupByCategory', 'singlesTable'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(SOFT_RULE_KINDS, { each: true })
  softRules?: SoftRuleKind[];

  @ApiPropertyOptional({
    description:
      'Afinidades/incompatibilidades opcionales dibujadas en la pantalla Afinidades (por nombre). ' +
      'Las parejas del Excel (acompanante_key) se elevan a regla dura D3 en el motor y no deben enviarse aquí.',
    type: [ExplicitAffinityRelationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExplicitAffinityRelationDto)
  explicitAffinityRelations?: ExplicitAffinityRelationDto[];

  @ApiPropertyOptional({
    description:
      'Afinidades/incompatibilidades entre categorías (por nombre de categoría) ' +
      'para guiar mezclas híbridas en Fase 1.',
    type: [ExplicitCategoryAffinityRelationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExplicitCategoryAffinityRelationDto)
  categoryAffinityRelations?: ExplicitCategoryAffinityRelationDto[];
}
