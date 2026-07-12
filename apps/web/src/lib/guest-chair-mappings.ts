import type { DistributionProposal } from '@/lib/api';

export type ChairOccupant = {
  guestId: string;
  guestName: string;
};

export function chairMappingsFromProposal(
  proposal: DistributionProposal,
): Record<string, string> {
  const mappings: Record<string, string> = {};

  for (const placement of proposal.placements) {
    if (placement.seatLabel) {
      mappings[placement.guestId] = placement.seatLabel;
      continue;
    }

    if (placement.seatIndex !== undefined) {
      mappings[placement.guestId] = `S${placement.seatIndex + 1}`;
    }
  }

  return mappings;
}

/**
 * Construye el mapa silla → invitado sin efectos secundarios.
 * No rellena huecos en orden secuencial: respeta solo mappings explícitos
 * (p. ej. seatIndex/seatLabel de la propuesta del motor).
 */
export function buildOccupiedChairsForTable(
  capacity: number,
  guests: ChairOccupant[],
  chairMappings: Record<string, string>,
): Record<string, ChairOccupant> {
  const occupied: Record<string, ChairOccupant> = {};

  for (const guest of guests) {
    if (!guest.guestId) {
      continue;
    }

    const chair = chairMappings[guest.guestId];
    if (!chair?.startsWith('S')) {
      continue;
    }

    const seatNumber = Number.parseInt(chair.slice(1), 10);
    if (
      !Number.isFinite(seatNumber) ||
      seatNumber < 1 ||
      seatNumber > capacity ||
      occupied[chair]
    ) {
      continue;
    }

    occupied[chair] = guest;
  }

  const unmappedGuests = guests.filter(
    (guest) =>
      guest.guestId &&
      !Object.values(occupied).some(
        (occupant) => occupant.guestId === guest.guestId,
      ),
  );

  if (unmappedGuests.length === 0) {
    return occupied;
  }

  let seatNumber = 1;
  for (const guest of unmappedGuests) {
    while (seatNumber <= capacity && occupied[`S${seatNumber}`]) {
      seatNumber += 1;
    }
    if (seatNumber > capacity) {
      break;
    }
    occupied[`S${seatNumber}`] = guest;
    seatNumber += 1;
  }

  return occupied;
}

export function chairIdToSeatIndex(chairId: string): number | null {
  if (!chairId.startsWith('S')) {
    return null;
  }

  const seatNumber = Number.parseInt(chairId.slice(1), 10);
  if (!Number.isFinite(seatNumber) || seatNumber < 1) {
    return null;
  }

  return seatNumber - 1;
}
