import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { SoftRuleKind } from './distribution-engine.port';
import type { DistributionProposal, GuestPlacement } from './distribution.types';
import { wouldCreateAvoidableCategoryOrphan } from './category-grouping';
import {
  UpdateGuestSeatError,
  updateGuestSeatInProposal,
} from './update-guest-seat-in-proposal';

export class MoveGuestError extends Error {
  constructor(
    readonly code:
      | 'DISTRIBUTION_NOT_EDITABLE'
      | 'GUEST_NOT_ASSIGNED'
      | 'SAME_TABLE'
      | 'TABLE_NOT_FOUND'
      | 'TABLE_FULL'
      | 'INCOMPATIBLE_TABLEMATE'
      | 'CATEGORY_ORPHAN_AVOIDABLE',
    message: string,
  ) {
    super(message);
    this.name = 'MoveGuestError';
  }
}

export type MoveGuestInProposalInput = {
  guestId: string;
  tableId: string;
  seatIndex?: number;
  guests: Guest[];
  tables: EventTable[];
  softRules?: SoftRuleKind[];
};

export function moveGuestInProposal(
  proposal: DistributionProposal,
  input: MoveGuestInProposalInput,
): DistributionProposal {
  if (proposal.status !== 'draft') {
    throw new MoveGuestError(
      'DISTRIBUTION_NOT_EDITABLE',
      'Solo se puede mover en una propuesta en borrador.',
    );
  }

  const placementIndex = proposal.placements.findIndex(
    (placement) => placement.guestId === input.guestId,
  );

  if (placementIndex < 0) {
    throw new MoveGuestError(
      'GUEST_NOT_ASSIGNED',
      'El invitado no esta asignado a ninguna mesa.',
    );
  }

  const currentPlacement = proposal.placements[placementIndex];

  if (currentPlacement.tableId === input.tableId) {
    if (input.seatIndex === undefined) {
      throw new MoveGuestError(
        'SAME_TABLE',
        'El invitado ya esta en esa mesa.',
      );
    }

    try {
      return updateGuestSeatInProposal(proposal, {
        guestId: input.guestId,
        seatIndex: input.seatIndex,
        tables: input.tables,
      });
    } catch (error) {
      if (error instanceof UpdateGuestSeatError) {
        throw new MoveGuestError(
          error.code === 'SEAT_OUT_OF_RANGE'
            ? 'TABLE_FULL'
            : 'GUEST_NOT_ASSIGNED',
          error.message,
        );
      }
      throw error;
    }
  }

  const table = input.tables.find((item) => item.id === input.tableId);

  if (!table) {
    throw new MoveGuestError(
      'TABLE_NOT_FOUND',
      'No se encontro la mesa indicada.',
    );
  }

  if (
    input.seatIndex !== undefined &&
    (input.seatIndex < 0 || input.seatIndex >= table.capacity)
  ) {
    throw new MoveGuestError(
      'TABLE_FULL',
      'El asiento indicado no es valido para esta mesa.',
    );
  }

  const swapOccupant =
    input.seatIndex === undefined
      ? undefined
      : proposal.placements.find(
          (placement) =>
            placement.guestId !== input.guestId &&
            placement.tableId === input.tableId &&
            placement.seatIndex === input.seatIndex,
        );

  const assignedOnTarget = proposal.placements.filter(
    (placement) => placement.tableId === input.tableId,
  ).length;

  if (!swapOccupant && assignedOnTarget >= table.capacity) {
    throw new MoveGuestError(
      'TABLE_FULL',
      'La mesa no tiene plazas libres.',
    );
  }

  const guest = input.guests.find((item) => item.id === input.guestId);

  if (!guest) {
    throw new MoveGuestError(
      'GUEST_NOT_ASSIGNED',
      'El invitado no esta disponible para mover.',
    );
  }

  assertIncompatibilityRule(
    proposal,
    guest,
    input.guests,
    input.tableId,
    swapOccupant?.guestId,
  );

  if (swapOccupant) {
    const swapGuest = input.guests.find(
      (item) => item.id === swapOccupant.guestId,
    );
    if (!swapGuest) {
      throw new MoveGuestError(
        'GUEST_NOT_ASSIGNED',
        'El invitado con el que se intercambia no esta disponible.',
      );
    }
    assertIncompatibilityRule(
      proposal,
      swapGuest,
      input.guests,
      currentPlacement.tableId,
      input.guestId,
    );
  }

  assertCategoryGroupingRule(proposal, guest, input, {
    leavingGuestId: swapOccupant?.guestId,
  });

  if (swapOccupant) {
    const swapGuest = input.guests.find(
      (item) => item.id === swapOccupant.guestId,
    );
    if (swapGuest) {
      assertCategoryGroupingRule(
        proposal,
        swapGuest,
        {
          ...input,
          guestId: swapOccupant.guestId,
          tableId: currentPlacement.tableId,
          seatIndex: currentPlacement.seatIndex,
        },
        { leavingGuestId: input.guestId },
      );
    }
  }

  if (swapOccupant) {
    return {
      ...proposal,
      placements: proposal.placements.map((placement) => {
        if (placement.guestId === input.guestId) {
          return withTableAndSeat(
            placement,
            table.id,
            table.label,
            input.seatIndex!,
          );
        }
        if (placement.guestId === swapOccupant.guestId) {
          if (currentPlacement.seatIndex !== undefined) {
            return withTableAndSeat(
              placement,
              currentPlacement.tableId,
              currentPlacement.tableLabel,
              currentPlacement.seatIndex,
            );
          }
          const { seatIndex: _seatIndex, seatLabel: _seatLabel, ...rest } =
            placement;
          return {
            ...rest,
            tableId: currentPlacement.tableId,
            tableLabel: currentPlacement.tableLabel,
          };
        }
        return placement;
      }),
    };
  }

  const placements = proposal.placements.map((placement, index) =>
    index === placementIndex
      ? {
          ...placement,
          tableId: table.id,
          tableLabel: table.label,
          ...(input.seatIndex !== undefined
            ? {
                seatIndex: input.seatIndex,
                seatLabel: `S${input.seatIndex + 1}`,
              }
            : {
                seatIndex: undefined,
                seatLabel: undefined,
              }),
        }
      : placement,
  );

  return {
    ...proposal,
    placements,
  };
}

