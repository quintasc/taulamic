export const RESTRICTION_KINDS = [
  'intolerancia_alimentaria',
  'incompatibilidad',
  'afinidad',
] as const;

export type RestrictionKind = (typeof RESTRICTION_KINDS)[number];

export const SUGGESTION_STATUSES = ['pending', 'accepted', 'rejected'] as const;

export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const RESTRICTION_ORIGINS = ['manual', 'suggested'] as const;

export type RestrictionOrigin = (typeof RESTRICTION_ORIGINS)[number];

export type GuestRestriction = {
  id: string;
  kind: RestrictionKind;
  targetHint: string | null;
  description: string;
  origin: RestrictionOrigin;
  suggestionId: string | null;
  createdAt: string;
};

export type RestrictionSuggestion = {
  id: string;
  eventId: string;
  guestId: string;
  guestName: string;
  kind: RestrictionKind;
  targetHint: string | null;
  sourceText: string;
  status: SuggestionStatus;
  createdAt: string;
  reviewedAt: string | null;
};

export type DetectedSuggestionDraft = {
  kind: RestrictionKind;
  targetHint: string | null;
  description: string;
};
