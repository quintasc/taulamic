import type { EventTable } from '../../events/domain/event-config';
import { buildCompanionGroups } from '../../guest-import/domain/companion-group.engine';
import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal } from './distribution.types';

export class AssignGuestError extends Error {
  constructor(
    readonly code:
      | 'DISTRIBUTION_NOT_EDITABLE'
      | 'GUEST_NOT_UNASSIGNED'
      | 'GUEST_ALREADY_ASSIGNED'
      | 'TABLE_NOT_FOUND'
      | 'TABLE_FULL'
      | 'COMPANION_SEPARATED'
      | 'INCOMPATIBLE_TABLEMATE',
    message: string,
  ) {
    super(message);
    this.name = 'AssignGuestError';
  }
}

export type AssignGuestToProposalInput = {
  guestId: string;
  tableId: string;
  guests: Guest[];
  tables: EventTable[];
};

export function assignGuestToProposal(
  proposal: DistributionProposal,
  input: AssignGuestToProposalInput,
): DistributionProposal {
  if (proposal.status !== 'draft') {
    throw new AssignGuestError(
      'DISTRIBUTION_NOT_EDITABLE',
      'Solo se puede asignar en una propuesta en borrador.',
    );
  }

  const guest = input.guests.find((item) => item.id === input.guestId);

  if (!guest) {
    throw new AssignGuestError(
      'GUEST_NOT_UNASSIGNED',
      'El invitado no esta disponible para asignar.',
    );
  }

  if (proposal.placements.some((placement) => placement.guestId === input.guestId)) {
    throw new AssignGuestError(
      'GUEST_ALREADY_ASSIGNED',
      'El invitado ya esta asignado a una mesa.',
    );
  }

  if (!proposal.unassignedGuestIds.includes(input.guestId)) {
    throw new AssignGuestError(
      'GUEST_NOT_UNASSIGNED',
      'El invitado no esta en la bolsa de sin asignar.',
    );
  }

  const table = input.tables.find((item) => item.id === input.tableId);

  if (!table) {
    throw new AssignGuestError(
      'TABLE_NOT_FOUND',
      'No se encontro la mesa indicada.',
    );
  }

  const assignedOnTable = proposal.placements.filter(
    (placement) => placement.tableId === input.tableId,
  ).length;

  if (assignedOnTable >= table.capacity) {
    throw new AssignGuestError(
      'TABLE_FULL',
      'La mesa no tiene plazas libres.',
    );
  }

  assertCompanionRule(proposal, guest, input.guests, input.tableId);
  assertIncompatibilityRule(proposal, guest, input.guests, input.tableId);

  const placements = [
    ...proposal.placements,
    {
      guestId: guest.id,
      guestName: guest.nombre,
      tableId: table.id,
      tableLabel: table.label,
    },
  ];
  const unassignedGuestIds = proposal.unassignedGuestIds.filter(
    (guestId) => guestId !== input.guestId,
  );

  return {
    ...proposal,
    placements,
    unassignedGuestIds,
    stats: {
      ...proposal.stats,
      assignedCount: placements.length,
      unassignedCount: unassignedGuestIds.length,
    },
  };
}

function assertCompanionRule(
  proposal: DistributionProposal,
  guest: Guest,
  guests: Guest[],
  tableId: string,
): void {
  for (const group of buildCompanionGroups(guests)) {
    if (!group.keepTogether || !group.guestIds.includes(guest.id)) {
      continue;
    }

    for (const otherGuestId of group.guestIds) {
      if (otherGuestId === guest.id) {
        continue;
      }

      const otherPlacement = proposal.placements.find(
        (placement) => placement.guestId === otherGuestId,
      );

      if (otherPlacement && otherPlacement.tableId !== tableId) {
        throw new AssignGuestError(
          'COMPANION_SEPARATED',
          'Los acompanantes deben sentarse en la misma mesa.',
        );
      }
    }
  }
}

function assertIncompatibilityRule(
  proposal: DistributionProposal,
  guest: Guest,
  guests: Guest[],
  tableId: string,
): void {
  const tablemates = proposal.placements
    .filter((placement) => placement.tableId === tableId)
    .map((placement) => guests.find((item) => item.id === placement.guestId))
    .filter((item): item is Guest => item !== undefined);

  for (const tablemate of tablemates) {
    if (areIncompatible(guest, tablemate)) {
      throw new AssignGuestError(
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