function withTableAndSeat(
  placement: GuestPlacement,
  tableId: string,
  tableLabel: string,
  seatIndex: number,
): GuestPlacement {
  return {
    ...placement,
    tableId,
    tableLabel,
    seatIndex,
    seatLabel: `S${seatIndex + 1}`,
  };
}

function assertCategoryGroupingRule(
  proposal: DistributionProposal,
  guest: Guest,
  input: MoveGuestInProposalInput,
  options?: { leavingGuestId?: string },
): void {
  if (!input.softRules?.includes('groupByCategory')) {
    return;
  }

  const hypotheticalPlacements = proposal.placements
    .filter((placement) => placement.guestId !== options?.leavingGuestId)
    .map((placement) =>
      placement.guestId === guest.id
        ? { ...placement, tableId: input.tableId }
        : placement,
    );
  const hypotheticalProposal: DistributionProposal = {
    ...proposal,
    placements: hypotheticalPlacements,
  };

  if (
    wouldCreateAvoidableCategoryOrphan(
      hypotheticalProposal,
      guest,
      input.tableId,
      input.guests,
      input.tables,
    )
  ) {
    throw new MoveGuestError(
      'CATEGORY_ORPHAN_AVOIDABLE',
      'No puedes dejar a este invitado como único de su categoría en la mesa cuando hay otra mesa factible con compañeros de su grupo.',
    );
  }
}

function assertIncompatibilityRule(
  proposal: DistributionProposal,
  guest: Guest,
  guests: Guest[],
  tableId: string,
  excludeGuestId?: string,
): void {
  const tablemates = proposal.placements
    .filter(
      (placement) =>
        placement.tableId === tableId &&
        placement.guestId !== guest.id &&
        placement.guestId !== excludeGuestId,
    )
    .map((placement) => guests.find((item) => item.id === placement.guestId))
    .filter((item): item is Guest => item !== undefined);

  for (const tablemate of tablemates) {
    if (areIncompatible(guest, tablemate)) {
      throw new MoveGuestError(
        'INCOMPATIBLE_TABLEMATE',
        'El invitado no puede sentarse con alguien incompatible en esa mesa.',
      );
    }
  }
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
