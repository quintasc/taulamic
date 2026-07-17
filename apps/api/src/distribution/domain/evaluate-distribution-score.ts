import { buildSeatTopology } from '../../floor-plans/domain/build-seat-topology';
import type { ProximityKind } from '../../floor-plans/domain/seat-proximity';
import type { EventTable } from '../../events/domain/event-config';
import { buildCompanionGroups } from '../../guest-import/domain/companion-group.engine';
import type { Guest } from '../../guest-import/domain/guest';
import type { SoftRuleKind } from './distribution-engine.port';
import type {
  DistributionCompatibilityScore,
  GuestPlacement,
  TableAffinityScore,
} from './distribution.types';
import { areAffine } from './placement-units';
import {
  analyzeCategoryDistributions,
  CATEGORY_TABLE_ELASTIC_EXTRA_SEATS,
  effectiveCapacityForKMin,
  formatCategoryDistributionDetail,
  scoreCategoryGrouping,
} from './category-grouping';
import { PROXIMITY_WEIGHTS } from './seat-affinity';

const CRITERION_LABELS: Record<string, string> = {
  assignment: 'Invitados asignados',
  groupByCategory: 'Agrupar por categoría',
  tableAffinity: 'Afinidad por mesa',
  tablePacking: 'Ocupación de la mesa',
  keepFamiliesTogether: 'Mantener familias unidas',
  singlesTable: 'Mesa de solteros',
  seatProximity: 'Proximidad en la silla',
};

const MAX_PROXIMITY_WEIGHT = PROXIMITY_WEIGHTS.adyacente;
const TABLE_EMPTY_TOLERANCE_SEATS = CATEGORY_TABLE_ELASTIC_EXTRA_SEATS;

export type EvaluateDistributionScoreInput = {
  placements: GuestPlacement[];
  guests: Guest[];
  tables: EventTable[];
  /** Reglas blandas activas al calcular (orden de prioridad en pantalla). */
  softRules?: SoftRuleKind[];
  /**
   * Si se indica, evalúa compatibilidad solo con invitados y pares de esa mesa
   * (mismos criterios que el global, sin «invitados asignados»).
   */
  scopeTableId?: string;
};

/**
 * Evalua post-hoc la compatibilidad de una propuesta (puntos conseguidos /
 * puntos maximos posibles). Independiente del objectiveValue interno del solver.
 */
export function evaluateDistributionScore(
  input: EvaluateDistributionScoreInput,
): DistributionCompatibilityScore {
  const guestById = new Map(input.guests.map((guest) => [guest.id, guest]));
  const tableByGuest = new Map(
    input.placements.map((placement) => [placement.guestId, placement.tableId]),
  );
  const assignedCountByTableId = new Map<string, number>();
  for (const placement of input.placements) {
    assignedCountByTableId.set(
      placement.tableId,
      (assignedCountByTableId.get(placement.tableId) ?? 0) + 1,
    );
  }
  const seatByGuest = new Map(
    input.placements
      .filter((placement) => placement.seatIndex !== undefined)
      .map((placement) => [placement.guestId, placement.seatIndex as number]),
  );

  const scopeTableId = input.scopeTableId;
  const isScoped = scopeTableId !== undefined;

  const criteria: DistributionCompatibilityScore['criteria'] = [];

  if (!isScoped) {
    const assignment = evaluateAssignment(
      input.guests.length,
      input.placements.length,
    );
    criteria.push(assignment);
  }

  const activeRules = new Set(input.softRules ?? []);

  if (activeRules.has('groupByCategory')) {
    criteria.push(
      evaluateGroupByCategoryCriterion(
        input.guests,
        input.placements,
        input.tables,
        scopeTableId,
      ),
    );
  }

  const tableAffinity = evaluateTableAffinityCriterion(
    input.guests,
    guestById,
    tableByGuest,
    scopeTableId,
  );
  if (tableAffinity.maxPoints > 0) {
    criteria.push(tableAffinity);
  }
  if (isScoped) {
    const tablePacking = evaluateTablePackingCriterion(
      input.placements,
      input.tables,
      scopeTableId,
    );
    if (tablePacking.maxPoints > 0) {
      criteria.push(tablePacking);
    }
  }

  if (activeRules.has('singlesTable')) {
    const pairs = filterPairsToScope(
      collectSingleGuestPairs(input.guests),
      tableByGuest,
      scopeTableId,
    );
    if (pairs.length > 0) {
      criteria.push(evaluatePairsCriterion('singlesTable', pairs, tableByGuest));
    }
  }

  const proximityPairs = filterPairsToScope(
    collectProximityPairs(input.placements, input.guests, guestById),
    tableByGuest,
    scopeTableId,
    true,
  );
  if (proximityPairs.length > 0) {
    criteria.push(
      evaluateSeatProximity(
        proximityPairs,
        tableByGuest,
        seatByGuest,
        input.tables,
        assignedCountByTableId,
      ),
    );
  }

  const earnedPoints = criteria.reduce((sum, item) => sum + item.earnedPoints, 0);
  const maxPoints = criteria.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    globalPercent: percent(earnedPoints, maxPoints),
    earnedPoints,
    maxPoints,
    criteria,
  };
}

