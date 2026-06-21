import type { TableShape } from '../../../floor-plans/domain/table-shape';
import type {
  EventConfig,
  EventTable,
} from '../../domain/event-config';

export const EVENT_CONFIG_REPOSITORY = Symbol('EVENT_CONFIG_REPOSITORY');

export type CreateEventInput = {
  name: string;
};

export type UpdateEventInput = {
  name?: string;
};

export type UpsertEventTableInput = {
  label: string;
  shape: TableShape;
  capacity: number;
};

export interface EventConfigRepositoryPort {
  create(input: CreateEventInput): Promise<EventConfig>;
  findById(eventId: string): Promise<EventConfig | null>;
  update(eventId: string, input: UpdateEventInput): Promise<EventConfig>;
  addTable(eventId: string, input: UpsertEventTableInput): Promise<EventConfig>;
  updateTable(
    eventId: string,
    tableId: string,
    input: UpsertEventTableInput,
  ): Promise<EventConfig>;
  removeTable(eventId: string, tableId: string): Promise<EventConfig>;
}

export type { EventConfig, EventTable };
