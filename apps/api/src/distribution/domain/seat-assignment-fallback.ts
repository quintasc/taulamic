import type { GuestPlacement } from './distribution.types';
import type { CompanionGuestPair } from './seat-companion-adjacency';

function placeGuestAtSeat(
  tablePlacements: GuestPlacement[],
  guestId: string,
  seatIndex: number,
  usedSeats: Set<number>,
): boolean {
  if (usedSeats.has(seatIndex)) {
    return false;
  }

  const placement = tablePlacements.find((entry) => entry.guestId === guestId);
  if (placement === undefined) {
    return false;
  }

  placement.seatIndex = seatIndex;
  placement.seatLabel = `S${seatIndex + 1}`;
  usedSeats.add(seatIndex);
  return true;
}

/** Asigna S1..Sn en orden cuando la Fase 2 CP-SAT no puede resolver asientos. */
export function assignSequentialSeatFallback(
  tablePlacements: GuestPlacement[],
  guestIds: readonly string[],
  capacity: number,
): void {
  const usedSeats = new Set<number>();

  for (const guestId of guestIds) {
    for (let seatIndex = 0; seatIndex < capacity; seatIndex += 1) {
      if (placeGuestAtSeat(tablePlacements, guestId, seatIndex, usedSeats)) {
        break;
      }
    }
  }
}

/**
 * Fallback que prioriza parejas keepTogether en sillas adyacentes.
 */
export function assignCompanionAwareSeatFallback(
  tablePlacements: GuestPlacement[],
  guestIds: readonly string[],
  capacity: number,
  companionPairs: CompanionGuestPair[],
  adjacentSeatIndexPairs: Array<{ from: number; to: number }>,
): void {
  const guestIdSet = new Set(guestIds);
  const usedSeats = new Set<number>();
  const assignedGuests = new Set<string>();

  for (const pair of companionPairs) {
    if (
      !guestIdSet.has(pair.leftGuestId) ||
      !guestIdSet.has(pair.rightGuestId) ||
      assignedGuests.has(pair.leftGuestId) ||
      assignedGuests.has(pair.rightGuestId)
    ) {
      continue;
    }

    let placed = false;
    for (const adjacent of adjacentSeatIndexPairs) {
      if (usedSeats.has(adjacent.from) || usedSeats.has(adjacent.to)) {
        continue;
      }

      if (
        placeGuestAtSeat(
          tablePlacements,
          pair.leftGuestId,
          adjacent.from,
          usedSeats,
        ) &&
        placeGuestAtSeat(
          tablePlacements,
          pair.rightGuestId,
          adjacent.to,
          usedSeats,
        )
      ) {
        assignedGuests.add(pair.leftGuestId);
        assignedGuests.add(pair.rightGuestId);
        placed = true;
        break;
      }
    }

    if (!placed) {
      for (let left = 0; left < capacity; left += 1) {
        if (usedSeats.has(left)) {
          continue;
        }
        for (let right = left + 1; right < capacity; right += 1) {
          if (usedSeats.has(right)) {
            continue;
          }
          if (
            placeGuestAtSeat(
              tablePlacements,
              pair.leftGuestId,
              left,
              usedSeats,
            ) &&
            placeGuestAtSeat(
              tablePlacements,
              pair.rightGuestId,
              right,
              usedSeats,
            )
          ) {
            assignedGuests.add(pair.leftGuestId);
            assignedGuests.add(pair.rightGuestId);
            placed = true;
            break;
          }
        }
        if (placed) {
          break;
        }
      }
    }
  }

  for (const guestId of guestIds) {
    if (assignedGuests.has(guestId)) {
      continue;
    }

    for (let seatIndex = 0; seatIndex < capacity; seatIndex += 1) {
      if (placeGuestAtSeat(tablePlacements, guestId, seatIndex, usedSeats)) {
        assignedGuests.add(guestId);
        break;
      }
    }
  }
}

export function allPlacementsHaveSeats(
  tablePlacements: GuestPlacement[],
): boolean {
  return (
    tablePlacements.length > 0 &&
    tablePlacements.every((placement) => placement.seatIndex !== undefined)
  );
}
