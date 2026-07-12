import { buildSeatTopology } from '../../floor-plans/domain/build-seat-topology';
import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import {
  type CategoryAffinityMatrix,
  type DistributionEngine,
  type DistributionEngineInput,
  type DistributionEngineResult,
  type ExplicitAffinityRelation,
  type SolverStatus,
} from './distribution-engine.port';
import {
  MOTOR_VERSION_V1_CPSAT,
  type DistributionStats,
  type GuestPlacement,
  type HardRuleViolation,
} from './distribution.types';
import {
  areAffine,
  areIncompatible,
  hasInternalIncompatibility,
  sharesCategory,
  type PlacementUnit,
} from './placement-units';
import {
  applyPreparedMotorInput,
  prepareDistributionMotorInput,
} from './prepare-distribution-motor-input';
import { buildSeatPairWeights, PROXIMITY_WEIGHTS } from './seat-affinity';
import {
  allPlacementsHaveSeats,
  assignCompanionAwareSeatFallback,
  assignSequentialSeatFallback,
} from './seat-assignment-fallback';
import { addTablePackingObjective } from './table-packing';
import { addCategoryGroupingObjective } from './cp-sat-category-grouping';
import {
  adjacentSeatIndexPairs,
  addCompanionAdjacentSeatConstraints,
  buildCompanionGuestPairs,
  type CompanionGuestPair,
} from './seat-companion-adjacency';
import { guestNamesMatch } from './guest-name-match';
import {
  analyzeCategoryDistributions,
  categoryGroupingPenalty,
  tableCategoryMixingPenalty,
} from './category-grouping';
import { buildSoftRulePlan, type SoftRulePlan } from './soft-rules';

type CpSatModule = typeof import('or-tools-wasm/cp-sat');
type CpModelInstance = InstanceType<CpSatModule['CpModel']>;
type BoolVar = ReturnType<CpModelInstance['newBoolVar']>;
type IntVar = ReturnType<CpModelInstance['newIntVar']>;

const DEFAULT_TIME_BUDGET_MS = 8_000;
const ASSIGNMENT_ONLY_FALLBACK_BUDGET_MS = 5_000;
const CATEGORY_RETRY_BUDGET_MS = 8_000;
/** Tiempo reservado para bloqueo secuencial L1 duro por categoría (ADR-024). */
const CATEGORY_REFINEMENT_RESERVE_BASE_MS = 16_000;
const CATEGORY_INITIAL_ATTEMPT_CAP_MS = 9_000;
const CATEGORY_PER_CATEGORY_HARD_L1_BUDGET_MS = 8_000;
const CATEGORY_MINIMIZE_RETRY_BUDGET_MS = 12_000;
/** Tope de wall-clock para la escalada ADR-024 (evita cortar el proxy HTTP). */
const CATEGORY_RESOLVE_MAX_MS = 45_000;
const TABLE_CAPACITY_ELASTIC_EXTRA_SEATS = 2;
const TABLE_CAPACITY_ELASTICITY_PENALTY_FACTOR = 0.35;

type CategoryAffinityPreset = {
  leftPattern: RegExp;
  rightPattern: RegExp;
  weight: number;
};

const DEFAULT_CATEGORY_AFFINITY_PRESETS: CategoryAffinityPreset[] = [
  {
    leftPattern: /\bamigos novia\b/i,
    rightPattern: /\bamigos novio\b/i,
    weight: 5_000,
  },
  {
    leftPattern: /\bamigos novia\b/i,
    rightPattern: /\bfamilia(?:res)? mayores\b/i,
    weight: -10_000,
  },
  {
    leftPattern: /\bamigos novio\b/i,
    rightPattern: /\bfamilia(?:res)? mayores\b/i,
    weight: -9_000,
  },
];

type CategoryGroupingAttempt = {
  hardCategoryL1: boolean;
  hardCategoryL2: boolean;
  hardCategoryL3: boolean;
  hardCategoryPurity?: boolean;
  hardPurityCategoryIds?: ReadonlySet<string>;
  hardCategoryL1Ids?: ReadonlySet<string>;
  boostCategoryL1Ids?: ReadonlySet<string>;
  boostCategoryFactor?: number;
  stripPairTerms?: boolean;
};

type TableAssignmentPhase = {
  solverStatus: SolverStatus;
  solver: InstanceType<CpSatModule['CpSolver']>;
  assignVars: BoolVar[][];
  objectiveScore?: number;
  categoryTablesUsed?: Map<string, number>;
};

type UnitPair = {
  leftUnit: number;
  rightUnit: number;
};

type ExplicitHardRelationConstraints = {
  sameTableUnitPairs: UnitPair[];
  incompatibleUnitPairs: UnitPair[];
  affinityGuestPairs: CompanionGuestPair[];
};

export const ENGINE_PROFILES = [
  'balanced',
  'category_dominant',
  'affinity_dominant',
] as const;
export type EngineProfile = (typeof ENGINE_PROFILES)[number];

export function resolveEngineProfile(input: {
  guestCount: number;
  tableCount: number;
  pairTermCount: number;
  categoryPlanCount: number;
  explicitHardRelationCount: number;
}): EngineProfile {
  const categoryPressure = input.categoryPlanCount * Math.max(1, input.tableCount);
  const affinityPressure = input.pairTermCount + input.explicitHardRelationCount * 2;
  const avgGuestsPerTable =
    input.tableCount > 0 ? input.guestCount / input.tableCount : input.guestCount;

  if (
    input.categoryPlanCount >= 8 &&
    categoryPressure >= Math.max(24, affinityPressure * 1.1) &&
    avgGuestsPerTable <= 7
  ) {
    return 'category_dominant';
  }

  if (
    affinityPressure >= Math.max(6, categoryPressure * 1.2) &&
    avgGuestsPerTable > 3
  ) {
    return 'affinity_dominant';
  }

  return 'balanced';
}

/** ADR-024: escalada L3 blando → L1+pureza duro → sin pairTerms si compiten. */
export function buildCategoryGroupingAttempts(
  categoryGrouping: SoftRulePlan['categoryGrouping'],
  profile: EngineProfile = 'balanced',
): CategoryGroupingAttempt[] {
  if (categoryGrouping === undefined) {
    return [
      {
        hardCategoryL1: false,
        hardCategoryL2: false,
        hardCategoryL3: false,
      },
    ];
  }

  const baseSoftAttempt: CategoryGroupingAttempt = {
    hardCategoryL1: false,
    hardCategoryL2: false,
    hardCategoryL3: true,
  };
  const hardWithPairs: CategoryGroupingAttempt = {
    hardCategoryL1: true,
    hardCategoryL2: false,
    hardCategoryL3: true,
  };
  const hardWithoutPairs: CategoryGroupingAttempt = {
    ...hardWithPairs,
    stripPairTerms: true,
  };

  if (profile === 'category_dominant') {
    return [
      baseSoftAttempt,
      hardWithoutPairs,
      hardWithPairs,
      {
        ...hardWithoutPairs,
        hardCategoryL2: true,
      },
    ];
  }

  if (profile === 'affinity_dominant') {
    return [baseSoftAttempt, hardWithPairs, hardWithoutPairs];
  }

  return [baseSoftAttempt, hardWithoutPairs, hardWithPairs];
}

/** Escala el presupuesto cuando hay muchos terminos blandos (pares x mesas). */
export function resolveCpSatTimeBudgetMs(
  input: DistributionEngineInput,
  pairTermCount: number,
  tableCount: number,
  categoryPlanCount = 0,
): number {
  if (input.timeBudgetMs !== undefined) {
    return input.timeBudgetMs;
  }

  const categoryComplexity =
    categoryPlanCount * tableCount * Math.max(1, tableCount - 1);
  const softComplexity = pairTermCount * tableCount + categoryComplexity;

  if (softComplexity === 0) {
    return 3_000;
  }
  if (categoryPlanCount > 0 && softComplexity < 2_000) {
    return 20_000;
  }
  if (softComplexity < 2_000) {
    return DEFAULT_TIME_BUDGET_MS;
  }
  if (softComplexity < 15_000) {
    return 20_000;
  }
  return 30_000;
}

