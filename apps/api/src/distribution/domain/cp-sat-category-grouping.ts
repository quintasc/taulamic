import type { EventTable } from '../../events/domain/event-config';

import {
  computeBalancedCountBounds,
  type CategoryGroupingPlan,
} from './category-grouping';

type CpSatModule = typeof import('or-tools-wasm/cp-sat');

type CpModelInstance = InstanceType<CpSatModule['CpModel']>;

type BoolVar = ReturnType<CpModelInstance['newBoolVar']>;

type IntVar = ReturnType<CpModelInstance['newIntVar']>;

type ObjectiveVar = BoolVar | IntVar;

const CATEGORY_L1_WEIGHT = 1;

const CATEGORY_L2_WEIGHT = 0.2;

const CATEGORY_L3_SOFT_WEIGHT = 5;
const CATEGORY_MIN_LOCAL_GROUP_SIZE = 3;

/** Penalización blanda por par de categorías mezcladas en una mesa. */
const CATEGORY_PURITY_PAIR_SOFT_WEIGHT = 120;

/**
 * Penalización intrínseca por mesas con 3+ categorías (evita Tetris grave).
 * tripleExcess[t] ≥ (#categorías en t) − 2
 */
const CATEGORY_PURITY_TRIPLE_EXCESS_WEIGHT = 500;

export type CategoryAffinityMatrix = Readonly<
  Record<string, Readonly<Record<string, number>>>
>;

export type AddCategoryGroupingOptions = {
  /** ADR-024 L1 duro: usar exactamente k_min mesas por categoría. */
  hardL1?: boolean;
  /** ADR-024 L2 duro: reparto equilibrado en esas k mesas (requiere hardL1 en el plan). */
  hardL2?: boolean;
  /** ADR-024 L3 duro: count(C,t) ∈ {0} ∪ [3, capacity_elástica]. */
  hardL3?: boolean;
  /** Una sola categoría agrupable por mesa (mesas homogéneas). */
  hardPurity?: boolean;
  /** Pureza dura solo para estas categorías (p. ej. refinamiento selectivo). */
  hardPurityCategoryIds?: ReadonlySet<string>;
  /** Si se define, L1/L2 duros solo aplican a estas categorías (relajación por categoría). */
  hardL1CategoryIds?: ReadonlySet<string>;
  /** Refuerzo blando de L1 para categorías concretas (p. ej. empaquetado ajustado). */
  boostL1CategoryIds?: ReadonlySet<string>;
  boostL1Factor?: number;
  /** Solo modela esta categoría (fase lexicográfica: minimizar mesas usadas). */
  minimizeTablesForCategoryId?: string;
  /** Sustituye k_min al fijar L1 duro (p. ej. tras minimización lexicográfica). */
  fixedKMinByCategory?: ReadonlyMap<string, number>;
  /** Peso de asignar invitados (domina reglas blandas); escala penalización de pureza. */
  assignmentWeight?: number;
  /** Límite de elasticidad sobre capacidad base por mesa (C + elasticExtraSeats). */
  tableElasticExtraSeats?: number;
  /** Afinidad social entre pares de categorías para guiar mesas híbridas. */
  categoryAffinityMatrix?: CategoryAffinityMatrix;
  /** Escala del término de afinidad entre categorías. */
  categoryAffinityWeightScale?: number;
};

export type CategoryGroupingModelArtifacts = {
  objectiveVars: ObjectiveVar[];
  objectiveWeights: number[];
  /** isCategoryInTable[c][t]: la categoría c tiene ≥1 invitado en la mesa t. */
  isCategoryInTableByCategory: Map<string, BoolVar[]>;
  /** @deprecated usar isCategoryInTableByCategory */
  usedVarsByCategory: Map<string, BoolVar[]>;
};

/**
 * Big-M: vincula el conteo de invitados de una categoría en una mesa con su
 * indicador booleano isCategoryInTable.
 *
 *   count ≤ capacity × is   (si is=0 ⇒ count=0)
 *   count ≥ is              (si count≥1 ⇒ is=1)
 */
export function linkCategoryCountToTableIndicator(
  model: CpModelInstance,
  weightedSum: CpSatModule['weightedSum'],
  countVar: IntVar,
  isCategoryInTable: BoolVar,
  tableCapacity: number,
): void {
  model.addLinearConstraint(
    weightedSum([countVar, isCategoryInTable], [1, -tableCapacity]),
    -tableCapacity,
    0,
  );
  model.addLinearConstraint(
    weightedSum([countVar, isCategoryInTable], [1, -1]),
    0,
    tableCapacity,
  );
}

