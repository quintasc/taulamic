export const FLOOR_PLAN_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export const FLOOR_PLAN_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
] as const;

export type FloorPlanMimeType = (typeof FLOOR_PLAN_ALLOWED_MIME_TYPES)[number];
