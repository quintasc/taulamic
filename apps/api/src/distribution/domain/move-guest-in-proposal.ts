import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal } from './distribution.types';

export class MoveGuestError extends Error {
  constructor(
    readonly code:
      | 'DISTRIBUTION_NOT_EDITABLE'
      | 'GUEST_NOT_ASSIGNED'
      | 'SAME_TABLE'
      | 'TABLE_NOT_FOUND'
      | 'TABLE_FULL'
      | 'INCOMPATIBLE_TABLEMATE',
    message: string,
  ) {
    super(message);
    this.name = 'MoveGuestError';
  }
}

export type MoveGuestInProposalInput = {
  guestId: string;
  tableId: string;
  guests: Guest[];
  tables: EventTable[];
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
    throw new MoveGuestError(
      'SAME_TABLE',
      'El invitado ya esta en esa mesa.',
    );
  }

  const table = input.tables.find((item) => item.id === input.tableId);

  if (!table) {
    throw new MoveGuestError(
      'TABLE_NOT_FOUND',
      'No se encontro la mesa indicada.',
    );
  }

  const assignedOnTarget = proposal.placements.filter(
    (placement) => placement.tableId === input.tableId,
  ).length;

  if (assignedOnTarget >= table.capacity) {
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

  assertIncompatibilityRule(proposal, guest, input.guests, input.tableId);

  const placements = proposal.placements.map((placement, index) =>
    index === placementIndex
      ? {
          ...placement,
          tableId: table.id,
          tableLabel: table.label,
        }
      : placement,
  );

  return {
    ...proposal,
    placements,
  };
}

function assertIncompatibilityRule(
  proposal: DistributionProposal,
  guest: Guest,
  guests: Guest[],
  tableId: string,
): void {
  const tablemates = proposal.placements
    .filter(
      (placement) =>
        placement.tableId === tableId && placement.guestId !== guest.id,
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
