import { areChairsAdjacent } from '@/lib/seat-topology-client';
import type { AffinityRelationInput, CompanionGroupInput } from '@/lib/table-affinity-score';

export type SeatOccupant = {
  guestId: string;
  guestName: string;
  categoryName?: string;
};

export type SeatRelation = {
  chairA: string;
  chairB: string;
  type: 'afinidad' | 'incompatibilidad';
  adjacent: boolean;
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function namesMatch(left: string, right: string): boolean {
  const a = normalizeName(left);
  const b = normalizeName(right);
  return a.includes(b) || b.includes(a);
}

function relationKey(
  chairA: string,
  chairB: string,
  type: SeatRelation['type'],
): string {
  const chairs = [chairA, chairB].sort();
  return `${chairs[0]}:${chairs[1]}:${type}`;
}

function findGuestIdByName(
  guestName: string,
  guestsById: Map<string, { nombre: string }>,
): string | null {
  for (const [guestId, guest] of guestsById) {
    if (namesMatch(guest.nombre, guestName)) {
      return guestId;
    }
  }
  return null;
}

function findChairForGuest(
  guestId: string,
  occupiedChairs: Record<string, SeatOccupant | undefined>,
): string | null {
  for (const [chairId, occupant] of Object.entries(occupiedChairs)) {
    if (occupant?.guestId === guestId) {
      return chairId;
    }
  }
  return null;
}

export function computeSeatPosition(
  index: number,
  capacity: number,
  radiusPercent: number,
): { x: number; y: number } {
  const angle = (index * 2 * Math.PI) / capacity - Math.PI / 2;
  return {
    x: 50 + radiusPercent * Math.cos(angle),
    y: 50 + radiusPercent * Math.sin(angle),
  };
}

export function edgePointTowards(
  from: { x: number; y: number },
  to: { x: number; y: number },
  inset: number,
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return from;
  }
  return {
    x: from.x + (dx / length) * inset,
    y: from.y + (dy / length) * inset,
  };
}

export function computeTableSeatRelations(input: {
  occupiedChairs: Record<string, SeatOccupant | undefined>;
  guestsById: Map<string, { nombre: string }>;
  affinityRelations: AffinityRelationInput[];
  companionGroups: CompanionGroupInput[];
  tableShape: string;
  capacity: number;
}): SeatRelation[] {
  const relations: SeatRelation[] = [];
  const seen = new Set<string>();

  function addRelation(
    chairA: string | null,
    chairB: string | null,
    type: SeatRelation['type'],
  ) {
    if (!chairA || !chairB || chairA === chairB) {
      return;
    }
    const key = relationKey(chairA, chairB, type);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    relations.push({
      chairA,
      chairB,
      type,
      adjacent: areChairsAdjacent(
        chairA,
        chairB,
        input.tableShape,
        input.capacity,
      ),
    });
  }

  for (const relation of input.affinityRelations) {
    const guestAId = findGuestIdByName(relation.guestA, input.guestsById);
    const guestBId = findGuestIdByName(relation.guestB, input.guestsById);
    if (!guestAId || !guestBId) {
      continue;
    }
    addRelation(
      findChairForGuest(guestAId, input.occupiedChairs),
      findChairForGuest(guestBId, input.occupiedChairs),
      relation.type,
    );
  }

  for (const group of input.companionGroups) {
    if (!group.keepTogether || group.guestIds.length < 2) {
      continue;
    }
    for (let left = 0; left < group.guestIds.length; left += 1) {
      for (let right = left + 1; right < group.guestIds.length; right += 1) {
        addRelation(
          findChairForGuest(group.guestIds[left], input.occupiedChairs),
          findChairForGuest(group.guestIds[right], input.occupiedChairs),
          'afinidad',
        );
      }
    }
  }

  return relations;
}