function evaluateAssignment(
  guestCount: number,
  assignedCount: number,
): DistributionCompatibilityScore['criteria'][number] {
  return buildCriterion('assignment', assignedCount, guestCount);
}

function evaluateGroupByCategoryCriterion(
  guests: Guest[],
  placements: GuestPlacement[],
  tables: EventTable[],
  scopeTableId?: string,
): DistributionCompatibilityScore['criteria'][number] {
  const maxTableCapacity = Math.max(
    ...tables.map((table) => table.capacity),
    0,
  );
  const kMinCapacity = effectiveCapacityForKMin(
    maxTableCapacity,
    CATEGORY_TABLE_ELASTIC_EXTRA_SEATS,
  );
  const scopedPlacements =
    scopeTableId === undefined
      ? placements
      : placements.filter(
          (placement) => placement.tableId === scopeTableId,
        );
  const scopedGuests =
    scopeTableId === undefined
      ? guests
      : guests.filter((guest) =>
          scopedPlacements.some((placement) => placement.guestId === guest.id),
        );

  const analyses = analyzeCategoryDistributions(
    scopedPlacements,
    scopedGuests,
    kMinCapacity,
  );
  const { earned, max } = scoreCategoryGrouping(analyses);

  if (max === 0) {
    return buildCriterion('groupByCategory', 0, 0);
  }

  return {
    ...buildCriterion('groupByCategory', earned, max),
    detail: formatCategoryDistributionDetail(analyses),
  };
}

/**
 * Afinidad a nivel mesa: parejas/acompañantes y afinidades declaradas entre
 * personas (± en pantalla Afinidades). Cada invitado con vínculo puntúa si
 * comparte mesa con todas las personas con las que está vinculado.
 */
function evaluateTableAffinityCriterion(
  guests: Guest[],
  guestById: Map<string, Guest>,
  tableByGuest: Map<string, string>,
  scopeTableId?: string,
): DistributionCompatibilityScore['criteria'][number] {
  const scopedGuests =
    scopeTableId === undefined
      ? guests
      : guests.filter((guest) => tableByGuest.get(guest.id) === scopeTableId);
  const scopedGuestById =
    scopeTableId === undefined
      ? guestById
      : new Map(scopedGuests.map((guest) => [guest.id, guest]));
  const eligible = scopedGuests.filter(
    (guest) =>
      collectBondedGuests(guest, scopedGuests, scopedGuestById).length > 0,
  );

  if (eligible.length === 0) {
    return buildCriterion('tableAffinity', 0, 0);
  }

  let earned = 0;
  for (const guest of eligible) {
    const tableId = tableByGuest.get(guest.id);
    if (tableId === undefined) {
      continue;
    }

    const bonded = collectBondedGuests(
      guest,
      scopedGuests,
      scopedGuestById,
    );
    const allBondsAtSameTable = bonded.every(
      (other) => tableByGuest.get(other.id) === tableId,
    );

    if (allBondsAtSameTable) {
      earned += 1;
    }
  }

  return {
    ...buildCriterion('tableAffinity', earned, eligible.length),
    detail: `${earned} de ${eligible.length} invitados con sus vínculos de afinidad en la misma mesa`,
  };
}

function evaluateTablePackingCriterion(
  placements: GuestPlacement[],
  tables: EventTable[],
  scopeTableId?: string,
): DistributionCompatibilityScore['criteria'][number] {
  if (scopeTableId === undefined) {
    return buildCriterion('tablePacking', 0, 0);
  }

  const scopedTable = tables.find((table) => table.id === scopeTableId);
  if (scopedTable === undefined) {
    return buildCriterion('tablePacking', 0, 0);
  }

  const assignedOnTable = placements.filter(
    (placement) => placement.tableId === scopeTableId,
  ).length;
  if (assignedOnTable <= 0) {
    return buildCriterion('tablePacking', 0, 0);
  }

  const allowedEmptySeats = TABLE_EMPTY_TOLERANCE_SEATS;
  const maxPoints = Math.max(0, scopedTable.capacity - allowedEmptySeats);
  if (maxPoints <= 0) {
    return buildCriterion('tablePacking', 0, 0);
  }

  const emptySeats = Math.max(0, scopedTable.capacity - assignedOnTable);
  const emptyBeyondTolerance = Math.max(0, emptySeats - allowedEmptySeats);
  const earnedPoints = Math.max(0, maxPoints - emptyBeyondTolerance);

  return {
    ...buildCriterion('tablePacking', earnedPoints, maxPoints),
    detail: `${assignedOnTable}/${scopedTable.capacity} plazas ocupadas (hasta ${allowedEmptySeats} vacías sin penalización)`,
  };
}

