import type { GuestUpsertInput } from '../../domain/guest-import.mapper';
import type {
  RestrictionKind,
  RestrictionSuggestion,
  SuggestionStatus,
} from '../../domain/restriction-suggestion';

export type GuestBatchUpsertResult = {
  created: number;
  updated: number;
  categoriesEnsured: number;
  affectedGuestIds: string[];
};

export type UpdateSuggestionInput = {
  kind?: RestrictionKind;
  targetHint?: string | null;
  description?: string;
};

export type GuestRepositoryPort = {
  upsertBatch(
    eventId: string,
    rows: GuestUpsertInput[],
  ): Promise<GuestBatchUpsertResult>;
  generateSuggestionsFromObservations(
    eventId: string,
    guestIds: string[],
  ): Promise<number>;
  listSuggestions(
    eventId: string,
    status?: SuggestionStatus,
  ): Promise<RestrictionSuggestion[]>;
  updatePendingSuggestion(
    eventId: string,
    suggestionId: string,
    input: UpdateSuggestionInput,
  ): Promise<RestrictionSuggestion>;
  acceptSuggestion(
    eventId: string,
    suggestionId: string,
  ): Promise<RestrictionSuggestion>;
  rejectSuggestion(
    eventId: string,
    suggestionId: string,
  ): Promise<RestrictionSuggestion>;
};

export const GUEST_REPOSITORY = Symbol('GUEST_REPOSITORY');
