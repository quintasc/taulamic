import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import type { EventConfig, EventTable } from '../../domain/event-config';
import type {
  CreateEventInput,
  EventConfigRepositoryPort,
  UpdateEventInput,
  UpsertEventTableInput,
} from './event-config.repository.port';

@Injectable()
export class FileEventConfigRepository implements EventConfigRepositoryPort {
  constructor(private readonly configService: ConfigService) {}

  private dataDir(): string {
    return this.configService.get<string>(
      'events.dataDir',
      'uploads/events',
    );
  }

  private storePath(eventId: string): string {
    const base = this.dataDir();
    const root = isAbsolute(base) ? base : join(process.cwd(), base);
    return join(root, eventId, 'event-config.json');
  }

  async create(input: CreateEventInput): Promise<EventConfig> {
    const now = new Date().toISOString();
    const event: EventConfig = {
      id: `evt_${randomUUID()}`,
      name: input.name.trim(),
      status: 'configuring',
      tables: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.save(event);
    return event;
  }

  async findById(eventId: string): Promise<EventConfig | null> {
    const path = this.storePath(eventId);

    try {
      const raw = await readFile(path, 'utf8');
      return JSON.parse(raw) as EventConfig;
    } catch {
      return null;
    }
  }

  async update(eventId: string, input: UpdateEventInput): Promise<EventConfig> {
    const event = await this.requireEvent(eventId);
    const now = new Date().toISOString();

    const updated: EventConfig = {
      ...event,
      name: input.name?.trim() ?? event.name,
      updatedAt: now,
    };

    await this.save(updated);
    return updated;
  }

  async approvePlan(eventId: string): Promise<EventConfig> {
    const event = await this.requireEvent(eventId);
    const updated: EventConfig = {
      ...event,
      status: 'plan_approved',
      updatedAt: new Date().toISOString(),
    };

    await this.save(updated);
    return updated;
  }

  async addTable(
    eventId: string,
    input: UpsertEventTableInput,
  ): Promise<EventConfig> {
    const event = await this.requireEvent(eventId);
    const now = new Date().toISOString();
    const table: EventTable = {
      id: randomUUID(),
      label: input.label,
      shape: input.shape,
      capacity: input.capacity,
      createdAt: now,
      updatedAt: now,
    };

    const updated: EventConfig = {
      ...event,
      tables: [...event.tables, table],
      updatedAt: now,
    };

    await this.save(updated);
    return updated;
  }

  async updateTable(
    eventId: string,
    tableId: string,
    input: UpsertEventTableInput,
  ): Promise<EventConfig> {
    const event = await this.requireEvent(eventId);
    const index = event.tables.findIndex((table) => table.id === tableId);

    if (index === -1) {
      throw new NotFoundException({
        code: 'EVENT_TABLE_NOT_FOUND',
        message: 'No se encontro la mesa indicada en el evento.',
        details: { tableId },
      });
    }

    const now = new Date().toISOString();
    const current = event.tables[index];
    const updatedTable: EventTable = {
      ...current,
      label: input.label,
      shape: input.shape,
      capacity: input.capacity,
      updatedAt: now,
    };

    const tables = [...event.tables];
    tables[index] = updatedTable;

    const updated: EventConfig = {
      ...event,
      tables,
      updatedAt: now,
    };

    await this.save(updated);
    return updated;
  }

  async removeTable(eventId: string, tableId: string): Promise<EventConfig> {
    const event = await this.requireEvent(eventId);
    const tables = event.tables.filter((table) => table.id !== tableId);

    if (tables.length === event.tables.length) {
      throw new NotFoundException({
        code: 'EVENT_TABLE_NOT_FOUND',
        message: 'No se encontro la mesa indicada en el evento.',
        details: { tableId },
      });
    }

    const updated: EventConfig = {
      ...event,
      tables,
      updatedAt: new Date().toISOString(),
    };

    await this.save(updated);
    return updated;
  }

  private async requireEvent(eventId: string): Promise<EventConfig> {
    const event = await this.findById(eventId);

    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    return event;
  }

  private async save(event: EventConfig): Promise<void> {
    const path = this.storePath(event.id);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(event, null, 2), 'utf8');
  }
}
