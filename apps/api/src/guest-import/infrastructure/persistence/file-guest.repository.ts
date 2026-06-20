import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import type { Guest, GuestCategory } from '../../domain/guest';
import {
  categoryKey,
  normalizeCategoryName,
  type GuestUpsertInput,
} from '../../domain/guest-import.mapper';
import type {
  GuestBatchUpsertResult,
  GuestRepositoryPort,
} from './guest.repository.port';

type EventGuestStore = {
  eventId: string;
  categories: GuestCategory[];
  guests: Guest[];
};

@Injectable()
export class FileGuestRepository implements GuestRepositoryPort {
  constructor(private readonly configService: ConfigService) {}

  private dataDir(): string {
    return this.configService.get<string>(
      'guestImport.dataDir',
      'uploads/guests',
    );
  }

  private storePath(eventId: string): string {
    const base = this.dataDir();
    const root = isAbsolute(base) ? base : join(process.cwd(), base);
    return join(root, eventId, 'event-guests.json');
  }

  async upsertBatch(
    eventId: string,
    rows: GuestUpsertInput[],
  ): Promise<GuestBatchUpsertResult> {
    const store = await this.loadStore(eventId);
    let created = 0;
    let updated = 0;
    let categoriesEnsured = 0;

    for (const row of rows) {
      const categoryIds: string[] = [];

      for (const categoryName of row.categoryNames) {
        const ensured = this.ensureCategory(store, eventId, categoryName);
        if (ensured.created) {
          categoriesEnsured += 1;
        }
        categoryIds.push(ensured.category.id);
      }

      const existing = store.guests.find(
        (guest) => guest.correo === row.correo,
      );
      const now = new Date().toISOString();

      if (existing) {
        Object.assign(existing, {
          nombre: row.nombre,
          telefono: row.telefono,
          direccion: row.direccion,
          categoriaIds: categoryIds,
          observaciones: row.observaciones,
          acompananteKey: row.acompananteKey,
          separarAcompanante: row.separarAcompanante,
          preferenciaControl: row.preferenciaControl,
          updatedAt: now,
        });
        updated += 1;
        continue;
      }

      store.guests.push({
        id: randomUUID(),
        eventId,
        nombre: row.nombre,
        correo: row.correo,
        telefono: row.telefono,
        direccion: row.direccion,
        categoriaIds: categoryIds,
        observaciones: row.observaciones,
        acompananteKey: row.acompananteKey,
        separarAcompanante: row.separarAcompanante,
        preferenciaControl: row.preferenciaControl,
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    }

    await this.saveStore(store);
    return { created, updated, categoriesEnsured };
  }

  private ensureCategory(
    store: EventGuestStore,
    eventId: string,
    rawName: string,
  ): { category: GuestCategory; created: boolean } {
    const normalizedName = normalizeCategoryName(rawName);
    const key = categoryKey(normalizedName);
    const existing = store.categories.find(
      (category) => category.normalizedName === key,
    );

    if (existing) {
      return { category: existing, created: false };
    }

    const category: GuestCategory = {
      id: randomUUID(),
      eventId,
      name: normalizedName,
      normalizedName: key,
    };
    store.categories.push(category);
    return { category, created: true };
  }

  private async loadStore(eventId: string): Promise<EventGuestStore> {
    const path = this.storePath(eventId);

    try {
      const raw = await readFile(path, 'utf8');
      return JSON.parse(raw) as EventGuestStore;
    } catch {
      return {
        eventId,
        categories: [],
        guests: [],
      };
    }
  }

  private async saveStore(store: EventGuestStore): Promise<void> {
    const path = this.storePath(store.eventId);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(store, null, 2), 'utf8');
  }
}
