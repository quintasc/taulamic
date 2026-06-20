export const TABLE_ORIGINS = [
  'detected',
  'manual',
  'detected_edited',
] as const;

export type TableOrigin = (typeof TABLE_ORIGINS)[number];

export const LAYOUT_CONFIGURATION_ORIGINS = [
  'manual',
  'imported_edited',
] as const;

export type LayoutConfigurationOrigin =
  (typeof LAYOUT_CONFIGURATION_ORIGINS)[number];
