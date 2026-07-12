import type { ProximityKind } from '../../floor-plans/domain/seat-proximity';
import type { Guest } from '../../guest-import/domain/guest';
import { buildCompanionGroups } from '../../guest-import/domain/companion-group.engine';
import type { ExplicitAffinityRelation } from './distribution-engine.port';
import { guestNamesMatch } from './guest-name-match';
import { partitionExplicitAffinityRelations } from './companion-affinity-partition';
import { areAffine, sharesCategory } from './placement-units';
/**
 * Fase 2 del ADR-023 (asiento intra-mesa): pesos de proximidad por tipo de
 * topologia, aplicados sobre invitados que YA comparten mesa (regla dura
 * de mesa resuelta en Fase 1). No hay prioridad dinamica aqui (a diferencia
 * de la HU-17 a nivel mesa): es un refinamiento fino sobre una asignacion
 * de mesa ya fijada, por lo que basta con una jerarquia fija de cercania.
 */
export const PROXIMITY_WEIGHTS: Record<ProximityKind, number> = {
  adyacente: 3,
  enfrente: 2,
  mismo_lateral: 1,
};

const COMPANION_PAIR_WEIGHT = 3;
const AFFINITY_PAIR_WEIGHT = 2;
const CATEGORY_PAIR_WEIGHT = 1;

export type GuestPairWeight = {
  leftGuestId: string;
  rightGuestId: string;
  weight: number;
};

/**
 * Peso de "conviene sentarlos cerca" por pareja de invitados de una misma
 * mesa. Solo devuelve pares con peso > 0 (matriz dispersa).
 */
export function buildSeatPairWeights(
  tableGuests: Guest[],
  explicitRelations: ExplicitAffinityRelation[] = [],
  eventGuestsForPartition?: Guest[],
): GuestPairWeight[] {
  const uiExplicitRelations =
    eventGuestsForPartition === undefined
      ? explicitRelations
      : partitionExplicitAffinityRelations(
          eventGuestsForPartition,
          explicitRelations,
        ).uiExplicitAffinityRelations;

  const companionPairKeys = buildCompanionPairKeys(tableGuests);
  const weights: GuestPairWeight[] = [];
  const seenPairs = new Set<string>();

  const addPair = (leftGuestId: string, rightGuestId: string, weight: number) => {
    const key = pairKey(leftGuestId, rightGuestId);
    if (seenPairs.has(key)) {
      const existing = weights.find(
        (entry) =>
          pairKey(entry.leftGuestId, entry.rightGuestId) === key,
      );
      if (existing) {
        existing.weight += weight;
      }
      return;
    }
    seenPairs.add(key);
    weights.push({ leftGuestId, rightGuestId, weight });
  };

  for (let left = 0; left < tableGuests.length; left += 1) {
    for (let right = left + 1; right < tableGuests.length; right += 1) {
      const guestA = tableGuests[left];
      const guestB = tableGuests[right];
      let weight = 0;

      if (companionPairKeys.has(pairKey(guestA.id, guestB.id))) {
        weight += COMPANION_PAIR_WEIGHT;
      }
      if (areAffine(guestA, guestB)) {
        weight += AFFINITY_PAIR_WEIGHT;
      }
      if (sharesCategory(guestA, guestB)) {
        weight += CATEGORY_PAIR_WEIGHT;
      }

      if (weight > 0) {
        addPair(guestA.id, guestB.id, weight);
      }
    }
  }

  for (const relation of uiExplicitRelations) {
    if (relation.type !== 'afinidad') {
      continue;
    }

    const leftGuest = tableGuests.find((guest) =>
      guestNamesMatch(guest.nombre, relation.guestA),
    );
    const rightGuest = tableGuests.find((guest) =>
      guestNamesMatch(guest.nombre, relation.guestB),
    );
    if (!leftGuest || !rightGuest || leftGuest.id === rightGuest.id) {
      continue;
    }

    const key = pairKey(leftGuest.id, rightGuest.id);
    if (seenPairs.has(key)) {
      const existing = weights.find(
        (entry) => pairKey(entry.leftGuestId, entry.rightGuestId) === key,
      );
      if (existing && !areAffine(leftGuest, rightGuest)) {
        existing.weight += AFFINITY_PAIR_WEIGHT;
      }
      continue;
    }

    addPair(leftGuest.id, rightGuest.id, AFFINITY_PAIR_WEIGHT);
  }

  return weights;
}

function buildCompanionPairKeys(tableGuests: Guest[]): Set<string> {
  const groups = buildCompanionGroups(tableGuests);
  const keys = new Set<string>();

  for (const group of groups) {
    if (!group.keepTogether) {
      continue;
    }
    for (let left = 0; left < group.guestIds.length; left += 1) {
      for (let right = left + 1; right < group.guestIds.length; right += 1) {
        keys.add(pairKey(group.guestIds[left], group.guestIds[right]));
      }
    }
  }

  return keys;
}

function pairKey(leftId: string, rightId: string): string {
  return leftId < rightId ? `${leftId}:${rightId}` : `${rightId}:${leftId}`;
}
