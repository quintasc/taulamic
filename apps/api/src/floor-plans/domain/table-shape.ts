export const TABLE_SHAPES = [
  'redonda',
  'rectangular',
  'imperial',
  'ovalada',
] as const;

export type TableShape = (typeof TABLE_SHAPES)[number];

export function isTableShape(value: string): value is TableShape {
  return (TABLE_SHAPES as readonly string[]).includes(value);
}
