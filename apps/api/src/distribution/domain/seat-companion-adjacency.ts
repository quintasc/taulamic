import type { TableSeatTopology } from '../../floor-plans/domain/seat-proximity';
import type { Guest } from '../../guest-import/domain/guest';
import { buildCompanionGroups } from '../../guest-import/domain/companion-group.engine';

export type CompanionGuestPair = {
  leftGuestId: string;
  rightGuestId: string;
};

/** Parejas keepTogether (Excel / D3) que deben sentarse en sillas adyacentes. */
export function buildCompanionGuestPairs(tableGuests: Guest[]): CompanionGuestPair[] {
  const groups = buildCompanionGroups(tableGuests);
  const pairs: CompanionGuestPair[] = [];

  for (const group of groups) {
    if (!group.keepTogether) {
      continue;
    }

    for (let left = 0; left < group.guestIds.length; left += 1) {
      for (let right = left + 1; right < group.guestIds.length; right += 1) {
        pairs.push({
          leftGuestId: group.guestIds[left],
          rightGuestId: group.guestIds[right],
        });
      }
    }
  }

  return pairs;
}

export function adjacentSeatIndexPairs(
  topology: TableSeatTopology,
): Array<{ from: number; to: number }> {
  const pairs: Array<{ from: number; to: number }> = [];
  const seen = new Set<string>();

  for (const proximity of topology.proximities) {
    if (proximity.kind !== 'adyacente') {
      continue;
    }

    const key =
      proximity.from < proximity.to
        ? `${proximity.from}:${proximity.to}`
        : `${proximity.to}:${proximity.from}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    pairs.push({ from: proximity.from, to: proximity.to });
  }

  return pairs;
}

type CpSatModule = typeof import('or-tools-wasm/cp-sat');

type CpModelInstance = InstanceType<CpSatModule['CpModel']>;

type BoolVar = ReturnType<CpModelInstance['newBoolVar']>;

/**
 * Restricción dura: cada pareja keepTogether debe ocupar un par de sillas adyacentes.
 */
export function addCompanionAdjacentSeatConstraints(
  model: CpModelInstance,
  seatVars: BoolVar[][],
  guestIndexById: Map<string, number>,
  topology: TableSeatTopology,
  companionPairs: CompanionGuestPair[],
): void {
  const adjacentPairs = adjacentSeatIndexPairs(topology);

  for (const pair of companionPairs) {
    const leftIndex = guestIndexById.get(pair.leftGuestId);
    const rightIndex = guestIndexById.get(pair.rightGuestId);
    if (leftIndex === undefined || rightIndex === undefined) {
      continue;
    }

    const adjacentOptions: BoolVar[] = [];

    for (const adjacent of adjacentPairs) {
      const forward = model.newBoolVar(
        `comp_adj_${leftIndex}_${rightIndex}_${adjacent.from}_${adjacent.to}`,
      );
      model.addImplication(forward, seatVars[leftIndex][adjacent.from]);
      model.addImplication(forward, seatVars[rightIndex][adjacent.to]);
      adjacentOptions.push(forward);

      const backward = model.newBoolVar(
        `comp_adj_${leftIndex}_${rightIndex}_${adjacent.to}_${adjacent.from}`,
      );
      model.addImplication(backward, seatVars[leftIndex][adjacent.to]);
      model.addImplication(backward, seatVars[rightIndex][adjacent.from]);
      adjacentOptions.push(backward);
    }

    if (adjacentOptions.length > 0) {
      model.addBoolOr(adjacentOptions);
    }
  }
}
