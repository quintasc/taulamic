import type { EventTable } from '../../events/domain/event-config';

import {
  CATEGORY_ISLAND_MAX,
  CATEGORY_L3_MIN,
  CATEGORY_LARGE_MIN_N,
  CATEGORY_SPLIT_MIN,
  computeBalancedCountBounds,
  computeKMin,
  type CategoryGroupingPlan,
} from './category-grouping';

type CpSatModule = typeof import('or-tools-wasm/cp-sat');

type CpModelInstance = InstanceType<CpSatModule['CpModel']>;

type BoolVar = ReturnType<CpModelInstance['newBoolVar']>;

type IntVar = ReturnType<CpModelInstance['newIntVar']>;

type ObjectiveVar = BoolVar | IntVar;

const CATEGORY_L1_WEIGHT = 1;

const CATEGORY_L2_WEIGHT = 0.2;

/** Soft L3: penaliza huérfano local (count=1). */
const CATEGORY_L3_SOFT_WEIGHT = 5;
/** Soft L3bis: isla descolgada 2..3 en mesa donde no predomina (preferible; peso alto vs elasticidad). */
const CATEGORY_L3BIS_SOFT_WEIGHT = 12;
/** Soft: al partir categoría grande, preferir bolsillo ≥ SPLIT_MIN (castiga dúos propios). */
const CATEGORY_SPLIT_SOFT_WEIGHT = 6;

/** Penalización blanda por par de categorías mezcladas en una mesa. */
const CATEGORY_PURITY_PAIR_SOFT_WEIGHT = 120;
/**
 * Multiplicador extra si ambas categorías son grandes (N≥6): mezclar solo
 * cuando L1/elasticidad no permiten mesas propias (criterio PO).
 */
