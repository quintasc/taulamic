import type { DistributionProposal, EventDetail } from '@/lib/api';

/** Valor piloto alineado con dashboard hasta que la API exponga afinidad real. */
export const PILOT_AVERAGE_AFFINITY_PERCENT = 82;

export const PILOT_AFFINITY_LABEL = 'No calculado en piloto';

const SHAPE_LABELS: Record<string, string> = {
  redonda: 'Redonda',
  rectangular: 'Rectangular',
  oval: 'Ovalada',
  ovalada: 'Ovalada',
};

export type TableOccupancyStatus = 'full' | 'in-use' | 'empty';

export type DistributionTableFilter = 'all' | 'full' | 'in-use' | 'empty';

export type DistributionTableGroup = {
  tableId: string;
  tableLabel: string;
  shapeLabel: string;
  assignedCount: number;
  capacity: number;
  freeSeats: number;
  status: TableOccupancyStatus;
  guestNames: string[];
  /** `null` = mostrar guión (mesa vacía o sin score real). */
  affinityPercent: number | null;
};

export function formatTableShapeLabel(shape: string): string {
  const normalized = shape.toLowerCase();
  return (
    SHAPE_LABELS[normalized] ??
    shape.charAt(0).toUpperCase() + shape.slice(1).toLowerCase()
  );
}

export function getTableOccupancyStatus(
  assignedCount: number,
  capacity: number,
): TableOccupancyStatus {
  if (assignedCount <= 0) {
    return 'empty';
  }
  if (capacity > 0 && assignedCount >= capacity) {
    return 'full';
  }
  return 'in-use';
}

export function getStatusChipLabel(group: DistributionTableGroup): string {
  switch (group.status) {
    case 'full':
      return 'Llena';
    case 'in-use':
      return `En uso · ${group.freeSeats} ${group.freeSeats === 1 ? 'libre' : 'libres'}`;
    case 'empty':
      return 'Vacía';
  }
}

export function countTablesByStatus(groups: DistributionTableGroup[]) {
  return {
    all: groups.length,
    full: groups.filter((group) => group.status === 'full').length,
    inUse: groups.filter((group) => group.status === 'in-use').length,
    empty: groups.filter((group) => group.status === 'empty').length,
  };
}

export function filterDistributionTableGroups(
  groups: DistributionTableGroup[],
  filter: DistributionTableFilter,
  search: string,
  shapeLabel: string | 'all' = 'all',
): DistributionTableGroup[] {
  const query = search.trim().toLowerCase();

  return groups.filter((group) => {
    if (filter === 'full' && group.status !== 'full') {
      return false;
    }
    if (filter === 'in-use' && group.status !== 'in-use') {
      return false;
    }
    if (filter === 'empty' && group.status !== 'empty') {
      return false;
    }
    if (shapeLabel !== 'all' && group.shapeLabel !== shapeLabel) {
      return false;
    }
    if (
      query &&
      !group.tableLabel.toLowerCase().includes(query) &&
      !group.tableId.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });
}

function compareTableLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Estimación visual piloto por mesa (ocupación + variación) hasta score real en API. */
export function pilotTableAffinityPercent(
  assignedCount: number,
  capacity: number,
  index: number,
): number {
  if (capacity <= 0) {
    return PILOT_AVERAGE_AFFINITY_PERCENT;
  }
  const fill = assignedCount / capacity;
  const base = 68 + fill * 25;
  const variation = (index % 4) * 3;
  return Math.min(99, Math.max(60, Math.round(base + variation)));
}

export function buildDistributionTableGroups(
  proposal: DistributionProposal,
  event: EventDetail | null,
): DistributionTableGroup[] {
  const placementByTable = new Map<
    string,
    { tableLabel: string; guestNames: string[] }
  >();

  for (const placement of proposal.placements) {
    const current = placementByTable.get(placement.tableId) ?? {
      tableLabel: placement.tableLabel,
      guestNames: [],
    };
    current.guestNames.push(placement.guestName);
    placementByTable.set(placement.tableId, current);
  }

  const tables = event?.tables ?? [];
  const tableEntries =
    tables.length > 0
      ? tables.map((table) => ({
          id: table.id,
          label: table.label,
          shape: table.shape,
          capacity: table.capacity,
        }))
      : [...placementByTable.entries()].map(([id, group]) => ({
          id,
          label: group.tableLabel,
          shape: 'redonda',
          capacity: Math.max(group.guestNames.length, 1),
        }));

  return tableEntries
    .map((table, index) => {
      const placement = placementByTable.get(table.id);
      const guestNames = placement?.guestNames ?? [];
      const assignedCount = guestNames.length;
      const capacity = table.capacity;
      const status = getTableOccupancyStatus(assignedCount, capacity);

      return {
        tableId: table.id,
        tableLabel: table.label || placement?.tableLabel || table.id,
        shapeLabel: formatTableShapeLabel(table.shape),
        assignedCount,
        capacity,
        freeSeats: Math.max(0, capacity - assignedCount),
        status,
        guestNames,
        affinityPercent:
          status === 'empty'
            ? null
            : pilotTableAffinityPercent(assignedCount, capacity, index),
      };
    })
    .sort((a, b) => compareTableLabels(a.tableLabel, b.tableLabel));
}