export function resolveCategoryRefinementReserveMs(
  categoryPlanCount: number,
): number {
  if (categoryPlanCount <= 0) {
    return 0;
  }
  return Math.max(
    CATEGORY_REFINEMENT_RESERVE_BASE_MS,
    categoryPlanCount * 2_500,
  );
}

function resolveCategoryAffinityMatrix(
  categoryIds: readonly string[],
  providedMatrix?: CategoryAffinityMatrix,
): CategoryAffinityMatrix | undefined {
  if (providedMatrix !== undefined) {
    return providedMatrix;
  }
  if (categoryIds.length < 2) {
    return undefined;
  }

  const matrix: Record<string, Record<string, number>> = {};
  for (let left = 0; left < categoryIds.length; left += 1) {
    for (let right = left + 1; right < categoryIds.length; right += 1) {
      const leftCategory = categoryIds[left];
      const rightCategory = categoryIds[right];
      const preset = DEFAULT_CATEGORY_AFFINITY_PRESETS.find((entry) =>
        categoryPairMatchesPreset(leftCategory, rightCategory, entry),
      );
      if (!preset || preset.weight === 0) {
        continue;
      }
      setCategoryAffinityWeight(
        matrix,
        leftCategory,
        rightCategory,
        preset.weight,
      );
    }
  }

  return Object.keys(matrix).length > 0 ? matrix : undefined;
}

function categoryPairMatchesPreset(
  leftCategory: string,
  rightCategory: string,
  preset: CategoryAffinityPreset,
): boolean {
  const directMatch =
    preset.leftPattern.test(leftCategory) &&
    preset.rightPattern.test(rightCategory);
  if (directMatch) {
    return true;
  }
  return (
    preset.leftPattern.test(rightCategory) &&
    preset.rightPattern.test(leftCategory)
  );
}

function setCategoryAffinityWeight(
  matrix: Record<string, Record<string, number>>,
  leftCategory: string,
  rightCategory: string,
  weight: number,
): void {
  matrix[leftCategory] ??= {};
  matrix[rightCategory] ??= {};
  matrix[leftCategory][rightCategory] = weight;
  matrix[rightCategory][leftCategory] = weight;
}

/**
 * Fase 1 (global) del motor CP-SAT del ADR-023: asignacion invitado -> mesa.
 *
 * Reglas duras SDD seccion 7.1 como restricciones del modelo:
 * - capacidad por mesa,
 * - acompanantes juntos (unidad indivisible),
 * - incompatibilidades (unidades incompatibles no comparten mesa).
 *
 * Objetivo (HU-17): prioridad lexicografica dinamica de reglas blandas segun
 * su orden en la pantalla de afinidades (ver soft-rules.ts), dominada siempre
 * por el numero de invitados asignados.
 * La fase 2 (asiento intra-mesa) se incorporara sobre esta solucion.
 */
export class CpSatDistributionEngine implements DistributionEngine {
  readonly motorVersion = MOTOR_VERSION_V1_CPSAT;

  /**
   * or-tools-wasm es ESM-only y la API compila a CommonJS: se carga con
   * import() dinamico (preservado por module=nodenext) y se cachea.
   */
  private modulePromise: Promise<CpSatModule> | null = null;
  private workerBridgeConfigured = false;

  private cleanupWorkerBridge(module: CpSatModule): void {
    const bridgeCapableModule = module as CpSatModule & {
      terminateWorkerBridge?: (reason?: string) => void;
    };
    if (typeof bridgeCapableModule.terminateWorkerBridge !== 'function') {
      return;
    }
    try {
      bridgeCapableModule.terminateWorkerBridge(
        'Distribución finalizada: cierre de worker bridge.',
      );
    } catch {
      // Cierre best-effort: un fallo aquí no debe afectar al resultado calculado.
    }
  }

  async compute(
    input: DistributionEngineInput,
  ): Promise<DistributionEngineResult> {
    const prepared = prepareDistributionMotorInput(
      input.guests,
      input.softRules,
      input.explicitAffinityRelations,
    );
    const engineInput = applyPreparedMotorInput(input, prepared);

    const guestById = new Map(engineInput.guests.map((guest) => [guest.id, guest]));
    const violations: HardRuleViolation[] = [];
    const placements: GuestPlacement[] = [];
    const unassigned = new Set<string>();

    const totalCapacity = input.tables.reduce(
      (sum, table) => sum + table.capacity,
      0,
    );

    if (input.tables.length === 0 || engineInput.guests.length === 0) {
      return this.buildResult(engineInput, {
        placements,
        unassigned,
        violations,
        totalCapacity,
      });
    }

    if (totalCapacity < engineInput.guests.length) {
      violations.push({
        code: 'INSUFFICIENT_TOTAL_CAPACITY',
        message: `Capacidad total (${totalCapacity}) inferior al numero de invitados (${engineInput.guests.length}).`,
        guestIds: engineInput.guests.map((guest) => guest.id),
      });
    }

    const solvableUnits = this.filterSolvableUnits(
      prepared.placementUnits,
      guestById,
      violations,
      unassigned,
    );

    if (solvableUnits.length === 0) {
      return this.buildResult(engineInput, {
        placements,
        unassigned,
        violations,
        totalCapacity,
      });
    }

    const hardRelationConstraints = this.buildExplicitHardRelationConstraints(
      engineInput.guests,
      solvableUnits,
      prepared.explicitAffinityRelations,
    );

    const maxTableCapacity = Math.max(
      ...input.tables.map((table) => table.capacity),
    );
    const softPlan: SoftRulePlan = buildSoftRulePlan(
      solvableUnits,
      guestById,
      engineInput.softRules ?? [],
      {
        maxTableCapacity,
        tableCount: input.tables.length,
      },
    );

    const cpSatModule = await this.loadModule();
    this.configureWorkerBridge(cpSatModule);
    const { CpModel, CpSolver, weightedSum } = cpSatModule;
    try {
    const categoryPlanCount = softPlan.categoryGrouping?.plans.length ?? 0;
    const engineProfile = resolveEngineProfile({
      guestCount: engineInput.guests.length,
      tableCount: input.tables.length,
      pairTermCount: softPlan.pairTerms.length,
      categoryPlanCount,
      explicitHardRelationCount:
        hardRelationConstraints.sameTableUnitPairs.length +
        hardRelationConstraints.incompatibleUnitPairs.length,
    });
    const timeBudgetMs = resolveCpSatTimeBudgetMs(
      input,
      softPlan.pairTerms.length,
      input.tables.length,
      categoryPlanCount,
    );

    const solvableGuestCount = solvableUnits.reduce(
      (sum, unit) => sum + unit.guestIds.length,
      0,
    );
    const requireFullAssignment = totalCapacity >= solvableGuestCount;

    const categoryAttempts = buildCategoryGroupingAttempts(
      softPlan.categoryGrouping,
      engineProfile,
    );

    let phase1 = await this.resolveBestTableAssignment({
      CpModel,
      CpSolver,
      weightedSum,
      input,
      solvableUnits,
      guestById,
      softPlan,
      timeBudgetMs,
      requireFullAssignment,
      maxTableCapacity,
      categoryAttempts,
      hardRelationConstraints,
      engineProfile,
    });

    if (
      phase1.solverStatus === 'UNKNOWN' &&
      (softPlan.pairTerms.length > 0 || softPlan.categoryGrouping !== undefined)
    ) {
      phase1 = await this.solveTableAssignment({
        CpModel,
        CpSolver,
        weightedSum,
        input,
        solvableUnits,
        guestById,
        softPlan: {
          pairTerms: [],
          assignmentWeight: softPlan.assignmentWeight,
          appliedRules: softPlan.appliedRules,
          categoryGrouping: softPlan.categoryGrouping,
        },
        timeBudgetMs: Math.max(timeBudgetMs, ASSIGNMENT_ONLY_FALLBACK_BUDGET_MS),
        requireFullAssignment,
        hardRelationConstraints,
        engineProfile,
      });
    }

    if (
      (phase1.solverStatus === 'INFEASIBLE' ||
        phase1.solverStatus === 'UNKNOWN') &&
      softPlan.categoryGrouping !== undefined
    ) {
      phase1 = await this.solveTableAssignment({
        CpModel,
        CpSolver,
        weightedSum,
        input,
        solvableUnits,
        guestById,
        softPlan: {
          pairTerms: softPlan.pairTerms,
          assignmentWeight: softPlan.assignmentWeight,
          appliedRules: softPlan.appliedRules,
        },
        timeBudgetMs: Math.max(timeBudgetMs, ASSIGNMENT_ONLY_FALLBACK_BUDGET_MS),
        requireFullAssignment,
        hardRelationConstraints,
        engineProfile,
      });
    }

    const { solverStatus, solver, assignVars, objectiveScore } = phase1;

    if (solverStatus === 'INFEASIBLE' || solverStatus === 'UNKNOWN') {
      for (const unit of solvableUnits) {
        this.markUnassigned(unit, violations, unassigned);
      }
      return this.buildResult(engineInput, {
        placements,
        unassigned,
        violations,
        totalCapacity,
        solverStatus,
      });
    }

    this.extractPlacementsFromSolution(
      solvableUnits,
      assignVars,
      solver,
      input.tables,
      guestById,
      placements,
      violations,
      unassigned,
    );

    await this.assignSeats(placements, input.tables, guestById, {
      CpModel,
      CpSolver,
      weightedSum,
      explicitAffinityRelations: prepared.explicitAffinityRelations,
    });

    return this.buildResult(engineInput, {
      placements,
      unassigned,
      violations,
      totalCapacity,
      solverStatus,
      objectiveScore,
    });
    } finally {
      this.cleanupWorkerBridge(cpSatModule);
    }
  }