export function addCategoryGroupingObjective(
  model: CpModelInstance,
  weightedSum: CpSatModule['weightedSum'],
  plans: CategoryGroupingPlan[],
  tables: EventTable[],
  assignVars: BoolVar[][],
  lexWeight: number,
  options: AddCategoryGroupingOptions = {},
): CategoryGroupingModelArtifacts {
  const objectiveVars: ObjectiveVar[] = [];
  const objectiveWeights: number[] = [];
  const isCategoryInTableByCategory = new Map<string, BoolVar[]>();
  const hardL1 = options.hardL1 === true;
  const hardL2 = options.hardL2 === true;
  const hardL3 = options.hardL3 === true;
  const hardPurity = options.hardPurity === true;
  const hardPurityCategoryIds = options.hardPurityCategoryIds;
  const hardL1CategoryIds = options.hardL1CategoryIds;
  const boostL1CategoryIds = options.boostL1CategoryIds;
  const boostL1Factor = options.boostL1Factor ?? 1;
  const fixedKMinByCategory = options.fixedKMinByCategory;
  const assignmentWeight = options.assignmentWeight ?? 1;
  const tableElasticExtraSeats = Math.max(0, options.tableElasticExtraSeats ?? 0);
  const categoryAffinityMatrix = options.categoryAffinityMatrix;
  const categoryAffinityWeightScale = options.categoryAffinityWeightScale ?? 1;
  const purityPairWeight = Math.max(
    CATEGORY_PURITY_PAIR_SOFT_WEIGHT,
    assignmentWeight * 4,
  );
  const purityTripleWeight = Math.max(
    CATEGORY_PURITY_TRIPLE_EXCESS_WEIGHT,
    assignmentWeight * 10,
  );
  const selectiveCategoryMode = hardL1CategoryIds !== undefined;
  const objectivePlanIds =
    options.minimizeTablesForCategoryId === undefined
      ? new Set(plans.map((plan) => plan.categoryId))
      : new Set([options.minimizeTablesForCategoryId]);

  for (const plan of plans) {
    const inObjectiveScope = objectivePlanIds.has(plan.categoryId);
    const planHardL1 =
      inObjectiveScope &&
      hardL1 &&
      (!selectiveCategoryMode || hardL1CategoryIds.has(plan.categoryId));
    const planHardL2 = hardL2 && planHardL1;
    const planHardL3 =
      inObjectiveScope &&
      hardL3 &&
      (!selectiveCategoryMode || hardL1CategoryIds.has(plan.categoryId));
    const countVars: IntVar[] = [];
    const isCategoryInTable: BoolVar[] = [];
    const minLocalGroupSize = Math.min(
      CATEGORY_MIN_LOCAL_GROUP_SIZE,
      Math.max(2, plan.guestCount),
    );
    const targetKMin = fixedKMinByCategory?.get(plan.categoryId) ?? plan.kMin;
    const balancedBounds = computeBalancedCountBounds(
      plan.guestCount,
      targetKMin,
    );

    tables.forEach((table, tableIndex) => {
      const effectiveTableCapacity = table.capacity + tableElasticExtraSeats;
      const countVar = model.newIntVar(
        0,
        effectiveTableCapacity,
        `cat_count_${plan.categoryId}_t${tableIndex}`,
      );
      countVars.push(countVar);

      const tableUnitVars = assignVars.map((unitVars) => unitVars[tableIndex]);
      model.addEquality(
        countVar,
        weightedSum(tableUnitVars, plan.unitContributions),
      );

      const isCatInTable = model.newBoolVar(
        `isCatInTable_${plan.categoryId}_t${tableIndex}`,
      );
      isCategoryInTable.push(isCatInTable);
      linkCategoryCountToTableIndicator(
        model,
        weightedSum,
        countVar,
        isCatInTable,
        effectiveTableCapacity,
      );

      if (planHardL2) {
        model.addLinearConstraint(
          countVar,
          balancedBounds.min,
          balancedBounds.max,
        ).onlyEnforceIf(isCatInTable);
      }

      if (!planHardL1 && inObjectiveScope) {
        const boost =
          boostL1CategoryIds?.has(plan.categoryId) === true
            ? boostL1Factor
            : 1;
        objectiveVars.push(isCatInTable);
        objectiveWeights.push(
          -lexWeight *
            CATEGORY_L1_WEIGHT *
            plan.guestCount *
            tables.length *
            boost,
        );
      }

      const minGroupedAtTable = Math.min(
        minLocalGroupSize,
        effectiveTableCapacity,
      );
      if (planHardL3) {
        // Anti-aislamiento (quórum): si la categoría pisa mesa, exige mínimo local.
        model.addLinearConstraint(
          countVar,
          minGroupedAtTable,
          effectiveTableCapacity,
        ).onlyEnforceIf(isCatInTable);
      } else {
        const emptyVar = model.newBoolVar(
          `cat_empty_${plan.categoryId}_t${tableIndex}`,
        );
        const groupedVar = model.newBoolVar(
          `cat_grouped_${plan.categoryId}_t${tableIndex}`,
        );
        const smallGroupVars: BoolVar[] = [];

        for (let size = 1; size < minGroupedAtTable; size += 1) {
          const smallGroupVar = model.newBoolVar(
            `cat_small_${plan.categoryId}_s${size}_t${tableIndex}`,
          );
          smallGroupVars.push(smallGroupVar);
          model.addEquality(countVar, size).onlyEnforceIf(smallGroupVar);

          objectiveVars.push(smallGroupVar);
          objectiveWeights.push(
            -lexWeight * CATEGORY_L3_SOFT_WEIGHT * (minGroupedAtTable - size + 1),
          );
        }

        model.addExactlyOne([emptyVar, ...smallGroupVars, groupedVar]);
        model.addEquality(countVar, 0).onlyEnforceIf(emptyVar);
        model.addLinearConstraint(
          countVar,
          minGroupedAtTable,
          effectiveTableCapacity,
        ).onlyEnforceIf(groupedVar);
      }
    });

    if (planHardL1 && inObjectiveScope) {
      model.addLinearConstraint(
        weightedSum(
          isCategoryInTable,
          isCategoryInTable.map(() => 1),
        ),
        targetKMin,
        targetKMin,
      );
    }

    isCategoryInTableByCategory.set(plan.categoryId, isCategoryInTable);

    if (planHardL1 && !planHardL2 && inObjectiveScope) {
      for (let left = 0; left < tables.length; left += 1) {
        for (let right = left + 1; right < tables.length; right += 1) {
          const spreadVar = model.newIntVar(
            0,
            plan.guestCount,
            `cat_spread_${plan.categoryId}_${left}_${right}`,
          );
          model.addLinearConstraint(
            weightedSum(
              [spreadVar, countVars[left], countVars[right]],
              [1, -1, 1],
            ),
            0,
            plan.guestCount,
          );
          model.addLinearConstraint(
            weightedSum(
              [spreadVar, countVars[right], countVars[left]],
              [1, -1, 1],
            ),
            0,
            plan.guestCount,
          );

          objectiveVars.push(spreadVar);
          objectiveWeights.push(
            -lexWeight *
              CATEGORY_L2_WEIGHT *
              plan.guestCount *
              tables.length *
              (boostL1CategoryIds?.has(plan.categoryId) === true
                ? boostL1Factor
                : 1),
          );
        }
      }
    }
  }

  const categoryIds = plans.map((plan) => plan.categoryId);

  addIntrinsicTablePurityObjective(
    model,
    weightedSum,
    isCategoryInTableByCategory,
    categoryIds,
    tables.length,
    lexWeight,
    purityTripleWeight,
    objectiveVars,
    objectiveWeights,
  );

  addTableCategoryPurityConstraints(
    model,
    weightedSum,
    isCategoryInTableByCategory,
    categoryIds,
    tables.length,
    lexWeight,
    purityPairWeight,
    objectiveVars,
    objectiveWeights,
    {
      hardPurity,
      hardPurityCategoryIds,
      categoryAffinityMatrix,
      categoryAffinityWeightScale,
    },
  );

  return {
    objectiveVars,
    objectiveWeights,
    isCategoryInTableByCategory,
    usedVarsByCategory: isCategoryInTableByCategory,
  };
}

