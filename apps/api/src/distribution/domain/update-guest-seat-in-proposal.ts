import type { EventTable } from '../../events/domain/event-config';
import type { DistributionProposal, GuestPlacement } from './distribution.types';

export class UpdateGuestSeatError extends Error {
  constructor(
    readonly code:
      | 'DISTRIBUTION_NOT_EDITABLE'
      | 'GUEST_NOT_ASSIGNED'
      | 'TABLE_NOT_FOUND'
      | 'SEAT_OUT_OF_RANGE',
    message: string,
  ) {
    super(message);
    this.name = 'UpdateGuestSeatError';
  }
}

export type UpdateGuestSeatInProposalInput = {
  guestId: string;
  seatIndex: number;
  tables: EventTable[];
};

export function updateGuestSeatInProposal(
  proposal: DistributionProposal,
  input: UpdateGuestSeatInProposalInput,
): DistributionProposal {
  if (proposal.status !== 'draft') {
    throw new UpdateGuestSeatError(
      'DISTRIBUTION_NOT_EDITABLE',
      'Solo se puede cambiar el asiento en una propuesta en borrador.',
    );
  }

  const placementIndex = proposal.placements.findIndex(
    (placement) => placement.guestId === input.guestId,
  );

  if (placementIndex < 0) {
    throw new UpdateGuestSeatError(
      'GUEST_NOT_ASSIGNED',
      'El invitado no esta asignado a ninguna mesa.',
    );
  }

  const currentPlacement = proposal.placements[placementIndex];
  const table = input.tables.find((item) => item.id === currentPlacement.tableId);

  if (!table) {
    throw new UpdateGuestSeatError(
      'TABLE_NOT_FOUND',
      'No se encontro la mesa del invitado.',
    );
  }

  if (input.seatIndex < 0 || input.seatIndex >= table.capacity) {
    throw new UpdateGuestSeatError(
      'SEAT_OUT_OF_RANGE',
      'El asiento indicado no es valido para esta mesa.',
    );
  }

  const seatLabel = `S${input.seatIndex + 1}`;
  const previousSeatIndex = currentPlacement.seatIndex;
  const occupantIndex = proposal.placements.findIndex(
    (placement, index) =>
      index !== placementIndex &&
      placement.tableId === currentPlacement.tableId &&
      placement.seatIndex === input.seatIndex,
  );

  const placements = proposal.placements.map((placement, index) => {
    if (index === placementIndex) {
      return withSeat(placement, input.seatIndex, seatLabel);
    }

    if (index === occupantIndex) {
      if (previousSeatIndex !== undefined) {
        return withSeat(
          placement,
          previousSeatIndex,
          `S${previousSeatIndex + 1}`,
        );
      }
      return withoutSeat(placement);
    }

    return placement;
  });

  return {
    ...proposal,
    placements,
  };
}

function withSeat(
  placement: GuestPlacement,
  seatIndex: number,
  seatLabel: string,
): GuestPlacement {
  return {
    ...placement,
    seatIndex,
    seatLabel,
  };
}

function withoutSeat(placement: GuestPlacement): GuestPlacement {
  const { seatIndex: _seatIndex, seatLabel: _seatLabel, ...rest } = placement;
  return rest;
}