  private async resolveBestTableAssignment(parts: {
    CpModel: CpSatModule['CpModel'];
    CpSolver: CpSatModule['CpSolver'];
    weightedSum: CpSatModule['weightedSum'];
    input: DistributionEngineInput;
    solvableUnits: PlacementUnit[];
    guestById: Map<string, Guest>;
    softPlan: SoftRulePlan;
    timeBudgetMs: number;
    requireFullAssignment: boolean;
    maxTableCapacity: number;
    categoryAttempts: CategoryGroupingAttempt[];
    hardRelationConstraints: ExplicitHardRelationConstraints;
    engineProfile: EngineProfile;
  }): Promise<TableAssignmentPhase> {
    const {
      CpModel,
      CpSolver,
      weightedSum,
      input,
      solvableUnits,
      guestById,
      softPlan,
      timeBudgetMs,
      requireFullAssignment,
      maxTableCapacity,
      categoryAttempts,
      hardRelationConstraints,
      engineProfile,
    } = parts;

    let bestPhase: TableAssignmentPhase | null = null;
    let bestPenalty = Number.POSITIVE_INFINITY;
    let bestAnalyses: ReturnType<typeof analyzeCategoryDistributions> = [];
    let bestMixingPenalty = Number.POSITIVE_INFINITY;
    const categoryRefinementReserveMs = resolveCategoryRefinementReserveMs(
      softPlan.categoryGrouping?.plans.length ?? 0,
    );
    const resolveStarted = Date.now();
    const resolveMaxMs = Math.min(
      Math.max(
        CATEGORY_RESOLVE_MAX_MS,
        Math.min(timeBudgetMs, 20_000) + categoryRefinementReserveMs,
      ),
      120_000,
    );

    const resolveDeadlineReached = () =>
      Date.now() - resolveStarted >= resolveMaxMs;

    const remainingResolveMs = () =>
      Math.max(0, resolveMaxMs - (Date.now() - resolveStarted));

    const significantCategoryIds = new Set(
      softPlan.categoryGrouping?.plans.map((plan) => plan.categoryId) ?? [],
    );
    const significantCategoriesConverged = (
      analyses: ReturnType<typeof analyzeCategoryDistributions>,
    ) => {
      const significantAnalyses = analyses.filter((analysis) =>
        significantCategoryIds.has(analysis.categoryId),
      );
      return (
        significantAnalyses.length > 0 &&
        significantAnalyses.every(
          (analysis) =>
            analysis.kUsed <= analysis.kMin &&
            analysis.orphanCount === 0 &&
            analysis.spread <= 1,
        )
      );
    };

    const attemptBudgetMs = (index: number, attempt: CategoryGroupingAttempt) => {
      const remainingForAttempts =
        remainingResolveMs() - categoryRefinementReserveMs;
      if (remainingForAttempts <= 0) {
        return 1_000;
      }
      const hardAttemptFloorMs =
        engineProfile === 'category_dominant' ? 12_000 : 9_000;
      const hardAttemptTargetMs = Math.max(
        hardAttemptFloorMs,
        Math.min(
          timeBudgetMs,
          engineProfile === 'category_dominant' ? 14_000 : 11_000,
        ),
      );
      if (attempt.hardCategoryL1) {
        return Math.min(hardAttemptTargetMs, remainingForAttempts);
      }
      if (index === 0) {
        const initialCapMs =
          softPlan.categoryGrouping !== undefined
            ? CATEGORY_INITIAL_ATTEMPT_CAP_MS
            : timeBudgetMs;
        return Math.min(initialCapMs, timeBudgetMs, remainingForAttempts);
      }
      const cap = CATEGORY_RETRY_BUDGET_MS;
      return Math.min(cap, remainingForAttempts, timeBudgetMs);
    };

    const considerPhase = (phase: TableAssignmentPhase) => {
      if (
        phase.solverStatus !== 'OPTIMAL' &&
        phase.solverStatus !== 'FEASIBLE'
      ) {
        return;
      }

      if (softPlan.categoryGrouping === undefined) {
        bestPhase = phase;
        bestPenalty = 0;
        bestMixingPenalty = 0;
        return;
      }

      const placements = this.previewPlacements(
        phase,
        solvableUnits,
        input,
        guestById,
      );
      const analyses = analyzeCategoryDistributions(
        placements,
        input.guests,
        maxTableCapacity,
      );
      const mixingPenalty = tableCategoryMixingPenalty(
        placements,
        input.guests,
        significantCategoryIds,
      );
      const significantAnalyses = analyses.filter((analysis) =>
        significantCategoryIds.has(analysis.categoryId),
      );
      const convergedGrouping =
        significantAnalyses.length > 0 &&
        mixingPenalty === 0 &&
        significantAnalyses.every(
          (analysis) =>
            analysis.kUsed <= analysis.kMin &&
            analysis.orphanCount === 0 &&
            analysis.spread <= 1,
        );
      const penalty = convergedGrouping
        ? 0
        : categoryGroupingPenalty(analyses, mixingPenalty);

      if (bestPhase === null || penalty < bestPenalty) {
        bestPenalty = penalty;
        bestMixingPenalty = mixingPenalty;
        bestPhase = phase;
        bestAnalyses = analyses;
      }
    };

    for (const [index, attempt] of categoryAttempts.entries()) {
      if (resolveDeadlineReached()) {
        break;
      }
      const phase = await this.solveTableAssignment({
        CpModel,
        CpSolver,
        weightedSum,
        input,
        solvableUnits,
        guestById,
        softPlan: attempt.stripPairTerms
          ? {
              pairTerms: [],
              assignmentWeight: softPlan.assignmentWeight,
              appliedRules: softPlan.appliedRules,
              categoryGrouping: softPlan.categoryGrouping,
            }
          : softPlan,
        timeBudgetMs: attemptBudgetMs(index, attempt),
        requireFullAssignment,
        hardRelationConstraints,
        engineProfile,
        hardCategoryL1: attempt.hardCategoryL1,
        hardCategoryL2: attempt.hardCategoryL2,
        hardCategoryL3: attempt.hardCategoryL3,
        hardCategoryPurity: attempt.hardCategoryPurity,
        hardPurityCategoryIds: attempt.hardPurityCategoryIds,
        hardCategoryL1Ids: attempt.hardCategoryL1Ids,
        boostCategoryL1Ids: attempt.boostCategoryL1Ids,
        boostCategoryFactor: attempt.boostCategoryFactor,
      });
      considerPhase(phase);
      if (bestPenalty === 0) {
        break;
      }
    }

    if (softPlan.categoryGrouping !== undefined) {
      const strippedSoftPlan: SoftRulePlan = {
        pairTerms: [],
        assignmentWeight: softPlan.assignmentWeight,
        appliedRules: softPlan.appliedRules,
        categoryGrouping: softPlan.categoryGrouping,
      };
      const refinementPlans = [...softPlan.categoryGrouping.plans].sort(
        (left, right) => {
          const leftAnalysis = bestAnalyses.find(
            (entry) => entry.categoryId === left.categoryId,
          );
          const rightAnalysis = bestAnalyses.find(
            (entry) => entry.categoryId === right.categoryId,
          );
          const leftExtra = Math.max(
            0,
            (leftAnalysis?.kUsed ?? left.kMin) - left.kMin,
          );
          const rightExtra = Math.max(
            0,
            (rightAnalysis?.kUsed ?? right.kMin) - right.kMin,
          );
          const leftRatio = leftExtra / Math.max(1, left.kMin);
          const rightRatio = rightExtra / Math.max(1, right.kMin);
          const leftOrphans = leftAnalysis?.orphanCount ?? 0;
          const rightOrphans = rightAnalysis?.orphanCount ?? 0;

          return (
            rightRatio - leftRatio ||
            rightOrphans - leftOrphans ||
            rightExtra - leftExtra ||
            left.kMin - right.kMin ||
            right.guestCount - left.guestCount ||
            left.categoryId.localeCompare(right.categoryId)
          );
        },
      );
      for (const plan of refinementPlans) {
        if (resolveDeadlineReached() || bestPhase === null) {
          break;
        }
        if (
          bestMixingPenalty === 0 &&
          significantCategoriesConverged(bestAnalyses)
        ) {
          break;
        }

        const focusPrevious = bestAnalyses.find(
          (entry) => entry.categoryId === plan.categoryId,
        );
        if (
          focusPrevious !== undefined &&
          focusPrevious.kUsed === plan.kMin
        ) {
          continue;
        }

        // Paso 1: minimizar kUsed de la categoría en aislamiento CP-SAT.
        const primaryMinimizeSoftPlan =
          engineProfile === 'category_dominant' ? strippedSoftPlan : softPlan;
        let minimizePhase = await this.solveTableAssignment({
          CpModel,
          CpSolver,
          weightedSum,
          input,
          solvableUnits,
          guestById,
          softPlan: primaryMinimizeSoftPlan,
          timeBudgetMs: Math.min(
            CATEGORY_INITIAL_ATTEMPT_CAP_MS,
            remainingResolveMs(),
            timeBudgetMs,
          ),
          requireFullAssignment,
          hardRelationConstraints,
          engineProfile,
          hardCategoryL1: false,
          hardCategoryL2: false,
          hardCategoryL3: true,
          hardCategoryL1Ids: new Set([plan.categoryId]),
          minimizeTablesForCategoryId: plan.categoryId,
        });

        if (
          minimizePhase.solverStatus !== 'OPTIMAL' &&
          minimizePhase.solverStatus !== 'FEASIBLE'
        ) {
          continue;
        }

        const minimizedKUsed = minimizePhase.categoryTablesUsed?.get(plan.categoryId);
        let bestMinimizedKUsed = minimizedKUsed;
        if (
          focusPrevious !== undefined &&
          (bestMinimizedKUsed === undefined ||
            bestMinimizedKUsed >= focusPrevious.kUsed) &&
          !resolveDeadlineReached()
        ) {
          const minimizeRetry = await this.solveTableAssignment({
            CpModel,
            CpSolver,
            weightedSum,
            input,
            solvableUnits,
            guestById,
            softPlan: strippedSoftPlan,
            timeBudgetMs: Math.min(
              CATEGORY_MINIMIZE_RETRY_BUDGET_MS,
              remainingResolveMs(),
              Math.max(timeBudgetMs, CATEGORY_MINIMIZE_RETRY_BUDGET_MS),
            ),
            requireFullAssignment,
            hardRelationConstraints,
            engineProfile,
            hardCategoryL1: false,
            hardCategoryL2: false,
            hardCategoryL3: true,
            hardCategoryL1Ids: new Set([plan.categoryId]),
            minimizeTablesForCategoryId: plan.categoryId,
          });
          if (
            (minimizeRetry.solverStatus === 'OPTIMAL' ||
              minimizeRetry.solverStatus === 'FEASIBLE') &&
            minimizeRetry.categoryTablesUsed?.get(plan.categoryId) !== undefined
          ) {
            const retriedKUsed = minimizeRetry.categoryTablesUsed.get(plan.categoryId);
            if (
              retriedKUsed !== undefined &&
              (bestMinimizedKUsed === undefined || retriedKUsed < bestMinimizedKUsed)
            ) {
              minimizePhase = minimizeRetry;
              bestMinimizedKUsed = retriedKUsed;
            }
          }
        }

        if (
          focusPrevious !== undefined &&
          bestMinimizedKUsed !== undefined &&
          bestMinimizedKUsed > plan.kMin &&
          !resolveDeadlineReached()
        ) {
          for (
            let targetK = plan.kMin;
            targetK < Math.min(bestMinimizedKUsed, focusPrevious.kUsed);
            targetK += 1
          ) {
            const feasibilityProbe = await this.solveTableAssignment({
              CpModel,
              CpSolver,
              weightedSum,
              input,
              solvableUnits,
              guestById,
              softPlan: strippedSoftPlan,
              timeBudgetMs: Math.min(
                CATEGORY_MINIMIZE_RETRY_BUDGET_MS,
                remainingResolveMs(),
                Math.max(timeBudgetMs, 15_000),
              ),
              requireFullAssignment,
              hardRelationConstraints,
              engineProfile,
              hardCategoryL1: true,
              hardCategoryL2: true,
              hardCategoryL3: true,
              hardCategoryL1Ids: new Set([plan.categoryId]),
              fixedKMinByCategory: new Map([[plan.categoryId, targetK]]),
              satisfactionOnly: true,
            });
            if (
              feasibilityProbe.solverStatus === 'OPTIMAL' ||
              feasibilityProbe.solverStatus === 'FEASIBLE'
            ) {
              bestMinimizedKUsed = targetK;
              break;
            }
          }
        }

        if (bestMinimizedKUsed === undefined) {
          continue;
        }
        if (
          focusPrevious !== undefined &&
          bestMinimizedKUsed >= focusPrevious.kUsed
        ) {
          continue;
        }

        // Paso 2: fijar el k minimizado y reoptimizar global con ese bloqueo.
        const lockSoftPlans: SoftRulePlan[] =
          engineProfile === 'affinity_dominant'
            ? [softPlan]
            : [softPlan, strippedSoftPlan];
        let phase: TableAssignmentPhase | null = null;
        for (const lockSoftPlan of lockSoftPlans) {
          const lockCandidate = await this.solveTableAssignment({
            CpModel,
            CpSolver,
            weightedSum,
            input,
            solvableUnits,
            guestById,
            softPlan: lockSoftPlan,
            timeBudgetMs: Math.min(
              CATEGORY_PER_CATEGORY_HARD_L1_BUDGET_MS,
              remainingResolveMs(),
              timeBudgetMs,
            ),
            requireFullAssignment,
            hardRelationConstraints,
            engineProfile,
            hardCategoryL1: true,
            hardCategoryL2:
              bestMinimizedKUsed <= plan.kMin ||
              (focusPrevious !== undefined && focusPrevious.spread > 1),
            hardCategoryL3: true,
            hardCategoryL1Ids: new Set([plan.categoryId]),
            fixedKMinByCategory: new Map([[plan.categoryId, bestMinimizedKUsed]]),
          });
          if (
            lockCandidate.solverStatus === 'OPTIMAL' ||
            lockCandidate.solverStatus === 'FEASIBLE'
          ) {
            phase = lockCandidate;
            break;
          }
        }

        if (phase === null) {
          continue;
        }

        const candidatePlacements = this.previewPlacements(
          phase,
          solvableUnits,
          input,
          guestById,
        );
        const candidateAnalyses = analyzeCategoryDistributions(
          candidatePlacements,
          input.guests,
          maxTableCapacity,
        );
        const focusNext = candidateAnalyses.find(
          (entry) => entry.categoryId === plan.categoryId,
        );
        if (
          focusPrevious === undefined ||
          focusNext === undefined ||
          focusNext.kUsed >= focusPrevious.kUsed ||
          focusNext.kUsed > bestMinimizedKUsed
        ) {
          continue;
        }

        const candidateMixingPenalty = tableCategoryMixingPenalty(
          candidatePlacements,
          input.guests,
          significantCategoryIds,
        );
        const candidatePenalty = categoryGroupingPenalty(
          candidateAnalyses,
          candidateMixingPenalty,
        );
        const penaltyTolerance =
          focusNext.kUsed <= plan.kMin
            ? 200_000
            : focusNext.kUsed < focusPrevious.kUsed
              ? 100_000
              : 20_000;
        const allowSlightPenaltyIncrease =
          focusNext.kUsed < focusPrevious.kUsed &&
          candidatePenalty <= bestPenalty + penaltyTolerance;
        if (candidatePenalty >= bestPenalty && !allowSlightPenaltyIncrease) {
          continue;
        }

        if (candidatePenalty < bestPenalty) {
          considerPhase(phase);
        } else {
          bestPenalty = candidatePenalty;
          bestMixingPenalty = candidateMixingPenalty;
          bestPhase = phase;
          bestAnalyses = candidateAnalyses;
        }
        if (bestPenalty === 0) {
          break;
        }
      }
    }

    if (bestPhase !== null) {
      return bestPhase;
    }

    const softFallback = await this.solveTableAssignment({
      CpModel,
      CpSolver,
      weightedSum,
      input,
      solvableUnits,
      guestById,
      softPlan,
      timeBudgetMs,
      requireFullAssignment,
      hardRelationConstraints,
      engineProfile,
      hardCategoryL1: false,
      hardCategoryL2: false,
      hardCategoryL3: true,
    });
    considerPhase(softFallback);
    if (bestPhase !== null) {
      return bestPhase;
    }

    return softFallback;
  }

