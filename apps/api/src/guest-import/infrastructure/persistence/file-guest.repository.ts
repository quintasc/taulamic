import { Injectable, NotFoundException } from '@nestjs/common';
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
import { companionSeparationFromImport } from '../../domain/companion-group.engine';
import { detectSuggestionsFromObservation } from '../../domain/observation-suggestion.engine';
import type {
  RestrictionSuggestion,
  SuggestionStatus,
  GuestRestriction,
} from '../../domain/restriction-suggestion';
import type {
  GuestBatchUpsertResult,
  GuestRepositoryPort,
  UpdateSuggestionInput,
  AddManualRestrictionInput,
  CompanionGroupSeparationInput,
} from './guest.repository.port';

type EventGuestStore = {
  eventId: string;
  categories: GuestCategory[];
  guests: Guest[];
  suggestions: RestrictionSuggestion[];
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
    const affectedGuestIds: string[] = [];

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

      const separation = companionSeparationFromImport(
        row.separarAcompanante,
        row.observaciones,
      );

      if (existing) {
        Object.assign(existing, {
          nombre: row.nombre,
          telefono: row.telefono,
          direccion: row.direccion,
          categoriaIds: categoryIds,
          observaciones: row.observaciones,
          acompananteKey: row.acompananteKey,
          separarAcompanante: row.separarAcompanante,
          ...separation,
          preferenciaControl: row.preferenciaControl,
          updatedAt: now,
        });
        affectedGuestIds.push(existing.id);
        updated += 1;
        continue;
      }

      const guest: Guest = {
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
        ...separation,
        preferenciaControl: row.preferenciaControl,
        restrictions: [],
        createdAt: now,
        updatedAt: now,
      };
      store.guests.push(guest);
      affectedGuestIds.push(guest.id);
      created += 1;
    }

    await this.saveStore(store);
    return { created, updated, categoriesEnsured, affectedGuestIds };
  }

  async generateSuggestionsFromObservations(
    eventId: string,
    guestIds: string[],
  ): Promise<number> {
    const store = await this.loadStore(eventId);
    let generated = 0;

    for (const guestId of guestIds) {
      const guest = store.guests.find((item) => item.id === guestId);
      if (!guest || !guest.observaciones.trim()) {
        continue;
      }

      const drafts = detectSuggestionsFromObservation(guest.observaciones);
      for (const draft of drafts) {
        if (this.hasDuplicatePendingSuggestion(store, guest.id, draft)) {
          continue;
        }

        store.suggestions.push({
          id: randomUUID(),
          eventId,
          guestId: guest.id,
          guestName: guest.nombre,
          kind: draft.kind,
          targetHint: draft.targetHint,
          sourceText: guest.observaciones,
          status: 'pending',
          createdAt: new Date().toISOString(),
          reviewedAt: null,
        });
        generated += 1;
      }
    }

    if (generated > 0) {
      await this.saveStore(store);
    }

    return generated;
  }

  async listSuggestions(
    eventId: string,
    status: SuggestionStatus = 'pending',
  ): Promise<RestrictionSuggestion[]> {
    const store = await this.loadStore(eventId);
    return store.suggestions.filter((suggestion) => suggestion.status === status);
  }

  async updatePendingSuggestion(
    eventId: string,
    suggestionId: string,
    input: UpdateSuggestionInput,
  ): Promise<RestrictionSuggestion> {
    const store = await this.loadStore(eventId);
    const suggestion = this.findSuggestion(store, eventId, suggestionId);

    if (suggestion.status !== 'pending') {
      throw new NotFoundException({
        code: 'SUGGESTION_NOT_PENDING',
        message: 'Solo se pueden editar sugerencias pendientes.',
      });
    }

    if (input.kind !== undefined) {
      suggestion.kind = input.kind;
    }
    if (input.targetHint !== undefined) {
      suggestion.targetHint = input.targetHint;
    }

    await this.saveStore(store);
    return suggestion;
  }

  async acceptSuggestion(
    eventId: string,
    suggestionId: string,
  ): Promise<RestrictionSuggestion> {
    const store = await this.loadStore(eventId);
    const suggestion = this.findSuggestion(store, eventId, suggestionId);

    if (suggestion.status !== 'pending') {
      throw new NotFoundException({
        code: 'SUGGESTION_NOT_PENDING',
        message: 'La sugerencia ya fue revisada.',
      });
    }

    const guest = store.guests.find((item) => item.id === suggestion.guestId);
    if (!guest) {
      throw new NotFoundException({
        code: 'GUEST_NOT_FOUND',
        message: 'No se encontro el invitado de la sugerencia.',
      });
    }

    guest.restrictions.push({
      id: randomUUID(),
      kind: suggestion.kind,
      targetHint: suggestion.targetHint,
      description: suggestion.sourceText,
      origin: 'suggested',
      suggestionId: suggestion.id,
      createdAt: new Date().toISOString(),
    });

    suggestion.status = 'accepted';
    suggestion.reviewedAt = new Date().toISOString();
    await this.saveStore(store);
    return suggestion;
  }

  async rejectSuggestion(
    eventId: string,
    suggestionId: string,
  ): Promise<RestrictionSuggestion> {
    const store = await this.loadStore(eventId);
    const suggestion = this.findSuggestion(store, eventId, suggestionId);

    if (suggestion.status !== 'pending') {
      throw new NotFoundException({
        code: 'SUGGESTION_NOT_PENDING',
        message: 'La sugerencia ya fue revisada.',
      });
    }

    suggestion.status = 'rejected';
    suggestion.reviewedAt = new Date().toISOString();
    await this.saveStore(store);
    return suggestion;
  }

  async listGuestRestrictions(
    eventId: string,
    guestId: string,
  ): Promise<GuestRestriction[]> {
    const store = await this.loadStore(eventId);
    const guest = store.guests.find((item) => item.id === guestId);

    if (!guest) {
      throw new NotFoundException({
        code: 'GUEST_NOT_FOUND',
        message: 'No se encontro el invitado indicado.',
      });
    }

    return guest.restrictions;
  }

  async addManualRestriction(
    eventId: string,
    guestId: string,
    input: AddManualRestrictionInput,
  ): Promise<GuestRestriction> {
    const store = await this.loadStore(eventId);
    const guest = store.guests.find((item) => item.id === guestId);

    if (!guest) {
      throw new NotFoundException({
        code: 'GUEST_NOT_FOUND',
        message: 'No se encontro el invitado indicado.',
      });
    }

    const restriction: GuestRestriction = {
      id: randomUUID(),
      kind: input.kind,
      targetHint: input.targetHint,
      description: input.description,
      origin: 'manual',
      suggestionId: null,
      createdAt: new Date().toISOString(),
    };

    guest.restrictions.push(restriction);
    await this.saveStore(store);
    return restriction;
  }

  async listGuests(eventId: string): Promise<Guest[]> {
    const store = await this.loadStore(eventId);
    return store.guests;
  }

  async updateCompanionGroupSeparation(
    eventId: string,
    groupKey: string,
    input: CompanionGroupSeparationInput,
  ): Promise<Guest[]> {
    const store = await this.loadStore(eventId);
    const normalizedKey = groupKey.trim();
    const members = store.guests.filter(
      (guest) => guest.acompananteKey.trim() === normalizedKey,
    );

    if (members.length < 2) {
      throw new NotFoundException({
        code: 'COMPANION_GROUP_NOT_FOUND',
        message: 'No se encontro un grupo de acompanantes con esa clave.',
      });
    }

    const now = new Date().toISOString();

    for (const guest of members) {
      if (input.separate) {
        guest.separarAcompanante = true;
        guest.companionSeparationReason =
          input.reason?.trim() ||
          'Excepcion explicita registrada por administrador.';
        guest.companionSeparationOrigin = input.origin;
        guest.companionSeparationAt = now;
      } else {
        guest.separarAcompanante = false;
        guest.companionSeparationReason = null;
        guest.companionSeparationOrigin = null;
        guest.companionSeparationAt = null;
      }
      guest.updatedAt = now;
    }

    await this.saveStore(store);
    return members;
  }

  private hasDuplicatePendingSuggestion(
    store: EventGuestStore,
    guestId: string,
    draft: { kind: string; targetHint: string | null },
  ): boolean {
    const targetKey = (draft.targetHint ?? '').trim().toLowerCase();
    return store.suggestions.some(
      (suggestion) =>
        suggestion.guestId === guestId &&
        suggestion.status === 'pending' &&
        suggestion.kind === draft.kind &&
        (suggestion.targetHint ?? '').trim().toLowerCase() === targetKey,
    );
  }

  private findSuggestion(
    store: EventGuestStore,
    eventId: string,
    suggestionId: string,
  ): RestrictionSuggestion {
    const suggestion = store.suggestions.find(
      (item) => item.id === suggestionId && item.eventId === eventId,
    );

    if (!suggestion) {
      throw new NotFoundException({
        code: 'SUGGESTION_NOT_FOUND',
        message: 'No se encontro la sugerencia indicada.',
      });
    }

    return suggestion;
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

  private normalizeStore(store: EventGuestStore): EventGuestStore {
    return {
      ...store,
      suggestions: store.suggestions ?? [],
      guests: store.guests.map((guest) => ({
        ...guest,
        restrictions: guest.restrictions ?? [],
        companionSeparationReason: guest.companionSeparationReason ?? null,
        companionSeparationOrigin: guest.companionSeparationOrigin ?? null,
        companionSeparationAt: guest.companionSeparationAt ?? null,
      })),
    };
  }

  private async loadStore(eventId: string): Promise<EventGuestStore> {
    const path = this.storePath(eventId);

    try {
      const raw = await readFile(path, 'utf8');
      return this.normalizeStore(JSON.parse(raw) as EventGuestStore);
    } catch {
      return {
        eventId,
        categories: [],
        guests: [],
        suggestions: [],
      };
    }
  }

  private async saveStore(store: EventGuestStore): Promise<void> {
    const path = this.storePath(store.eventId);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(store, null, 2), 'utf8');
  }
}