/**
 * Objetivo intrínseco Fase 1: penaliza mesas con 3+ categorías (evita Tetris).
 * Las mesas con 2 categorías se penalizan vía mixedVar (par de indicadores).
 * tripleExcess[t] ≥ (#categorías presentes en t) − 2
 */
function addIntrinsicTablePurityObjective(
  model: CpModelInstance,
  weightedSum: CpSatModule['weightedSum'],
  isCategoryInTableByCategory: Map<string, BoolVar[]>,
  categoryIds: string[],
  tableCount: number,
  lexWeight: number,
  purityTripleWeight: number,
  objectiveVars: ObjectiveVar[],
  objectiveWeights: number[],
): void {
  if (categoryIds.length < 3) {
    return;
  }

  for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
    const indicators = categoryIds
      .map((categoryId) => isCategoryInTableByCategory.get(categoryId)?.[tableIndex])
      .filter((indicator): indicator is BoolVar => indicator !== undefined);

    if (indicators.length < 3) {
      continue;
    }

    const presentCount = model.newIntVar(
      0,
      indicators.length,
      `cat_present_t${tableIndex}`,
    );
    model.addEquality(
      presentCount,
      weightedSum(
        indicators,
        indicators.map(() => 1),
      ),
    );

    const tripleExcessVar = model.newIntVar(
      0,
      indicators.length - 2,
      `cat_triple_excess_t${tableIndex}`,
    );
    model.addLinearConstraint(
      weightedSum([tripleExcessVar, presentCount], [1, -1]),
      -2,
      indicators.length,
    );

    objectiveVars.push(tripleExcessVar);
    objectiveWeights.push(
      -lexWeight * purityTripleWeight * indicators.length,
    );
  }
}

