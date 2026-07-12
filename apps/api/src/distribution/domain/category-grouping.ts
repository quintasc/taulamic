import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal, GuestPlacement } from './distribution.types';
import type { PlacementUnit } from './placement-units';
import { sharesCategory } from './placement-units';

/** Plan de reparto proporcional por categoría (ADR-024). */
export type CategoryGroupingPlan = {
  categoryId: string;
  guestCount: number;
  kMin: number;
  /** Por índice de unidad: invitados de esta categoría en la unidad. */
  unitContributions: number[];
};

export type CategoryDistributionAnalysis = {
  categoryId: string;
  guestCount: number;
  kUsed: number;
  kMin: number;
  countsByTable: Map<string, number>;
  spread: number;
  orphanCount: number;
  relaxed: boolean;
};

export function computeKMin(
  guestCount: number,
  maxTableCapacity: number,
): number {
  if (guestCount <= 0 || maxTableCapacity <= 0) {
    return 0;
  }
  return Math.ceil(guestCount / maxTableCapacity);
}

/** Límites L2 (ADR-024): cada mesa usada recibe entre floor(N/k) y ceil(N/k) miembros. */
export function computeBalancedCountBounds(
  guestCount: number,
  tablesUsed: number,
): { min: number; max: number } {
  if (tablesUsed <= 0 || guestCount <= 0) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.floor(guestCount / tablesUsed),
    max: Math.ceil(guestCount / tablesUsed),
  };
}

/** Dominio entero para L3: 0 o ≥ 2 (excluye huérfanos locales). */
export function categoryCountDomainExcludingOrphans(
  maxCapacity: number,
): number[] {
  const values = [0];
  for (let value = 2; value <= maxCapacity; value += 1) {
    values.push(value);
  }
  return values;
}

export function isBalancedSplit(counts: number[]): boolean {
  const used = counts.filter((count) => count > 0);
  if (used.length === 0) {
    return true;
  }
  return Math.max(...used) - Math.min(...used) <= 1;
}

export function buildCategoryGroupingPlans(
  units: PlacementUnit[],
  guestById: Map<string, Guest>,
  maxTableCapacity: number,
): CategoryGroupingPlan[] {
  const membersByUnit = units.map((unit) =>
    unit.guestIds
      .map((guestId) => guestById.get(guestId))
      .filter((guest): guest is Guest => guest !== undefined),
  );

  const guestCountByCategory = new Map<string, number>();
  for (const members of membersByUnit) {
    for (const guest of members) {
      for (const categoryId of guest.categoriaIds) {
        guestCountByCategory.set(
          categoryId,
          (guestCountByCategory.get(categoryId) ?? 0) + 1,
        );
      }
    }
  }

  const plans: CategoryGroupingPlan[] = [];
  for (const [categoryId, guestCount] of guestCountByCategory) {
    if (guestCount < 2) {
      continue;
    }

    const unitContributions = membersByUnit.map((members) =>
      members.reduce(
        (sum, guest) =>
          sum + (guest.categoriaIds.includes(categoryId) ? 1 : 0),
        0,
      ),
    );

    if (unitContributions.every((count) => count === 0)) {
      continue;
    }

    plans.push({
      categoryId,
      guestCount,
      kMin: computeKMin(guestCount, maxTableCapacity),
      unitContributions,
    });
  }

  return plans;
}

