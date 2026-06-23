import type { DistributionProposal, EventDetail } from '@/lib/api';

export const PILOT_AFFINITY_LABEL = 'No calculado en piloto';

/** Texto corto en tablas (tooltip con `PILOT_AFFINITY_LABEL`). */
export const PILOT_AFFINITY_SHORT = 'N/D piloto';

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
    if (query) {
      const matchesTable =
        group.tableLabel.toLowerCase().includes(query) ||
        group.tableId.toLowerCase().includes(query);
      const matchesGuest = group.guestNames.some((name) =>
        name.toLowerCase().includes(query),
      );
      if (!matchesTable && !matchesGuest) {
        return false;
      }
    }
    return true;
  });
}

function compareTableLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}


export function formatPilotTableAffinity(group: DistributionTableGroup): string {
  if (group.assignedCount <= 0) {
    return '—';
  }
  return PILOT_AFFINITY_SHORT;
}

export function buildDistributionTableGroups(
  proposal: DistributionProposal,
  event: EventDetail | null,
): DistributionTableGroup[] {
  const placementByTable = new Map<
    string,
    { tableLabel: string; guestNames: string[] }
  >();
  const guestNamesByTableLabel = new Map<string, string[]>();

  for (const placement of proposal.placements) {
    const current = placementByTable.get(placement.tableId) ?? {
      tableLabel: placement.tableLabel,
      guestNames: [],
    };
    current.guestNames.push(placement.guestName);
    placementByTable.set(placement.tableId, current);

    const labelKey = placement.tableLabel.trim().toLowerCase();
    const labelGuests = guestNamesByTableLabel.get(labelKey) ?? [];
    labelGuests.push(placement.guestName);
    guestNamesByTableLabel.set(labelKey, labelGuests);
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
      let guestNames = placement?.guestNames ?? [];
      if (guestNames.length === 0 && table.label.trim()) {
        guestNames =
          guestNamesByTableLabel.get(table.label.trim().toLowerCase()) ?? [];
      }
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
      };
    })
    .sort((a, b) => compareTableLabels(a.tableLabel, b.tableLabel));
}
