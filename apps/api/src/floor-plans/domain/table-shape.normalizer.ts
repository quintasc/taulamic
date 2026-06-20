import { TableShape } from './table-shape';

const SHAPE_ALIASES: ReadonlyArray<{ pattern: RegExp; shape: TableShape }> = [
  { pattern: /\b(redonda|round|circular)\b/i, shape: 'redonda' },
  { pattern: /\b(rectangular|recta|rectangle)\b/i, shape: 'rectangular' },
  { pattern: /\b(imperial|u-?shape|forma\s*u)\b/i, shape: 'imperial' },
  { pattern: /\b(ovalada|oval|eliptica|elliptic)\b/i, shape: 'ovalada' },
];

export type NormalizedTableShape = {
  shape: TableShape;
  matched: boolean;
};

export function normalizeTableShape(rawShape?: string): NormalizedTableShape {
  if (!rawShape?.trim()) {
    return { shape: 'rectangular', matched: false };
  }

  for (const alias of SHAPE_ALIASES) {
    if (alias.pattern.test(rawShape)) {
      return { shape: alias.shape, matched: true };
    }
  }

  return { shape: 'rectangular', matched: false };
}
