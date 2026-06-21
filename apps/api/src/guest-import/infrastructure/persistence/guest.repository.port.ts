import type { GuestUpsertInput } from '../../domain/guest-import.mapper';
import type { Guest, GuestCategory, GuestPreferenceControl } from '../../domain/guest';
import type { CompanionSeparationAuditSnapshot } from '../../../event-governance-audit/domain/governance-audit-entry';
import type {
  GuestRestriction,
  RestrictionKind,
  RestrictionSuggestion,
  SuggestionStatus,
} from '../../domain/restriction-suggestion';

export type GuestBatchUpsertResult = {
  created: number;
  updated: number;
  categoriesEnsured: number;
  affectedGuestIds: string[];
  companionSeparationChanges: CompanionSeparationAuditChange[];
};

export type CompanionSeparationAuditChange = {
  before: CompanionSeparationAuditSnapshot | null;
  after: CompanionSeparationAuditSnapshot;
};

export type UpdateSuggestionInput = {
  kind?: RestrictionKind;
  targetHint?: string | null;
  description?: string;
};

export type AddManualRestrictionInput = {
  kind: RestrictionKind;
  targetHint: string | null;
  description: string;
};

export type GuestManualInput = {
  nombre: string;
  correo: string;
  telefono: string;
  direccion?: string;
  categoryNames?: string[];
  observaciones?: string;
  acompananteKey?: string;
  separarAcompanante?: boolean | null;
  preferenciaControl?: GuestPreferenceControl | null;
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
  listGuestRestrictions(
    eventId: string,
    guestId: string,
  ): Promise<GuestRestriction[]>;
  addManualRestriction(
    eventId: string,
    guestId: string,
    input: AddManualRestrictionInput,
  ): Promise<GuestRestriction>;
  listGuests(eventId: string): Promise<Guest[]>;
  getGuest(eventId: string, guestId: string): Promise<Guest>;
  listCategories(eventId: string): Promise<GuestCategory[]>;
  createGuest(eventId: string, input: GuestManualInput): Promise<Guest>;
  updateGuest(
    eventId: string,
    guestId: string,
    input: GuestManualInput,
  ): Promise<Guest>;
  deleteGuest(eventId: string, guestId: string): Promise<void>;
  updateCompanionGroupSeparation(
    eventId: string,
    groupKey: string,
    input: CompanionGroupSeparationInput,
  ): Promise<Guest[]>;
};

export type CompanionGroupSeparationInput = {
  separate: boolean;
  reason?: string;
  origin: 'excel' | 'admin';
};

export const GUEST_REPOSITORY = Symbol('GUEST_REPOSITORY');