  private previewPlacements(
    phase: TableAssignmentPhase,
    solvableUnits: PlacementUnit[],
    input: DistributionEngineInput,
    guestById: Map<string, Guest>,
  ): GuestPlacement[] {
    const placements: GuestPlacement[] = [];
    const violations: HardRuleViolation[] = [];
    const unassigned = new Set<string>();

    this.extractPlacementsFromSolution(
      solvableUnits,
      phase.assignVars,
      phase.solver,
      input.tables,
      guestById,
      placements,
      violations,
      unassigned,
    );

    return placements;
  }

  private async solveTableAssignment(parts: {
    CpModel: CpSatModule['CpModel'];
    CpSolver: CpSatModule['CpSolver'];
    weightedSum: CpSatModule['weightedSum'];
    input: DistributionEngineInput;
    solvableUnits: PlacementUnit[];
    guestById: Map<string, Guest>;
    softPlan: SoftRulePlan;
    timeBudgetMs: number;
    requireFullAssignment: boolean;
    hardRelationConstraints: ExplicitHardRelationConstraints;
    engineProfile: EngineProfile;
    hardCategoryL1?: boolean;
    hardCategoryL2?: boolean;
    hardCategoryL3?: boolean;
    hardCategoryPurity?: boolean;
    hardCategoryL1Ids?: ReadonlySet<string>;
    hardPurityCategoryIds?: ReadonlySet<string>;
    boostCategoryL1Ids?: ReadonlySet<string>;
    boostCategoryFactor?: number;
    minimizeTablesForCategoryId?: string;
    fixedKMinByCategory?: ReadonlyMap<string, number>;
    satisfactionOnly?: boolean;
  }): Promise<{
    solverStatus: SolverStatus;
    solver: InstanceType<CpSatModule['CpSolver']>;
    assignVars: BoolVar[][];
    objectiveScore?: number;
    categoryTablesUsed?: Map<string, number>;
  }> {
    const {
      CpModel,
      CpSolver,
      weightedSum,
      input,
      solvableUnits,
      guestById,
      softPlan,
      timeBudgetMs,
      requireFullAssignment,
      hardRelationConstraints,
      engineProfile,
      hardCategoryL1 = false,
      hardCategoryL2 = false,
      hardCategoryL3 = false,
      hardCategoryPurity = false,
      hardCategoryL1Ids,
      hardPurityCategoryIds,
      boostCategoryL1Ids,
      boostCategoryFactor,
      minimizeTablesForCategoryId,
      fixedKMinByCategory,
      satisfactionOnly = false,
    } = parts;

    const model = new CpModel();
    const unitSizes = solvableUnits.map((unit) => unit.guestIds.length);

    // D3 (ADR-012): cada unidad keepTogether comparte una variable bool/mesa.
    // Equivalente a mesa[guestA] == mesa[guestB] para todo par de la unidad.
    const assignVars: BoolVar[][] = solvableUnits.map((unit, unitIndex) =>
      input.tables.map((table, tableIndex) =>
        model.newBoolVar(`x_u${unitIndex}_t${tableIndex}`),
      ),
    );

    for (const unitVars of assignVars) {
      if (requireFullAssignment) {
        model.addExactlyOne(unitVars);
      } else {
        model.addAtMostOne(unitVars);
      }
    }

    const elasticExcessVars: IntVar[] = [];
    input.tables.forEach((table, tableIndex) => {
      const tableVars = assignVars.map((unitVars) => unitVars[tableIndex]);
      const elasticCapacity = table.capacity + TABLE_CAPACITY_ELASTIC_EXTRA_SEATS;
      const seatedCount = model.newIntVar(
        0,
        elasticCapacity,
        `cap_fill_t${tableIndex}`,
      );
      model.addEquality(seatedCount, weightedSum(tableVars, unitSizes));
      model.addLinearConstraint(
        seatedCount,
        0,
        elasticCapacity,
      );

      const exceedsBaseCapacity = model.newBoolVar(`cap_over_t${tableIndex}`);
      model.addLinearConstraint(
        seatedCount,
        0,
        table.capacity,
      ).onlyEnforceIf(exceedsBaseCapacity.not());
      model.addLinearConstraint(
        seatedCount,
        table.capacity + 1,
        elasticCapacity,
      ).onlyEnforceIf(exceedsBaseCapacity);

      const excess = model.newIntVar(
        0,
        TABLE_CAPACITY_ELASTIC_EXTRA_SEATS,
        `cap_excess_t${tableIndex}`,
      );
      model.addLinearConstraint(
        weightedSum([excess, seatedCount], [1, -1]),
        -table.capacity,
        -table.capacity,
      ).onlyEnforceIf(exceedsBaseCapacity);
      model.addEquality(excess, 0).onlyEnforceIf(exceedsBaseCapacity.not());
      elasticExcessVars.push(excess);
    });

    this.addIncompatibilityConstraints(
      model,
      solvableUnits,
      assignVars,
      guestById,
      input.tables.length,
    );
    this.addExplicitHardRelationConstraints(
      model,
      assignVars,
      input.tables.length,
      hardRelationConstraints,
    );

    const objectiveVars: Array<BoolVar | IntVar> = [...assignVars.flat()];
    const objectiveWeights: number[] = solvableUnits.flatMap((unit) =>
      input.tables.map(() => unit.guestIds.length * softPlan.assignmentWeight),
    );
    const elasticityPenaltyWeight = Math.max(
      1,
      Math.round(
        softPlan.assignmentWeight * TABLE_CAPACITY_ELASTICITY_PENALTY_FACTOR,
      ),
    );
    objectiveVars.push(...elasticExcessVars);
    objectiveWeights.push(
      ...elasticExcessVars.map(() => -elasticityPenaltyWeight),
    );
    const pairTermWeightScale =
      engineProfile === 'category_dominant'
        ? 0.9
        : engineProfile === 'affinity_dominant'
          ? 1.2
          : 1;

    for (const term of softPlan.pairTerms) {
      for (let tableIndex = 0; tableIndex < input.tables.length; tableIndex += 1) {
        const together = model.newBoolVar(
          `y_${term.leftUnit}_${term.rightUnit}_t${tableIndex}`,
        );
        model.addImplication(together, assignVars[term.leftUnit][tableIndex]);
        model.addImplication(together, assignVars[term.rightUnit][tableIndex]);
        objectiveVars.push(together);
        objectiveWeights.push(
          Math.max(1, Math.round(term.weight * pairTermWeightScale)),
        );
      }
    }

    let categoryTablesUsed: Map<string, number> | undefined;
    const categoryAffinityMatrix =
      softPlan.categoryGrouping === undefined
        ? undefined
        : resolveCategoryAffinityMatrix(
            softPlan.categoryGrouping.plans.map((plan) => plan.categoryId),
            input.categoryAffinityMatrix,
          );

    if (softPlan.categoryGrouping !== undefined) {
      const categoryObjective = addCategoryGroupingObjective(
        model,
        weightedSum,
        softPlan.categoryGrouping.plans,
        input.tables,
        assignVars,
        softPlan.categoryGrouping.lexWeight,
        {
          hardL1: hardCategoryL1,
          hardL2: hardCategoryL2,
          hardL3: hardCategoryL3,
          hardPurity: hardCategoryPurity,
          hardPurityCategoryIds: hardPurityCategoryIds,
          hardL1CategoryIds: hardCategoryL1Ids,
          boostL1CategoryIds: boostCategoryL1Ids,
          boostL1Factor: boostCategoryFactor,
          minimizeTablesForCategoryId,
          fixedKMinByCategory,
          assignmentWeight: softPlan.assignmentWeight,
          tableElasticExtraSeats: TABLE_CAPACITY_ELASTIC_EXTRA_SEATS,
          categoryAffinityMatrix,
        },
      );

      if (minimizeTablesForCategoryId !== undefined) {
        const usedVars =
          categoryObjective.usedVarsByCategory.get(
            minimizeTablesForCategoryId,
          ) ?? [];
        if (usedVars.length > 0) {
          model.minimize(
            weightedSum(
              usedVars,
              usedVars.map(() => 1),
            ),
          );
        }
      } else {
        objectiveVars.push(...categoryObjective.objectiveVars);
        objectiveWeights.push(...categoryObjective.objectiveWeights);
      }
    }

    if (softPlan.categoryGrouping !== undefined) {
      const packingFactor =
        engineProfile === 'category_dominant'
          ? hardCategoryL1
            ? 1
            : 0.9
          : engineProfile === 'affinity_dominant'
            ? 0.6
            : 0.8;
      const packing = addTablePackingObjective(
        model,
        weightedSum,
        assignVars,
        unitSizes,
        input.tables,
        Math.max(1, Math.floor(softPlan.assignmentWeight * packingFactor)),
        0.2,
        TABLE_CAPACITY_ELASTIC_EXTRA_SEATS,
      );
      objectiveVars.push(...packing.objectiveVars);
      objectiveWeights.push(...packing.objectiveWeights);
    }

    if (!satisfactionOnly) {
      if (minimizeTablesForCategoryId === undefined) {
        model.maximize(weightedSum(objectiveVars, objectiveWeights));
      }
    }

    const solver = new CpSolver();
    solver.parameters.maxTimeInSeconds = timeBudgetMs / 1000;

    const status = await solver.solve(model);
    const solverStatus = this.mapStatus(solver.statusName(status));

    if (
      minimizeTablesForCategoryId !== undefined &&
      (solverStatus === 'OPTIMAL' || solverStatus === 'FEASIBLE') &&
      softPlan.categoryGrouping !== undefined
    ) {
      categoryTablesUsed = new Map();
      const plan = softPlan.categoryGrouping.plans.find(
        (entry) => entry.categoryId === minimizeTablesForCategoryId,
      );
      if (plan !== undefined) {
        let usedCount = 0;
        input.tables.forEach((table, tableIndex) => {
          let count = 0;
          assignVars.forEach((unitVars, unitIndex) => {
            if (
              solver.booleanValue(unitVars[tableIndex]) &&
              (plan.unitContributions[unitIndex] ?? 0) > 0
            ) {
              count += plan.unitContributions[unitIndex] ?? 0;
            }
          });
          if (count > 0) {
            usedCount += 1;
          }
        });
        categoryTablesUsed.set(minimizeTablesForCategoryId, usedCount);
      }
    }

    return {
      solverStatus,
      solver,
      assignVars,
      objectiveScore:
        solverStatus === 'OPTIMAL' || solverStatus === 'FEASIBLE'
          ? solver.objectiveValue()
          : undefined,
      categoryTablesUsed,
    };
  }