export function analyzeCategoryDistributions(
  placements: GuestPlacement[],
  guests: Guest[],
  maxTableCapacity: number,
): CategoryDistributionAnalysis[] {
  const guestById = new Map(guests.map((guest) => [guest.id, guest]));
  const guestsByTable = new Map<string, string[]>();

  for (const placement of placements) {
    const list = guestsByTable.get(placement.tableId) ?? [];
    list.push(placement.guestId);
    guestsByTable.set(placement.tableId, list);
  }

  const categoryIds = new Set<string>();
  for (const guest of guests) {
    for (const categoryId of guest.categoriaIds) {
      categoryIds.add(categoryId);
    }
  }

  const analyses: CategoryDistributionAnalysis[] = [];

  for (const categoryId of categoryIds) {
    const categoryGuests = guests.filter((guest) =>
      guest.categoriaIds.includes(categoryId),
    );
    if (categoryGuests.length < 2) {
      continue;
    }

    const countsByTable = new Map<string, number>();
    for (const guest of categoryGuests) {
      const tableId = placements.find(
        (placement) => placement.guestId === guest.id,
      )?.tableId;
      if (tableId === undefined) {
        continue;
      }
      countsByTable.set(tableId, (countsByTable.get(tableId) ?? 0) + 1);
    }

    const counts = [...countsByTable.values()];
    const kUsed = counts.length;
    const kMin = computeKMin(categoryGuests.length, maxTableCapacity);
    let orphanCount = 0;

    for (const guest of categoryGuests) {
      const tableId = placements.find(
        (placement) => placement.guestId === guest.id,
      )?.tableId;
      if (tableId === undefined) {
        continue;
      }

      const tablemateIds = guestsByTable.get(tableId) ?? [];
      const hasMate = tablemateIds.some((otherId) => {
        if (otherId === guest.id) {
          return false;
        }
        const other = guestById.get(otherId);
        return (
          other !== undefined && other.categoriaIds.includes(categoryId)
        );
      });

      if (!hasMate) {
        orphanCount += 1;
      }
    }

    analyses.push({
      categoryId,
      guestCount: categoryGuests.length,
      kUsed,
      kMin,
      countsByTable,
      spread: counts.length > 0 ? Math.max(...counts) - Math.min(...counts) : 0,
      orphanCount,
      relaxed: kUsed > kMin,
    });
  }

  return analyses;
}

export function formatCategoryDistributionDetail(
  analyses: CategoryDistributionAnalysis[],
): string {
  if (analyses.length === 0) {
    return 'Sin categorías con reparto evaluable';
  }

  return analyses
    .map((analysis) => {
      const counts = [...analysis.countsByTable.values()].sort((a, b) => b - a);
      const reparto = counts.length > 0 ? counts.join('+') : '—';
      const mesasLabel = analysis.relaxed
        ? `${analysis.kUsed} mesas (mín. ${analysis.kMin}, relajado)`
        : `${analysis.kUsed} mesas (mín. ${analysis.kMin})`;
      const balanceLabel =
        analysis.spread <= 1 ? 'equilibrado' : 'reparto desequilibrado';
      const orphanLabel =
        analysis.orphanCount === 0
          ? '0 huérfanos'
          : `${analysis.orphanCount} huérfano${analysis.orphanCount === 1 ? '' : 's'}`;

      return `${analysis.categoryId}: ${mesasLabel} · ${reparto} · ${balanceLabel} · ${orphanLabel}`;
    })
    .join(' · ');
}

export function scoreCategoryGrouping(
  analyses: CategoryDistributionAnalysis[],
): { earned: number; max: number } {
  if (analyses.length === 0) {
    return { earned: 0, max: 0 };
  }

  let earned = 0;
  const max = analyses.length * 3;

  for (const analysis of analyses) {
    if (analysis.kUsed === analysis.kMin) {
      earned += 1;
    }
    if (analysis.spread <= 1) {
      earned += 1;
    }
    if (analysis.orphanCount === 0) {
      earned += 1;
    }
  }

  return { earned, max };
}

