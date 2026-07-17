import type { EventTable } from '../../events/domain/event-config';

import { CATEGORY_TABLE_ELASTIC_EXTRA_SEATS } from './category-grouping';
import { linkCategoryCountToTableIndicator } from './cp-sat-category-grouping';

type CpSatModule = typeof import('or-tools-wasm/cp-sat');

type CpModelInstance = InstanceType<CpSatModule['CpModel']>;

type BoolVar = ReturnType<CpModelInstance['newBoolVar']>;

type IntVar = ReturnType<CpModelInstance['newIntVar']>;

/**
 * Penaliza plazas vacías en mesas ya usadas (Fase 1).
 * Tolera hasta {@link CATEGORY_TABLE_ELASTIC_EXTRA_SEATS} vacías sin coste
 * (alineado con holgura ±2: p. ej. 6 en mesa de 8 para un 6+6 puro).
 */
export function addTablePackingObjective(
  model: CpModelInstance,
  weightedSum: CpSatModule['weightedSum'],
  assignVars: BoolVar[][],
  unitSizes: number[],
  tables: EventTable[],
  packWeight: number,
  emptyToleranceSeats: number = CATEGORY_TABLE_ELASTIC_EXTRA_SEATS,
  tableElasticExtraSeats = 0,
): { objectiveVars: IntVar[]; objectiveWeights: number[] } {
  if (packWeight <= 0) {
    return { objectiveVars: [], objectiveWeights: [] };
  }

  const objectiveVars: IntVar[] = [];
  const objectiveWeights: number[] = [];
  const elasticExtraSeats = Math.max(0, tableElasticExtraSeats);
  const allowedEmptySeats = Math.max(0, emptyToleranceSeats);

  tables.forEach((table, tableIndex) => {
    const effectiveCapacity = table.capacity + elasticExtraSeats;
    const tableVars = assignVars.map((unitVars) => unitVars[tableIndex]);
    const fillCount = model.newIntVar(
      0,
      effectiveCapacity,
      `pack_fill_t${tableIndex}`,
    );
    model.addEquality(
      fillCount,
      weightedSum(tableVars, unitSizes),
    );

    const isTableUsed = model.newBoolVar(`pack_used_t${tableIndex}`);
    linkCategoryCountToTableIndicator(
      model,
      weightedSum,
      fillCount,
      isTableUsed,
      effectiveCapacity,
    );

    const effectiveFill = model.newIntVar(
      0,
      table.capacity,
      `pack_fill_effective_t${tableIndex}`,
    );
    if (elasticExtraSeats > 0) {
      const overBaseCapacity = model.newBoolVar(`pack_over_base_t${tableIndex}`);
      model.addLinearConstraint(
        fillCount,
        0,
        table.capacity,
      ).onlyEnforceIf(overBaseCapacity.not());
      model.addLinearConstraint(
        fillCount,
        table.capacity + 1,
        effectiveCapacity,
      ).onlyEnforceIf(overBaseCapacity);
      model.addEquality(effectiveFill, fillCount).onlyEnforceIf(
        overBaseCapacity.not(),
      );
      model.addEquality(effectiveFill, table.capacity).onlyEnforceIf(
        overBaseCapacity,
      );
    } else {
      model.addEquality(effectiveFill, fillCount);
    }

    const emptyOnUsed = model.newIntVar(
      0,
      table.capacity,
      `pack_empty_t${tableIndex}`,
    );
    model.addLinearConstraint(
      weightedSum(
        [emptyOnUsed, effectiveFill, isTableUsed],
        [1, 1, -table.capacity],
      ),
      0,
      table.capacity,
    );

    const emptyBeyondTolerance = model.newIntVar(
      0,
      table.capacity,
      `pack_empty_over_t${tableIndex}`,
    );
    model.addLinearConstraint(
      weightedSum([emptyBeyondTolerance, emptyOnUsed], [1, -1]),
      -table.capacity,
      0,
    );
    model.addLinearConstraint(
      weightedSum([emptyBeyondTolerance, emptyOnUsed], [1, -1]),
      -allowedEmptySeats,
      table.capacity,
    );

    objectiveVars.push(emptyBeyondTolerance);
    objectiveWeights.push(-packWeight);
  });

  return { objectiveVars, objectiveWeights };
}