  private extractPlacementsFromSolution(
    solvableUnits: PlacementUnit[],
    assignVars: BoolVar[][],
    solver: InstanceType<CpSatModule['CpSolver']>,
    tables: EventTable[],
    guestById: Map<string, Guest>,
    placements: GuestPlacement[],
    violations: HardRuleViolation[],
    unassigned: Set<string>,
  ): void {
    solvableUnits.forEach((unit, unitIndex) => {
      const tableIndex = tables.findIndex((table, index) =>
        solver.booleanValue(assignVars[unitIndex][index]),
      );

      if (tableIndex === -1) {
        this.markUnassigned(unit, violations, unassigned);
        return;
      }

      const table = tables[tableIndex];
      for (const guestId of unit.guestIds) {
        const guest = guestById.get(guestId);
        if (!guest) {
          continue;
        }
        placements.push({
          guestId: guest.id,
          guestName: guest.nombre,
          tableId: table.id,
          tableLabel: table.label,
        });
      }
    });
  }

  /**
   * Fase 2 (ADR-023): asiento intra-mesa. Un mini-modelo CP-SAT independiente
   * por mesa (guests ya fijados por Fase 1), usando la topologia real segun
   * forma (ADR-009). Best-effort: si una mesa no admite topologia valida o el
   * subproblema no es resoluble, esa mesa se deja sin seatIndex/seatLabel sin
   * afectar al resto (los placements de mesa de la Fase 1 no se alteran).
   */
  private async assignSeats(
    placements: GuestPlacement[],
    tables: EventTable[],
    guestById: Map<string, Guest>,
    module: Pick<CpSatModule, 'CpModel' | 'CpSolver' | 'weightedSum'> & {
      explicitAffinityRelations: ExplicitAffinityRelation[];
    },
  ): Promise<void> {
    const { CpModel, CpSolver, weightedSum, explicitAffinityRelations } = module;
    const tableById = new Map(tables.map((table) => [table.id, table]));
    const placementsByTable = new Map<string, GuestPlacement[]>();

    for (const placement of placements) {
      const list = placementsByTable.get(placement.tableId) ?? [];
      list.push(placement);
      placementsByTable.set(placement.tableId, list);
    }

    await Promise.all(
      [...placementsByTable.entries()].map(([tableId, tablePlacements]) =>
        this.assignSeatsForTable(
          tableId,
          tablePlacements,
          tableById,
          guestById,
          explicitAffinityRelations,
          { CpModel, CpSolver, weightedSum },
        ),
      ),
    );
  }