/** Penalización por mesas con varias categorías agrupables (2+ moderado, 3+ grave). */
export function tableCategoryMixingPenalty(
  placements: GuestPlacement[],
  guests: Guest[],
  significantCategoryIds: ReadonlySet<string>,
): number {
  if (significantCategoryIds.size < 2) {
    return 0;
  }

  const guestById = new Map(guests.map((guest) => [guest.id, guest]));
  const categoriesByTable = new Map<string, Set<string>>();

  for (const placement of placements) {
    const guest = guestById.get(placement.guestId);
    if (guest === undefined) {
      continue;
    }

    for (const categoryId of guest.categoriaIds) {
      if (!significantCategoryIds.has(categoryId)) {
        continue;
      }

      const tableCategories =
        categoriesByTable.get(placement.tableId) ?? new Set<string>();
      tableCategories.add(categoryId);
      categoriesByTable.set(placement.tableId, tableCategories);
    }
  }

  let penalty = 0;
  for (const tableCategories of categoriesByTable.values()) {
    const extra = tableCategories.size - 1;
    if (extra <= 0) {
      continue;
    }
    // 2 categorías → 50k; 3 → 200k; 4 → 450k (evita M6/M7/M8 fragmentadas).
    penalty += extra * extra * 50_000;
  }

  return penalty;
}

/** Penalización lexicográfica aproximada (menor es mejor). */
export function categoryGroupingPenalty(
  analyses: CategoryDistributionAnalysis[],
  mixingPenalty = 0,
): number {
  return (
    mixingPenalty +
    analyses.reduce(
      (sum, analysis) =>
        sum +
        Math.max(0, analysis.kUsed - analysis.kMin) * 50_000 +
        Math.max(0, analysis.spread - 1) * 100 +
        analysis.orphanCount * 1_000,
      0,
    )
  );
}

/**
 * Clave lexicográfica ADR-024 (menor vector = mejor solución).
 * Prioriza: más categorías en k_min → menos exceso de mesas → huérfanos → spread → mezcla.
 */
export function categoryGroupingLexScore(
  analyses: CategoryDistributionAnalysis[],
  mixingPenalty = 0,
): readonly [number, number, number, number, number] {
  const categoriesAtKMin = analyses.filter(
    (analysis) => analysis.kUsed === analysis.kMin,
  ).length;

  return [
    -categoriesAtKMin,
    analyses.reduce(
      (sum, analysis) => sum + Math.max(0, analysis.kUsed - analysis.kMin),
      0,
    ),
    analyses.reduce((sum, analysis) => sum + analysis.orphanCount, 0),
    analyses.reduce(
      (sum, analysis) => sum + Math.max(0, analysis.spread - 1),
      0,
    ),
    mixingPenalty,
  ];
}

export function isBetterCategoryGroupingLexScore(
  candidate: readonly number[],
  incumbent: readonly number[],
): boolean {
  for (let index = 0; index < candidate.length; index += 1) {
    if (candidate[index] !== incumbent[index]) {
      return candidate[index] < incumbent[index];
    }
  }
  return false;
}
export function categoriesNeedingGroupingRefinement(
  analyses: CategoryDistributionAnalysis[],
  mixingPenalty: number,
): CategoryDistributionAnalysis[] {
  const fragmented = analyses.filter(
    (analysis) =>
      analysis.guestCount >= 2 &&
      (analysis.kUsed > analysis.kMin ||
        analysis.spread > 1 ||
        analysis.orphanCount > 0),
  );

  if (mixingPenalty > 0 || fragmented.length > 0) {
    const seen = new Set<string>();
    const ordered = [
      ...fragmented.sort(
        (left, right) =>
          right.kUsed -
          right.kMin -
          (left.kUsed - left.kMin) ||
          right.guestCount - left.guestCount,
      ),
      ...[...analyses]
        .filter((analysis) => analysis.guestCount >= 2)
        .sort((left, right) => right.guestCount - left.guestCount),
    ];

    return ordered.filter((analysis) => {
      if (seen.has(analysis.categoryId)) {
        return false;
      }
      seen.add(analysis.categoryId);
      return true;
    });
  }

  return fragmented.sort(
    (left, right) =>
      left.kMin - right.kMin || right.guestCount - left.guestCount,
  );
}

