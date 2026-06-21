import { TableShape } from '../../floor-plans/domain/table-shape';

export const EVENT_CONFIG_STATUSES = ['configuring', 'plan_approved'] as const;

export type EventConfigStatus = (typeof EVENT_CONFIG_STATUSES)[number];

export type EventTable = {
  id: string;
  label: string;
  shape: TableShape;
  capacity: number;
  createdAt: string;
  updatedAt: string;
};

export type EventConfig = {
  id: string;
  name: string;
  status: EventConfigStatus;
  tables: EventTable[];
  createdAt: string;
  updatedAt: string;
};

export type EventCapacitySummary = {
  tableCount: number;
  totalCapacity: number;
  byShape: Partial<
    Record<TableShape, { tableCount: number; totalCapacity: number }>
  >;
};

export function summarizeEventCapacity(tables: EventTable[]): EventCapacitySummary {
  const byShape: EventCapacitySummary['byShape'] = {};

  for (const table of tables) {
    const current = byShape[table.shape] ?? {
      tableCount: 0,
      totalCapacity: 0,
    };
    byShape[table.shape] = {
      tableCount: current.tableCount + 1,
      totalCapacity: current.totalCapacity + table.capacity,
    };
  }

  return {
    tableCount: tables.length,
    totalCapacity: tables.reduce((sum, table) => sum + table.capacity, 0),
    byShape,
  };
}