  private async assignSeatsForTable(
    tableId: string,
    tablePlacements: GuestPlacement[],
    tableById: Map<string, EventTable>,
    guestById: Map<string, Guest>,
    explicitAffinityRelations: ExplicitAffinityRelation[],
    module: Pick<CpSatModule, 'CpModel' | 'CpSolver' | 'weightedSum'>,
  ): Promise<void> {
    const { CpModel, CpSolver, weightedSum } = module;
    const table = tableById.get(tableId);
    if (!table || tablePlacements.length === 0) {
      return;
    }

    const tableGuests = tablePlacements
      .map((placement) => guestById.get(placement.guestId))
      .filter((guest): guest is Guest => guest !== undefined);
    const effectiveSeatCapacity = Math.max(table.capacity, tableGuests.length);

    const guestIds = tableGuests.map((guest) => guest.id);
    const companionPairs = buildCompanionGuestPairs(tableGuests);
    const explicitAffinityPairs = this.resolveExplicitAffinityPairsAtTable(
      tableGuests,
      explicitAffinityRelations,
    );
    const requiredAdjacentPairs = this.mergeUniqueGuestPairs(
      companionPairs,
      explicitAffinityPairs,
    );
    const applyFallback = () => {
      if (requiredAdjacentPairs.length > 0) {
        let topologyForFallback;
        try {
          topologyForFallback = buildSeatTopology(
            table.shape,
            effectiveSeatCapacity,
          );
        } catch {
          assignSequentialSeatFallback(
            tablePlacements,
            guestIds,
            effectiveSeatCapacity,
          );
          return;
        }

        assignCompanionAwareSeatFallback(
          tablePlacements,
          guestIds,
          effectiveSeatCapacity,
          requiredAdjacentPairs,
          adjacentSeatIndexPairs(topologyForFallback),
        );
        return;
      }

      assignSequentialSeatFallback(
        tablePlacements,
        guestIds,
        effectiveSeatCapacity,
      );
    };

    if (tableGuests.length === 1) {
      applyFallback();
      return;
    }

    let topology;
    try {
      topology = buildSeatTopology(table.shape, effectiveSeatCapacity);
    } catch {
      applyFallback();
      return;
    }

    const pairWeights = buildSeatPairWeights(
      tableGuests,
      explicitAffinityRelations,
      [...guestById.values()],
    );
    const model = new CpModel();

    const seatVars: BoolVar[][] = tableGuests.map((guest, guestIndex) =>
      topology.seats.map((seat) =>
        model.newBoolVar(`s_g${guestIndex}_s${seat.index}`),
      ),
    );

    seatVars.forEach((guestSeatVars) => {
      model.addExactlyOne(guestSeatVars);
    });
    topology.seats.forEach((seat) => {
      model.addAtMostOne(seatVars.map((guestSeatVars) => guestSeatVars[seat.index]));
    });

    const guestIndexById = new Map(
      tableGuests.map((guest, index) => [guest.id, index]),
    );

    addCompanionAdjacentSeatConstraints(
      model,
      seatVars,
      guestIndexById,
      topology,
      requiredAdjacentPairs,
    );

    const requiredAdjacentPairKeys = new Set(
      requiredAdjacentPairs.map((pair) =>
        pair.leftGuestId < pair.rightGuestId
          ? `${pair.leftGuestId}:${pair.rightGuestId}`
          : `${pair.rightGuestId}:${pair.leftGuestId}`,
      ),
    );

    const objectiveVars: BoolVar[] = [];
    const objectiveWeights: number[] = [];

    for (const pair of pairWeights) {
      const leftIndex = guestIndexById.get(pair.leftGuestId);
      const rightIndex = guestIndexById.get(pair.rightGuestId);
      if (leftIndex === undefined || rightIndex === undefined) {
        continue;
      }

      const pairKey =
        pair.leftGuestId < pair.rightGuestId
          ? `${pair.leftGuestId}:${pair.rightGuestId}`
          : `${pair.rightGuestId}:${pair.leftGuestId}`;
      const requiresHardAdjacency = requiredAdjacentPairKeys.has(pairKey);
      const leftGuest = tableGuests[leftIndex];
      const rightGuest = tableGuests[rightIndex];
      const isCategoryOnlyPair =
        !requiresHardAdjacency &&
        !areAffine(leftGuest, rightGuest) &&
        sharesCategory(leftGuest, rightGuest);

      for (const proximity of topology.proximities) {
        if (
          (requiresHardAdjacency || isCategoryOnlyPair) &&
          proximity.kind !== 'adyacente'
        ) {
          continue;
        }

        const proximityWeight =
          pair.weight * PROXIMITY_WEIGHTS[proximity.kind];

        const forward = model.newBoolVar(
          `y_${leftIndex}_${rightIndex}_${proximity.from}_${proximity.to}`,
        );
        model.addImplication(forward, seatVars[leftIndex][proximity.from]);
        model.addImplication(forward, seatVars[rightIndex][proximity.to]);
        objectiveVars.push(forward);
        objectiveWeights.push(proximityWeight);

        const backward = model.newBoolVar(
          `y_${leftIndex}_${rightIndex}_${proximity.to}_${proximity.from}`,
        );
        model.addImplication(backward, seatVars[leftIndex][proximity.to]);
        model.addImplication(backward, seatVars[rightIndex][proximity.from]);
        objectiveVars.push(backward);
        objectiveWeights.push(proximityWeight);
      }
    }

    if (objectiveVars.length > 0) {
      model.maximize(weightedSum(objectiveVars, objectiveWeights));
    }

    const solver = new CpSolver();
    solver.parameters.maxTimeInSeconds = 8;

    const status = await solver.solve(model);
    const solverStatus = this.mapStatus(solver.statusName(status));
    if (solverStatus === 'INFEASIBLE' || solverStatus === 'UNKNOWN') {
      applyFallback();
      return;
    }

    tableGuests.forEach((guest, guestIndex) => {
      const seat = topology.seats.find((candidate) =>
        solver.booleanValue(seatVars[guestIndex][candidate.index]),
      );
      if (!seat) {
        return;
      }
      const placement = tablePlacements.find(
        (entry) => entry.guestId === guest.id,
      );
      if (placement) {
        placement.seatIndex = seat.index;
        placement.seatLabel = seat.label;
      }
    });

    if (!allPlacementsHaveSeats(tablePlacements)) {
      applyFallback();
    }
  }