const CATEGORY_PURITY_LARGE_PAIR_FACTOR = 5;

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
  /** ADR-024 L3 duro: count(C,t) ∈ {0} ∪ [2, capacity_elástica]. */
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
  /**
   * ADR-023 §2bis Fase 1b: penaliza islas L3bis / SPLIT_MIN.
   * En Fase 1a debe ser false (modelo más ligero).
   */
  enableIslandSoft?: boolean;
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
  const enableIslandSoft = options.enableIslandSoft === true;
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

  const countVarsByCategory = new Map<string, IntVar[]>();

  for (const plan of plans) {
    const inObjectiveScope = objectivePlanIds.has(plan.categoryId);
    const planHardL1 =
      inObjectiveScope &&
      hardL1 &&
      (!selectiveCategoryMode || hardL1CategoryIds.has(plan.categoryId));
    const planHardL2 = hardL2 && planHardL1;
    // L3 duro aplica a todas las categorías del alcance (no se relaja en refinamiento selectivo).
    const planHardL3 = inObjectiveScope && hardL3;
    const countVars: IntVar[] = [];
    const isCategoryInTable: BoolVar[] = [];
    const l3MinLocal = Math.min(CATEGORY_L3_MIN, Math.max(1, plan.guestCount));
    const maxBaseCapacity = Math.max(
      ...tables.map((table) => table.capacity),
      1,
    );
    // L1: con elasticidad (1b) k_min usa C+E; en 1a (E=0) coincide con plan.kMin rígido.
    const targetKMin =
      fixedKMinByCategory?.get(plan.categoryId) ??
      computeKMin(plan.guestCount, maxBaseCapacity + tableElasticExtraSeats);
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

      const minGroupedAtTable = Math.min(l3MinLocal, effectiveTableCapacity);
      if (planHardL3 && plan.guestCount >= CATEGORY_L3_MIN) {
        // L3 duro ADR-024: si la categoría pisa mesa, count ≥ 2.
        model.addLinearConstraint(
          countVar,
          minGroupedAtTable,
          effectiveTableCapacity,
        ).onlyEnforceIf(isCatInTable);
      } else if (plan.guestCount >= CATEGORY_L3_MIN && inObjectiveScope) {
        // L3 blando: empty | orphan(1) | grouped(≥2).
        const emptyVar = model.newBoolVar(
          `cat_empty_${plan.categoryId}_t${tableIndex}`,
        );
        const orphanVar = model.newBoolVar(
          `cat_orphan_${plan.categoryId}_t${tableIndex}`,
        );
        const groupedVar = model.newBoolVar(
          `cat_grouped_${plan.categoryId}_t${tableIndex}`,
        );
        model.addExactlyOne([emptyVar, orphanVar, groupedVar]);
        model.addEquality(countVar, 0).onlyEnforceIf(emptyVar);
        model.addEquality(countVar, 1).onlyEnforceIf(orphanVar);
        model.addLinearConstraint(
          countVar,
          minGroupedAtTable,
          effectiveTableCapacity,
        ).onlyEnforceIf(groupedVar);
        objectiveVars.push(orphanVar);
        objectiveWeights.push(-lexWeight * CATEGORY_L3_SOFT_WEIGHT);
      }
    });

    countVarsByCategory.set(plan.categoryId, countVars);
    isCategoryInTableByCategory.set(plan.categoryId, isCategoryInTable);

    if (planHardL1 && inObjectiveScope) {
      model.addLinearConstraint(
        weightedSum(
          isCategoryInTable,
          isCategoryInTable.map(() => 1),
        ),
        targetKMin,
        targetKMin,
      );
    } else if (!planHardL1 && inObjectiveScope) {
      const boost =
        boostL1CategoryIds?.has(plan.categoryId) === true
          ? boostL1Factor
          : 1;
      // L1 blando: acercar used a k_min (en 1b, k_min ya incluye C+E).
      const usedCount = model.newIntVar(
        0,
        tables.length,
        `cat_used_${plan.categoryId}`,
      );
      model.addEquality(
        usedCount,
        weightedSum(
          isCategoryInTable,
          isCategoryInTable.map(() => 1),
        ),
      );
      const overK = model.newIntVar(
        0,
        tables.length,
        `cat_over_k_${plan.categoryId}`,
      );
      const underK = model.newIntVar(
        0,
        tables.length,
        `cat_under_k_${plan.categoryId}`,
      );
      // usedCount - targetKMin = overK - underK
      model.addEquality(
        weightedSum([usedCount, overK, underK], [1, -1, 1]),
        targetKMin,
      );
      const l1Scale =
        lexWeight *
        CATEGORY_L1_WEIGHT *
        plan.guestCount *
        tables.length *
        boost;
      objectiveVars.push(overK, underK);
      // En 1a (sin E): underK ×2 evita “inventar” k bajo imposible.
      // En 1b (con E): pesos iguales; bajar a ceil(N/(C+E)) es el objetivo L1.
      const underKFactor = tableElasticExtraSeats > 0 ? 1 : 2;
      objectiveWeights.push(-l1Scale, -l1Scale * underKFactor);
    }

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

  if (enableIslandSoft) {
    addCategoryIslandSoftObjectives(
      model,
      weightedSum,
      plans,
      tables.length,
      countVarsByCategory,
      objectivePlanIds,
      lexWeight,
      Math.max(
        ...tables.map((table) => table.capacity + tableElasticExtraSeats),
        1,
      ),
      objectiveVars,
      objectiveWeights,
    );
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
    plans,
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
 * L3bis blando + preferencia SPLIT_MIN (ADR-024 enmienda 2026-07-17).
 * Preferible evitar islas ≤3 de categoría grande descolgada donde no predomina;
 * al partir, preferir bolsillo ≥3 (castiga dúos propios). Nunca sustituye L3 duro.
 */
function addCategoryIslandSoftObjectives(
  model: CpModelInstance,
  _weightedSum: CpSatModule['weightedSum'],
  plans: CategoryGroupingPlan[],
  tableCount: number,
  countVarsByCategory: Map<string, IntVar[]>,
  objectivePlanIds: ReadonlySet<string>,
  lexWeight: number,
  maxEffectiveCapacity: number,
  objectiveVars: ObjectiveVar[],
  objectiveWeights: number[],
): void {
  const largePlans = plans.filter(
    (plan) =>
      objectivePlanIds.has(plan.categoryId) &&
      plan.guestCount >= CATEGORY_LARGE_MIN_N,
  );
  if (largePlans.length === 0) {
    return;
  }

  for (const plan of largePlans) {
    const countVars = countVarsByCategory.get(plan.categoryId);
    if (countVars === undefined) {
      continue;
    }

    for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
      const countVar = countVars[tableIndex];
      const maxIslandSize = Math.min(
        CATEGORY_ISLAND_MAX,
        plan.guestCount - 1,
        maxEffectiveCapacity,
      );

      for (let size = 1; size <= maxIslandSize; size += 1) {
        const sizeVar = model.newBoolVar(
          `cat_island_size_${plan.categoryId}_s${size}_t${tableIndex}`,
        );
        const belowVar = model.newBoolVar(
          `cat_island_below_${plan.categoryId}_s${size}_t${tableIndex}`,
        );
        const aboveVar = model.newBoolVar(
          `cat_island_above_${plan.categoryId}_s${size}_t${tableIndex}`,
        );
        model.addExactlyOne([belowVar, sizeVar, aboveVar]);
        if (size === 1) {
          model.addEquality(countVar, 0).onlyEnforceIf(belowVar);
        } else {
          model
            .addLinearConstraint(countVar, 0, size - 1)
            .onlyEnforceIf(belowVar);
        }
        model.addEquality(countVar, size).onlyEnforceIf(sizeVar);
        model
          .addLinearConstraint(countVar, size + 1, maxEffectiveCapacity)
          .onlyEnforceIf(aboveVar);

        if (size < CATEGORY_SPLIT_MIN) {
          objectiveVars.push(sizeVar);
          objectiveWeights.push(
            -lexWeight *
              CATEGORY_SPLIT_SOFT_WEIGHT *
              (CATEGORY_SPLIT_MIN - size),
          );
        }

        for (const other of plans) {
          if (other.categoryId === plan.categoryId) {
            continue;
          }
          const otherCounts = countVarsByCategory.get(other.categoryId);
          if (otherCounts === undefined) {
            continue;
          }
          const otherCount = otherCounts[tableIndex];
          const otherBigger = model.newBoolVar(
            `cat_island_dom_${plan.categoryId}_by_${other.categoryId}_s${size}_t${tableIndex}`,
          );
          model
            .addLinearConstraint(
              otherCount,
              size + 1,
              maxEffectiveCapacity,
            )
            .onlyEnforceIf(otherBigger);
          model
            .addLinearConstraint(otherCount, 0, size)
            .onlyEnforceIf(otherBigger.not());

          const islandVar = model.newBoolVar(
            `cat_island_${plan.categoryId}_vs_${other.categoryId}_s${size}_t${tableIndex}`,
          );
          model.addImplication(islandVar, sizeVar);
          model.addImplication(islandVar, otherBigger);
          model.addBoolOr([sizeVar.not(), otherBigger.not(), islandVar]);

          objectiveVars.push(islandVar);
          objectiveWeights.push(-lexWeight * CATEGORY_L3BIS_SOFT_WEIGHT);
        }
      }
    }
  }
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
  plans: CategoryGroupingPlan[],
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
  const categoryIds = plans.map((plan) => plan.categoryId);
  if (categoryIds.length < 2) {
    return;
  }

  const guestCountByCategory = new Map(
    plans.map((plan) => [plan.categoryId, plan.guestCount]),
  );
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

        const leftCount = guestCountByCategory.get(leftId) ?? 0;
        const rightCount = guestCountByCategory.get(rightId) ?? 0;
        const largePair =
          leftCount >= CATEGORY_LARGE_MIN_N &&
          rightCount >= CATEGORY_LARGE_MIN_N;
        const pairFactor = largePair ? CATEGORY_PURITY_LARGE_PAIR_FACTOR : 1;

        objectiveVars.push(mixedVar);
        objectiveWeights.push(
          -lexWeight * purityPairWeight * tableCount * pairFactor,
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
