import type { Guest } from '../../guest-import/domain/guest';
import type {
  DistributionEngineInput,
  ExplicitAffinityRelation,
  SoftRuleKind,
} from './distribution-engine.port';
import { partitionExplicitAffinityRelations } from './companion-affinity-partition';
import { buildPlacementUnits, type PlacementUnit } from './placement-units';

export type PreparedDistributionMotorInput = {
  guests: Guest[];
  softRules?: SoftRuleKind[];
  /** Solo afinidades UI; parejas Excel excluidas (regla dura D3). */
  explicitAffinityRelations: ExplicitAffinityRelation[];
  strippedCompanionRelationCount: number;
  /**
   * Unidades indivisibles para Fase 1 (pareja = 1 variable bool/mesa).
   * Equivalente a `mesa[A] == mesa[B]` para cada acompanante_key con keepTogether.
   */
  placementUnits: PlacementUnit[];
};

/**
 * Pre-procesamiento del payload antes del motor CP-SAT:
 * 1. Agrupa parejas Excel en unidades de colocación (D3).
 * 2. Retira del array de afinidades explícitas las parejas ya duras.
 */
export function prepareDistributionMotorInput(
  guests: Guest[],
  softRules?: SoftRuleKind[],
  explicitAffinityRelations?: ExplicitAffinityRelation[],
): PreparedDistributionMotorInput {
  const partition = partitionExplicitAffinityRelations(
    guests,
    explicitAffinityRelations,
  );

  return {
    guests,
    softRules,
    explicitAffinityRelations: partition.uiExplicitAffinityRelations,
    strippedCompanionRelationCount:
      partition.strippedCompanionRelations.length,
    placementUnits: buildPlacementUnits(guests),
  };
}

export function applyPreparedMotorInput(
  input: DistributionEngineInput,
  prepared: PreparedDistributionMotorInput,
): DistributionEngineInput {
  return {
    ...input,
    guests: prepared.guests,
    softRules: prepared.softRules,
    explicitAffinityRelations: prepared.explicitAffinityRelations,
  };
}
