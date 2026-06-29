import type {
  DetectedSuggestionDraft,
  RestrictionKind,
} from './restriction-suggestion';

type PatternRule = {
  kind: RestrictionKind;
  regex: RegExp;
  buildDescription: (match: RegExpMatchArray, text: string) => string;
  extractTarget: (match: RegExpMatchArray) => string | null;
};

const PATTERN_RULES: PatternRule[] = [
  {
    kind: 'intolerancia_alimentaria',
    regex:
      /\b(intolerancia|alerg[ií]a|cel[ií]ac[oa]|sin gluten|lactosa|vegan[oa]|vegetarian[oa])\b/i,
    buildDescription: (_match, text) => text.trim(),
    extractTarget: () => null,
  },
  {
    kind: 'incompatibilidad',
    regex: /no\s+(?:sentar|sentarme|quiere\s+sentar)\s+con\s+(.+)/i,
    buildDescription: (match) => `Incompatibilidad con ${match[1]?.trim()}`,
    extractTarget: (match) => match[1]?.trim() ?? null,
  },
  {
    kind: 'afinidad',
    regex: /prefiere\s+(?:sentar(?:se)?|estar)\s+con\s+(.+)/i,
    buildDescription: (match) => `Afinidad con ${match[1]?.trim()}`,
    extractTarget: (match) => match[1]?.trim() ?? null,
  },
];

export function detectSuggestionsFromInternalNotes(
  notasInternas: string,
): DetectedSuggestionDraft[] {
  const text = notasInternas.trim();
  if (!text) {
    return [];
  }

  const suggestions: DetectedSuggestionDraft[] = [];

  for (const rule of PATTERN_RULES) {
    const match = text.match(rule.regex);
    if (!match) {
      continue;
    }

    suggestions.push({
      kind: rule.kind,
      targetHint: rule.extractTarget(match),
      description: rule.buildDescription(match, text),
    });
  }

  return suggestions;
}

/** @deprecated Usar detectSuggestionsFromInternalNotes */
export const detectSuggestionsFromObservation = detectSuggestionsFromInternalNotes;