  private configureWorkerBridge(module: CpSatModule): void {
    if (this.workerBridgeConfigured) {
      return;
    }
    this.workerBridgeConfigured = true;

    const bridgeCapableModule = module as CpSatModule & {
      setWorkerBridgeEnabled?: (enabled: boolean) => void;
      isWorkerBridgeAvailable?: () => boolean;
    };

    if (typeof bridgeCapableModule.setWorkerBridgeEnabled !== 'function') {
      return;
    }

    if (
      typeof bridgeCapableModule.isWorkerBridgeAvailable === 'function' &&
      !bridgeCapableModule.isWorkerBridgeAvailable()
    ) {
      return;
    }

    try {
      bridgeCapableModule.setWorkerBridgeEnabled(true);
    } catch {
      // Si el bridge no es viable en este runtime, seguimos en modo directo.
    }
  }

  private loadModule(): Promise<CpSatModule> {
    this.modulePromise ??= import('or-tools-wasm/cp-sat');
    return this.modulePromise;
  }

  private filterSolvableUnits(
    units: PlacementUnit[],
    guestById: Map<string, Guest>,
    violations: HardRuleViolation[],
    unassigned: Set<string>,
  ): PlacementUnit[] {
    const solvableUnits: PlacementUnit[] = [];

    for (const unit of units) {
      const members = unit.guestIds
        .map((guestId) => guestById.get(guestId))
        .filter((guest): guest is Guest => guest !== undefined);

      if (unit.keepTogether && hasInternalIncompatibility(members)) {
        violations.push({
          code: 'COMPANION_GROUP_INCOMPATIBLE',
          message:
            'El grupo de acompanantes no puede sentarse junto por incompatibilidades registradas.',
          guestIds: unit.guestIds,
        });
        for (const guestId of unit.guestIds) {
          unassigned.add(guestId);
        }
        continue;
      }

      solvableUnits.push(unit);
    }

    return solvableUnits;
  }