function collectBondedGuests(
  guest: Guest,
  guests: Guest[],
  guestById: Map<string, Guest>,
): Guest[] {
  const bondedById = new Map<string, Guest>();

  for (const group of buildCompanionGroups(guests)) {
    if (!group.keepTogether || !group.guestIds.includes(guest.id)) {
      continue;
    }

    for (const guestId of group.guestIds) {
      if (guestId === guest.id) {
        continue;
      }
      const other = guestById.get(guestId);
      if (other) {
        bondedById.set(other.id, other);
      }
    }
  }

  for (const other of guests) {
    if (other.id !== guest.id && areAffine(guest, other)) {
      bondedById.set(other.id, other);
    }
  }

  return [...bondedById.values()];
}

function evaluatePairsCriterion(
  key: string,
  pairs: Array<{ leftId: string; rightId: string }>,
  tableByGuest: Map<string, string>,
): DistributionCompatibilityScore['criteria'][number] {
  let earned = 0;
  for (const pair of pairs) {
    const leftTable = tableByGuest.get(pair.leftId);
    const rightTable = tableByGuest.get(pair.rightId);
    if (leftTable !== undefined && leftTable === rightTable) {
      earned += 1;
    }
  }
  return buildCriterion(key, earned, pairs.length);
}

function evaluateSeatProximity(
  pairs: Array<{ leftId: string; rightId: string; tableId: string }>,
  tableByGuest: Map<string, string>,
  seatByGuest: Map<string, number>,
  tables: EventTable[],
  assignedCountByTableId: ReadonlyMap<string, number>,
): DistributionCompatibilityScore['criteria'][number] {
  const tableById = new Map(tables.map((table) => [table.id, table]));
  let earned = 0;
  let max = 0;

  for (const pair of pairs) {
    const leftTable = tableByGuest.get(pair.leftId);
    const rightTable = tableByGuest.get(pair.rightId);
    if (leftTable === undefined || leftTable !== rightTable) {
      continue;
    }

    max += MAX_PROXIMITY_WEIGHT;
    const leftSeat = seatByGuest.get(pair.leftId);
    const rightSeat = seatByGuest.get(pair.rightId);

    if (leftSeat === undefined || rightSeat === undefined) {
      // Misma mesa pero sin asiento resuelto: credito parcial.
      earned += 1;
      continue;
    }

    const table = tableById.get(leftTable);
    if (!table) {
      earned += 1;
      continue;
    }

    try {
      const effectiveCapacity = Math.max(
        table.capacity,
        assignedCountByTableId.get(leftTable) ?? 0,
      );
      const topology = buildSeatTopology(table.shape, effectiveCapacity);
      earned += proximityScoreForSeats(
        leftSeat,
        rightSeat,
        topology.proximities,
      );
    } catch {
      earned += 1;
    }
  }

  return buildCriterion('seatProximity', earned, max);
}

function proximityScoreForSeats(
  leftSeat: number,
  rightSeat: number,
  proximities: Array<{ from: number; to: number; kind: ProximityKind }>,
): number {
  let best = 0;
  for (const proximity of proximities) {
    const matches =
      (proximity.from === leftSeat && proximity.to === rightSeat) ||
      (proximity.from === rightSeat && proximity.to === leftSeat);
    if (matches) {
      best = Math.max(best, PROXIMITY_WEIGHTS[proximity.kind]);
    }
  }
  return best;
}

function collectSingleGuestPairs(
  guests: Guest[],
): Array<{ leftId: string; rightId: string }> {
  const singles = guests.filter((guest) => isSingleGuest(guest));
  const pairs: Array<{ leftId: string; rightId: string }> = [];
  for (let left = 0; left < singles.length; left += 1) {
    for (let right = left + 1; right < singles.length; right += 1) {
      pairs.push({ leftId: singles[left].id, rightId: singles[right].id });
    }
  }
  return pairs;
}

function isSingleGuest(guest: Guest): boolean {
  const hasCompanion = guest.acompananteKey.trim() !== '';
  const hasAffinity = guest.restrictions.some(
    (restriction) => restriction.kind === 'afinidad',
  );
  return !hasCompanion && !hasAffinity;
}

