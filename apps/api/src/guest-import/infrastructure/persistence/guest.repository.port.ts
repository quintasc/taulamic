import type { GuestUpsertInput } from '../../domain/guest-import.mapper';

export type GuestBatchUpsertResult = {
  created: number;
  updated: number;
  categoriesEnsured: number;
};

export type GuestRepositoryPort = {
  upsertBatch(
    eventId: string,
    rows: GuestUpsertInput[],
  ): Promise<GuestBatchUpsertResult>;
};

export const GUEST_REPOSITORY = Symbol('GUEST_REPOSITORY');