function addTableCategoryPurityConstraints(
  model: CpModelInstance,
  weightedSum: CpSatModule['weightedSum'],
  isCategoryInTableByCategory: Map<string, BoolVar[]>,
  categoryIds: string[],
  tableCount: number,
  lexWeight: number,
  purityPairWeight: number,
  objectiveVars: ObjectiveVar[],
  objectiveWeights: number[],
  options: {
    hardPurity: boolean;
    hardPurityCategoryIds?: ReadonlySet<string>;
    categoryAffinityMatrix?: CategoryAffinityMatrix;
    categoryAffinityWeightScale: number;
  },
): void {
  if (categoryIds.length < 2) {
    return;
  }

  const selectivePurity = options.hardPurityCategoryIds;

  for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
    const indicatorsAtTable = categoryIds
      .map((categoryId) => ({
        categoryId,
        indicator: isCategoryInTableByCategory.get(categoryId)?.[tableIndex],
      }))
      .filter(
        (entry): entry is { categoryId: string; indicator: BoolVar } =>
          entry.indicator !== undefined,
      );

    if (options.hardPurity && selectivePurity === undefined) {
      model.addLinearConstraint(
        weightedSum(
          indicatorsAtTable.map((entry) => entry.indicator),
          indicatorsAtTable.map(() => 1),
        ),
        0,
        1,
      );
    }

    for (let left = 0; left < categoryIds.length; left += 1) {
      for (let right = left + 1; right < categoryIds.length; right += 1) {
        const leftId = categoryIds[left];
        const rightId = categoryIds[right];
        const leftIndicator = isCategoryInTableByCategory.get(leftId)?.[tableIndex];
        const rightIndicator = isCategoryInTableByCategory.get(rightId)?.[tableIndex];
        if (leftIndicator === undefined || rightIndicator === undefined) {
          continue;
        }

        const enforceHardPurity =
          options.hardPurity &&
          (selectivePurity === undefined ||
            selectivePurity.has(leftId) ||
            selectivePurity.has(rightId));

        if (enforceHardPurity) {
          model.addAtMostOne([leftIndicator, rightIndicator]);
          continue;
        }

        const mixedVar = model.newBoolVar(
          `cat_mix_${leftId}_${rightId}_t${tableIndex}`,
        );
        model.addImplication(mixedVar, leftIndicator);
        model.addImplication(mixedVar, rightIndicator);
        model.addBoolOr([
          leftIndicator.not(),
          rightIndicator.not(),
          mixedVar,
        ]);

        objectiveVars.push(mixedVar);
        objectiveWeights.push(
          -lexWeight * purityPairWeight * tableCount,
        );
        const affinityWeight = resolveCategoryAffinityWeight(
          options.categoryAffinityMatrix,
          leftId,
          rightId,
          options.categoryAffinityWeightScale,
        );
        const scaledAffinityWeight = Math.round(affinityWeight * lexWeight);
        if (scaledAffinityWeight !== 0) {
          objectiveVars.push(mixedVar);
          objectiveWeights.push(scaledAffinityWeight);
        }
      }
    }
  }
}

function resolveCategoryAffinityWeight(
  matrix: CategoryAffinityMatrix | undefined,
  leftCategoryId: string,
  rightCategoryId: string,
  scale: number,
): number {
  if (!matrix) {
    return 0;
  }
  const forward = matrix[leftCategoryId]?.[rightCategoryId];
  const reverse = matrix[rightCategoryId]?.[leftCategoryId];
  const raw =
    typeof forward === 'number' && Number.isFinite(forward)
      ? forward
      : typeof reverse === 'number' && Number.isFinite(reverse)
        ? reverse
        : 0;
  if (raw === 0) {
    return 0;
  }
  return Math.round(raw * scale);
}
