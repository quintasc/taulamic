import type { DistributionProposal, EventDetail } from '@/lib/api';
import { DISTRIBUTION_COPY } from '@/lib/ui-copy';
import {
  resolveTableAffinityScores,
  type CompanionGroupInput,
  type AffinityRelationInput,
} from '@/lib/table-affinity-score';

export type { CompanionGroupInput, AffinityRelationInput };

export const PILOT_AFFINITY_LABEL = DISTRIBUTION_COPY.pilotAffinityLabel;

/** Texto corto en tablas (tooltip con `PILOT_AFFINITY_LABEL`). */
export const PILOT_AFFINITY_SHORT = DISTRIBUTION_COPY.pilotAffinityShort;

const SHAPE_LABELS: Record<string, string> = {
  redonda: 'Redonda',
  rectangular: 'Rectangular',
  oval: 'Ovalada',
  ovalada: 'Ovalada',
};

export type TableOccupancyStatus = 'full' | 'in-use' | 'empty';

export type DistributionTableFilter = 'all' | 'full' | 'in-use' | 'empty';

export type DistributionTableGuest = {
  guestId: string;
  guestName: string;
  categoryNames?: string[];
};

export type UnassignedGuestOption = {
  id: string;
  nombre: string;
};

export function buildUnassignedGuestOptions(
  unassignedGuestIds: string[],
  guests: Array<{ id: string; nombre: string }>,
): UnassignedGuestOption[] {
  const idSet = new Set(unassignedGuestIds);
  return guests
    .filter((guest) => idSet.has(guest.id))
    .map((guest) => ({ id: guest.id, nombre: guest.nombre }));
}

export type DistributionTableGroup = {
  tableId: string;
  tableLabel: string;
  shapeLabel: string;
  tableShape: string;
  assignedCount: number;
  capacity: number;
  freeSeats: number;
  status: TableOccupancyStatus;
  guests: DistributionTableGuest[];
  guestNames: string[];
  /** Categorías presentes en la mesa (nombres únicos). */
  categoryNames: string[];
  /** Compatibilidad por mesa (mismas reglas que el índice global, acotado a la mesa). */
  tableAffinity?: {
    earnedPoints: number;
    maxPoints: number;
    percent: number;
    detail: string;
  };
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

function guestMatchesSearchQuery(
  guest: DistributionTableGuest,
  query: string,
): boolean {
  return (
    guest.guestName.toLowerCase().includes(query) ||
    (guest.categoryNames ?? []).some((category) =>
      category.toLowerCase().includes(query),
    )
  );
}

export function tableGroupMatchesSearchQuery(
  group: DistributionTableGroup,
  query: string,
): boolean {
  if (!query) {
    return true;
  }

  const matchesTable =
    group.tableLabel.toLowerCase().includes(query) ||
    group.tableId.toLowerCase().includes(query);
  const matchesGuest = group.guestNames.some((name) =>
    name.toLowerCase().includes(query),
  );
  const matchesCategory = group.categoryNames.some((category) =>
    category.toLowerCase().includes(query),
  );

  return matchesTable || matchesGuest || matchesCategory;
}

/** Resumen de búsqueda: mesas visibles e invitados que coinciden (no el total de la mesa). */
export function summarizeDistributionSearch(
  groups: DistributionTableGroup[],
  search: string,
): { matchingTables: number; matchingGuests: number } | null {
  const query = search.trim().toLowerCase();
  if (!query) {
    return null;
  }

  let matchingGuests = 0;
  for (const group of groups) {
    for (const guest of group.guests) {
      if (guestMatchesSearchQuery(guest, query)) {
        matchingGuests += 1;
      }
    }
  }

  return {
    matchingTables: groups.length,
    matchingGuests,
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
      if (!tableGroupMatchesSearchQuery(group, query)) {
        return false;
      }
    }
    return true;
  });
}

function compareTableLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}


export function formatTableAffinity(group: DistributionTableGroup): string {
  if (group.assignedCount <= 0) {
    return '—';
  }
  if (!group.tableAffinity || group.tableAffinity.maxPoints === 0) {
    return '—';
  }
  return `${group.tableAffinity.percent}%`;
}

/** @deprecated Usar formatTableAffinity */
export function formatPilotTableAffinity(group: DistributionTableGroup): string {
  return formatTableAffinity(group);
}

export function buildDistributionTableGroups(
  proposal: DistributionProposal,
  event: EventDetail | null,
  context?: {
    guests?: Array<{
      id: string;
      nombre: string;
      acompananteKey?: string | null;
      categories?: Array<{ name: string }>;
    }>;
    companionGroups?: CompanionGroupInput[];
    affinityRelations?: AffinityRelationInput[];
  },
): DistributionTableGroup[] {
  const guestById = new Map(
    (context?.guests ?? []).map((guest) => [guest.id, guest]),
  );
  const affinityScores = resolveTableAffinityScores(
    proposal,
    event,
    context?.guests ?? [],
    context?.companionGroups ?? [],
    context?.affinityRelations ?? [],
  );
  const affinityByTable = new Map(
    affinityScores.map((score) => [score.tableId, score]),
  );
  const placementByTable = new Map<
    string,
    { tableLabel: string; guests: DistributionTableGuest[] }
  >();
  const guestNamesByTableLabel = new Map<string, string[]>();

  for (const placement of proposal.placements) {
    const current = placementByTable.get(placement.tableId) ?? {
      tableLabel: placement.tableLabel,
      guests: [],
    };
    current.guests.push({
      guestId: placement.guestId,
      guestName: placement.guestName,
      categoryNames:
        guestById
          .get(placement.guestId)
          ?.categories?.map((category) => category.name) ?? [],
    });
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
          capacity: Math.max(group.guests.length, 1),
        }));

  return tableEntries
    .map((table, index) => {
      const placement = placementByTable.get(table.id);
      let guests = placement?.guests ?? [];
      if (guests.length === 0 && table.label.trim()) {
        const fallbackNames =
          guestNamesByTableLabel.get(table.label.trim().toLowerCase()) ?? [];
        guests = fallbackNames.map((guestName) => ({
          guestId: '',
          guestName,
        }));
      }
      const guestNames = guests.map((guest) => guest.guestName);
      const categoryNames = [
        ...new Set(
          guests.flatMap((guest) => guest.categoryNames ?? []).filter(Boolean),
        ),
      ].sort((left, right) => left.localeCompare(right, 'es'));
      const assignedCount = guests.length;
      const capacity = table.capacity;
      const status = getTableOccupancyStatus(assignedCount, capacity);
      const affinity = affinityByTable.get(table.id);

      return {
        tableId: table.id,
        tableLabel: table.label || placement?.tableLabel || table.id,
        shapeLabel: formatTableShapeLabel(table.shape),
        tableShape: table.shape,
        assignedCount,
        capacity,
        freeSeats: Math.max(0, capacity - assignedCount),
        status,
        guests,
        guestNames,
        categoryNames,
        tableAffinity:
          affinity && affinity.maxPoints > 0
            ? {
                earnedPoints: affinity.earnedPoints,
                maxPoints: affinity.maxPoints,
                percent: affinity.percent,
                detail: affinity.detail,
              }
            : undefined,
      };
    })
    .sort((a, b) => compareTableLabels(a.tableLabel, b.tableLabel));
}