function collectProximityPairs(
  placements: GuestPlacement[],
  guests: Guest[],
  guestById: Map<string, Guest>,
): Array<{ leftId: string; rightId: string; tableId: string }> {
  const pairs: Array<{ leftId: string; rightId: string; tableId: string }> = [];
  const seen = new Set<string>();

  const guestsByTable = new Map<string, string[]>();
  for (const placement of placements) {
    const list = guestsByTable.get(placement.tableId) ?? [];
    list.push(placement.guestId);
    guestsByTable.set(placement.tableId, list);
  }

  for (const [tableId, guestIds] of guestsByTable) {
    const tableGuests = guestIds
      .map((guestId) => guestById.get(guestId))
      .filter((guest): guest is Guest => guest !== undefined);

    for (let left = 0; left < tableGuests.length; left += 1) {
      for (let right = left + 1; right < tableGuests.length; right += 1) {
        const leftGuest = tableGuests[left];
        const rightGuest = tableGuests[right];
        if (!pairHasProximitySignal(leftGuest, rightGuest)) {
          continue;
        }
        const key = pairKey(leftGuest.id, rightGuest.id);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        pairs.push({
          leftId: leftGuest.id,
          rightId: rightGuest.id,
          tableId,
        });
      }
    }
  }

  return pairs;
}

function pairHasProximitySignal(left: Guest, right: Guest): boolean {
  if (areAffine(left, right)) {
    return true;
  }
  if (left.acompananteKey.trim() !== '' && left.acompananteKey === right.acompananteKey) {
    const groups = buildCompanionGroups([left, right]);
    return groups.some((group) => group.keepTogether);
  }
  return false;
}

function pairKey(leftId: string, rightId: string): string {
  return leftId < rightId ? `${leftId}:${rightId}` : `${rightId}:${leftId}`;
}

function filterPairsToScope<T extends { leftId: string; rightId: string }>(
  pairs: T[],
  tableByGuest: Map<string, string>,
  scopeTableId?: string,
  hasTableId = false,
): T[] {
  if (!scopeTableId) {
    return pairs;
  }

  return pairs.filter((pair) => {
    if (hasTableId && 'tableId' in pair) {
      return (pair as T & { tableId: string }).tableId === scopeTableId;
    }
    return (
      tableByGuest.get(pair.leftId) === scopeTableId &&
      tableByGuest.get(pair.rightId) === scopeTableId
    );
  });
}

function buildCriterion(
  key: string,
  earnedPoints: number,
  maxPoints: number,
): DistributionCompatibilityScore['criteria'][number] {
  return {
    key,
    label: CRITERION_LABELS[key] ?? key,
    earnedPoints,
    maxPoints,
    percent: percent(earnedPoints, maxPoints),
  };
}

function percent(earned: number, max: number): number {
  if (max <= 0) {
    return 100;
  }
  return Math.round((earned / max) * 1000) / 10;
}

/**
 * Compatibilidad por mesa: replica el cálculo global acotado a la mesa e
 * incorpora ocupación local para evitar 100% engañoso en mesas casi vacías.
 */
export function evaluateTableAffinityByTable(
  placements: GuestPlacement[],
  guests: Guest[],
  tables: EventTable[],
  softRules?: SoftRuleKind[],
): TableAffinityScore[] {
  return tables.map((table) => {
    const score = evaluateDistributionScore({
      placements,
      guests,
      tables: [table],
      softRules,
      scopeTableId: table.id,
    });

    const detail =
      score.maxPoints === 0
        ? 'Sin criterios de compatibilidad aplicables en esta mesa'
        : score.criteria
            .filter((item) => item.maxPoints > 0)
            .map((item) =>
              item.detail
                ? `${item.label}: ${item.percent}% (${item.detail})`
                : `${item.label}: ${item.percent}%`,
            )
            .join(' · ');

    return {
      tableId: table.id,
      earnedPoints: score.earnedPoints,
      maxPoints: score.maxPoints,
      percent: score.globalPercent,
      detail,
    };
  });
}

export function attachCompatibilityScore<
  T extends {
    placements: GuestPlacement[];
    appliedSoftRules?: SoftRuleKind[];
  },
>(
  proposal: T,
  guests: Guest[],
  tables: EventTable[],
  softRules?: SoftRuleKind[],
): T & {
  compatibilityScore: DistributionCompatibilityScore;
  tableAffinityScores: TableAffinityScore[];
  appliedSoftRules?: SoftRuleKind[];
} {
  const rules = softRules ?? proposal.appliedSoftRules ?? [];
  const compatibilityScore = evaluateDistributionScore({
    placements: proposal.placements,
    guests,
    tables,
    softRules: rules,
  });
  const tableAffinityScores = evaluateTableAffinityByTable(
    proposal.placements,
    guests,
    tables,
    rules,
  );
  return {
    ...proposal,
    appliedSoftRules: rules,
    compatibilityScore,
    tableAffinityScores,
  };
}
