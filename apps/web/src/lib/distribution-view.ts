import type { DistributionProposal, EventDetail } from '@/lib/api';

/** Valor piloto alineado con dashboard hasta que la API exponga afinidad real. */
export const PILOT_AVERAGE_AFFINITY_PERCENT = 82;

const SHAPE_LABELS: Record<string, string> = {
  redonda: 'Redonda',
  rectangular: 'Rectangular',
  oval: 'Ovalada',
  ovalada: 'Ovalada',
};

export type DistributionTableGroup = {
  tableId: string;
  tableLabel: string;
  shapeLabel: string;
  assignedCount: number;
  capacity: number;
  guestNames: string[];
  affinityPercent: number;
};

export function formatTableShapeLabel(shape: string): string {
  const normalized = shape.toLowerCase();
  return (
    SHAPE_LABELS[normalized] ??
    shape.charAt(0).toUpperCase() + shape.slice(1).toLowerCase()
  );
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
  const tableById = new Map(
    (event?.tables ?? []).map((table) => [table.id, table]),
  );

  const groups = new Map<
    string,
    {
      tableLabel: string;
      guestNames: string[];
    }
  >();

  for (const placement of proposal.placements) {
    const current = groups.get(placement.tableId) ?? {
      tableLabel: placement.tableLabel,
      guestNames: [],
    };
    current.guestNames.push(placement.guestName);
    groups.set(placement.tableId, current);
  }

  return [...groups.entries()].map(([tableId, group], index) => {
    const table = tableById.get(tableId);
    const assignedCount = group.guestNames.length;
    const capacity = table?.capacity ?? assignedCount;

    return {
      tableId,
      tableLabel: group.tableLabel,
      shapeLabel: formatTableShapeLabel(table?.shape ?? 'redonda'),
      assignedCount,
      capacity,
      guestNames: group.guestNames,
      affinityPercent: pilotTableAffinityPercent(
        assignedCount,
        capacity,
        index,
      ),
    };
  });
}