  private buildExplicitHardRelationConstraints(
    guests: Guest[],
    solvableUnits: PlacementUnit[],
    explicitAffinityRelations: ExplicitAffinityRelation[],
  ): ExplicitHardRelationConstraints {
    const unitIndexByGuestId = new Map<string, number>();
    solvableUnits.forEach((unit, unitIndex) => {
      unit.guestIds.forEach((guestId) => unitIndexByGuestId.set(guestId, unitIndex));
    });

    const sameTableUnitPairKeys = new Set<string>();
    const incompatibleUnitPairKeys = new Set<string>();
    const affinityGuestPairs: CompanionGuestPair[] = [];
    const affinityGuestPairKeys = new Set<string>();

    for (const relation of explicitAffinityRelations) {
      const leftGuest = this.resolveGuestByDisplayName(guests, relation.guestA);
      const rightGuest = this.resolveGuestByDisplayName(guests, relation.guestB);
      if (
        leftGuest === undefined ||
        rightGuest === undefined ||
        leftGuest.id === rightGuest.id
      ) {
        continue;
      }

      const guestPairKey = this.guestPairKey(leftGuest.id, rightGuest.id);
      if (relation.type === 'afinidad' && !affinityGuestPairKeys.has(guestPairKey)) {
        affinityGuestPairKeys.add(guestPairKey);
        affinityGuestPairs.push({
          leftGuestId: leftGuest.id,
          rightGuestId: rightGuest.id,
        });
      }

      const leftUnit = unitIndexByGuestId.get(leftGuest.id);
      const rightUnit = unitIndexByGuestId.get(rightGuest.id);
      if (
        leftUnit === undefined ||
        rightUnit === undefined ||
        leftUnit === rightUnit
      ) {
        continue;
      }

      const unitPairKey = this.unitPairKey(leftUnit, rightUnit);
      if (relation.type === 'incompatibilidad') {
        incompatibleUnitPairKeys.add(unitPairKey);
      } else if (!incompatibleUnitPairKeys.has(unitPairKey)) {
        sameTableUnitPairKeys.add(unitPairKey);
      }
    }

    for (const pairKey of incompatibleUnitPairKeys) {
      sameTableUnitPairKeys.delete(pairKey);
    }

    return {
      sameTableUnitPairs: [...sameTableUnitPairKeys].map((pairKey) => {
        const [leftUnit, rightUnit] = pairKey.split(':').map(Number);
        return { leftUnit, rightUnit };
      }),
      incompatibleUnitPairs: [...incompatibleUnitPairKeys].map((pairKey) => {
        const [leftUnit, rightUnit] = pairKey.split(':').map(Number);
        return { leftUnit, rightUnit };
      }),
      affinityGuestPairs,
    };
  }

  private addExplicitHardRelationConstraints(
    model: CpModelInstance,
    assignVars: BoolVar[][],
    tableCount: number,
    hardRelationConstraints: ExplicitHardRelationConstraints,
  ): void {
    for (const pair of hardRelationConstraints.incompatibleUnitPairs) {
      for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
        model.addAtMostOne([
          assignVars[pair.leftUnit][tableIndex],
          assignVars[pair.rightUnit][tableIndex],
        ]);
      }
    }

    for (const pair of hardRelationConstraints.sameTableUnitPairs) {
      for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
        model.addEquality(
          assignVars[pair.leftUnit][tableIndex],
          assignVars[pair.rightUnit][tableIndex],
        );
      }
    }
  }

  private addIncompatibilityConstraints(
    model: CpModelInstance,
    units: PlacementUnit[],
    assignVars: BoolVar[][],
    guestById: Map<string, Guest>,
    tableCount: number,
  ): void {
    for (let left = 0; left < units.length; left += 1) {
      for (let right = left + 1; right < units.length; right += 1) {
        if (!this.unitsAreIncompatible(units[left], units[right], guestById)) {
          continue;
        }

        for (let tableIndex = 0; tableIndex < tableCount; tableIndex += 1) {
          model.addAtMostOne([
            assignVars[left][tableIndex],
            assignVars[right][tableIndex],
          ]);
        }
      }
    }
  }

  private unitsAreIncompatible(
    left: PlacementUnit,
    right: PlacementUnit,
    guestById: Map<string, Guest>,
  ): boolean {
    for (const leftId of left.guestIds) {
      const leftGuest = guestById.get(leftId);
      if (!leftGuest) {
        continue;
      }

      for (const rightId of right.guestIds) {
        const rightGuest = guestById.get(rightId);
        if (rightGuest && areIncompatible(leftGuest, rightGuest)) {
          return true;
        }
      }
    }

    return false;
  }

  private resolveExplicitAffinityPairsAtTable(
    tableGuests: Guest[],
    explicitAffinityRelations: ExplicitAffinityRelation[],
  ): CompanionGuestPair[] {
    const pairs: CompanionGuestPair[] = [];
    const seenPairs = new Set<string>();

    for (const relation of explicitAffinityRelations) {
      if (relation.type !== 'afinidad') {
        continue;
      }

      const leftGuest = this.resolveGuestByDisplayName(tableGuests, relation.guestA);
      const rightGuest = this.resolveGuestByDisplayName(tableGuests, relation.guestB);
      if (
        leftGuest === undefined ||
        rightGuest === undefined ||
        leftGuest.id === rightGuest.id
      ) {
        continue;
      }

      const pairKey = this.guestPairKey(leftGuest.id, rightGuest.id);
      if (seenPairs.has(pairKey)) {
        continue;
      }
      seenPairs.add(pairKey);
      pairs.push({ leftGuestId: leftGuest.id, rightGuestId: rightGuest.id });
    }

    return pairs;
  }

  private mergeUniqueGuestPairs(
    ...pairGroups: CompanionGuestPair[][]
  ): CompanionGuestPair[] {
    const merged: CompanionGuestPair[] = [];
    const seenPairs = new Set<string>();

    for (const pairGroup of pairGroups) {
      for (const pair of pairGroup) {
        const pairKey = this.guestPairKey(pair.leftGuestId, pair.rightGuestId);
        if (seenPairs.has(pairKey)) {
          continue;
        }
        seenPairs.add(pairKey);
        merged.push(pair);
      }
    }

    return merged;
  }

  private resolveGuestByDisplayName(
    guests: Guest[],
    displayName: string,
  ): Guest | undefined {
    const normalized = displayName.trim().toLowerCase();
    if (normalized.length === 0) {
      return undefined;
    }

    const exactMatch = guests.find(
      (guest) => guest.nombre.trim().toLowerCase() === normalized,
    );
    if (exactMatch !== undefined) {
      return exactMatch;
    }

    return guests.find((guest) => guestNamesMatch(guest.nombre, displayName));
  }

  private unitPairKey(leftUnit: number, rightUnit: number): string {
    return leftUnit < rightUnit
      ? `${leftUnit}:${rightUnit}`
      : `${rightUnit}:${leftUnit}`;
  }

  private guestPairKey(leftGuestId: string, rightGuestId: string): string {
    return leftGuestId < rightGuestId
      ? `${leftGuestId}:${rightGuestId}`
      : `${rightGuestId}:${leftGuestId}`;
  }

  private markUnassigned(
    unit: PlacementUnit,
    violations: HardRuleViolation[],
    unassigned: Set<string>,
  ): void {
    violations.push({
      code: 'NO_VALID_TABLE',
      message: 'No hay mesa valida que respete capacidad e incompatibilidades.',
      guestIds: unit.guestIds,
    });
    for (const guestId of unit.guestIds) {
      unassigned.add(guestId);
    }
  }

  private mapStatus(statusName: string): SolverStatus {
    switch (statusName) {
      case 'OPTIMAL':
        return 'OPTIMAL';
      case 'FEASIBLE':
        return 'FEASIBLE';
      case 'INFEASIBLE':
        return 'INFEASIBLE';
      default:
        return 'UNKNOWN';
    }
  }

  private buildResult(
    input: DistributionEngineInput,
    parts: {
      placements: GuestPlacement[];
      unassigned: Set<string>;
      violations: HardRuleViolation[];
      totalCapacity: number;
      solverStatus?: SolverStatus;
      objectiveScore?: number;
    },
  ): DistributionEngineResult {
    const stats: DistributionStats = {
      assignedCount: parts.placements.length,
      unassignedCount: input.guests.length - parts.placements.length,
      tableCount: input.tables.length,
      totalCapacity: parts.totalCapacity,
    };

    return {
      motorVersion: this.motorVersion,
      placements: parts.placements,
      unassignedGuestIds: [...parts.unassigned],
      hardRuleViolations: parts.violations,
      stats,
      solverStatus: parts.solverStatus,
      objectiveScore: parts.objectiveScore,
    };
  }
}