/** Orden para bloqueo secuencial ADR-024 L1 duro (categorías grandes primero). */
export function orderCategoryPlansForHardL1Locking(
  plans: CategoryGroupingPlan[],
): CategoryGroupingPlan[] {
  return [...plans].sort(
    (left, right) =>
      right.guestCount - left.guestCount ||
      right.kMin - left.kMin ||
      left.categoryId.localeCompare(right.categoryId),
  );
}

export function hasCategoryMateAtTable(
  guest: Guest,
  tableId: string,
  proposal: DistributionProposal,
  guests: Guest[],
): boolean {
  const guestById = new Map(guests.map((entry) => [entry.id, entry]));
  const tablemateIds = proposal.placements
    .filter((placement) => placement.tableId === tableId)
    .map((placement) => placement.guestId);

  return tablemateIds.some((otherId) => {
    if (otherId === guest.id) {
      return false;
    }
    const other = guestById.get(otherId);
    return other !== undefined && sharesCategory(guest, other);
  });
}

export function hasFeasibleTableWithCategoryMate(
  proposal: DistributionProposal,
  guest: Guest,
  guests: Guest[],
  tables: EventTable[],
  excludeTableId: string,
): boolean {
  const guestById = new Map(guests.map((entry) => [entry.id, entry]));

  for (const table of tables) {
    if (table.id === excludeTableId) {
      continue;
    }

    const assignedOnTable = proposal.placements.filter(
      (placement) => placement.tableId === table.id,
    ).length;

    if (assignedOnTable >= table.capacity) {
      continue;
    }

    const tablemates = proposal.placements
      .filter((placement) => placement.tableId === table.id)
      .map((placement) => guestById.get(placement.guestId))
      .filter((entry): entry is Guest => entry !== undefined);

    const hasMate = tablemates.some((tablemate) =>
      sharesCategory(guest, tablemate),
    );
    if (!hasMate) {
      continue;
    }

    const incompatible = tablemates.some((tablemate) =>
      areIncompatible(guest, tablemate),
    );
    if (incompatible) {
      continue;
    }

    return true;
  }

  return false;
}

export function wouldCreateAvoidableCategoryOrphan(
  proposal: DistributionProposal,
  guest: Guest,
  targetTableId: string,
  guests: Guest[],
  tables: EventTable[],
): boolean {
  if (guest.categoriaIds.length === 0) {
    return false;
  }

  if (hasCategoryMateAtTable(guest, targetTableId, proposal, guests)) {
    return false;
  }

  const globalCounts = new Map<string, number>();
  for (const entry of guests) {
    for (const categoryId of entry.categoriaIds) {
      globalCounts.set(categoryId, (globalCounts.get(categoryId) ?? 0) + 1);
    }
  }

  const relevantCategories = guest.categoriaIds.filter(
    (categoryId) => (globalCounts.get(categoryId) ?? 0) >= 2,
  );

  if (relevantCategories.length === 0) {
    return false;
  }

  return hasFeasibleTableWithCategoryMate(
    proposal,
    guest,
    guests,
    tables,
    targetTableId,
  );
}

function areIncompatible(left: Guest, right: Guest): boolean {
  return (
    hasIncompatibilityToward(left, right.nombre) ||
    hasIncompatibilityToward(right, left.nombre)
  );
}

function hasIncompatibilityToward(from: Guest, targetName: string): boolean {
  return from.restrictions.some(
    (restriction) =>
      restriction.kind === 'incompatibilidad' &&
      restriction.targetHint !== null &&
      namesMatch(targetName, restriction.targetHint),
  );
}

function namesMatch(guestName: string, targetHint: string): boolean {
  const normalizedGuest = guestName.trim().toLowerCase();
  const normalizedTarget = targetHint.trim().toLowerCase();

  return (
    normalizedGuest.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedGuest)
  );
}
