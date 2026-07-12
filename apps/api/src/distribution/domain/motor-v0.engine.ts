import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import {
  MOTOR_VERSION_V0_PILOT,
  type DistributionProposal,
  type DistributionStats,
  type GuestPlacement,
  type HardRuleViolation,
} from './distribution.types';
import {
  buildPlacementUnits,
  hasCrossIncompatibility,
  hasInternalIncompatibility,
} from './placement-units';

export type MotorV0Input = {
  eventId: string;
  proposalId: string;
  tables: EventTable[];
  guests: Guest[];
  createdAt: string;
};

export type MotorV0Result = Pick<
  DistributionProposal,
  | 'placements'
  | 'unassignedGuestIds'
  | 'hardRuleViolations'
  | 'stats'
  | 'motorVersion'
>;

type TableState = {
  tableId: string;
  label: string;
  capacity: number;
  occupied: number;
  guestIds: string[];
};

export function runMotorV0(input: MotorV0Input): MotorV0Result {
  const guestById = new Map(input.guests.map((guest) => [guest.id, guest]));
  const violations: HardRuleViolation[] = [];
  const placements: GuestPlacement[] = [];
  const unassigned = new Set<string>();

  if (input.tables.length === 0) {
    return emptyResult(input, violations, placements, [...unassigned]);
  }

  if (input.guests.length === 0) {
    return emptyResult(input, violations, placements, [...unassigned]);
  }

  const totalCapacity = input.tables.reduce(
    (sum, table) => sum + table.capacity,
    0,
  );

  if (totalCapacity < input.guests.length) {
    violations.push({
      code: 'INSUFFICIENT_TOTAL_CAPACITY',
      message: `Capacidad total (${totalCapacity}) inferior al numero de invitados (${input.guests.length}).`,
      guestIds: input.guests.map((guest) => guest.id),
    });
  }

  const tableStates: TableState[] = input.tables.map((table) => ({
    tableId: table.id,
    label: table.label,
    capacity: table.capacity,
    occupied: 0,
    guestIds: [],
  }));

  const units = buildPlacementUnits(input.guests);

  for (const unit of units) {
    const members = unit.guestIds
      .map((guestId) => guestById.get(guestId))
      .filter((guest): guest is Guest => guest !== undefined);

    if (unit.keepTogether && hasInternalIncompatibility(members)) {
      violations.push({
        code: 'COMPANION_GROUP_INCOMPATIBLE',
        message:
          'El grupo de acompanantes no puede sentarse junto por incompatibilidades registradas.',
        guestIds: unit.guestIds,
      });
      for (const guestId of unit.guestIds) {
        unassigned.add(guestId);
      }
      continue;
    }

    const placed = placeUnit(members, tableStates, guestById);

    if (!placed) {
      violations.push({
        code: 'NO_VALID_TABLE',
        message: 'No hay mesa valida que respete capacidad e incompatibilidades.',
        guestIds: unit.guestIds,
      });
      for (const guestId of unit.guestIds) {
        unassigned.add(guestId);
      }
      continue;
    }

    for (const member of members) {
      placements.push({
        guestId: member.id,
        guestName: member.nombre,
        tableId: placed.tableId,
        tableLabel: placed.label,
      });
    }
  }

  return {
    motorVersion: MOTOR_VERSION_V0_PILOT,
    placements,
    unassignedGuestIds: [...unassigned],
    hardRuleViolations: violations,
    stats: buildStats(
      input.guests.length,
      placements.length,
      input.tables.length,
      totalCapacity,
    ),
  };
}

function placeUnit(
  members: Guest[],
  tableStates: TableState[],
  guestById: Map<string, Guest>,
): TableState | null {
  const sortedTables = [...tableStates].sort(
    (left, right) =>
      left.capacity - left.occupied - (right.capacity - right.occupied),
  );

  for (const table of sortedTables) {
    const remaining = table.capacity - table.occupied;
    if (remaining < members.length) {
      continue;
    }

    const tablemates = table.guestIds
      .map((guestId) => guestById.get(guestId))
      .filter((guest): guest is Guest => guest !== undefined);

    if (hasCrossIncompatibility(members, tablemates)) {
      continue;
    }

    table.occupied += members.length;
    for (const member of members) {
      table.guestIds.push(member.id);
    }

    return table;
  }

  return null;
}

function buildStats(
  guestCount: number,
  assignedCount: number,
  tableCount: number,
  totalCapacity: number,
): DistributionStats {
  return {
    assignedCount,
    unassignedCount: guestCount - assignedCount,
    tableCount,
    totalCapacity,
  };
}

function emptyResult(
  input: MotorV0Input,
  violations: HardRuleViolation[],
  placements: GuestPlacement[],
  unassignedGuestIds: string[],
): MotorV0Result {
  const totalCapacity = input.tables.reduce(
    (sum, table) => sum + table.capacity,
    0,
  );

  return {
    motorVersion: MOTOR_VERSION_V0_PILOT,
    placements,
    unassignedGuestIds,
    hardRuleViolations: violations,
    stats: buildStats(
      input.guests.length,
      placements.length,
      input.tables.length,
      totalCapacity,
    ),
  };
}
