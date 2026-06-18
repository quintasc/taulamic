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
export type FloorPlanExtension = (typeof FLOOR_PLAN_ALLOWED_EXTENSIONS)[number];

export function isAllowedFloorPlanExtension(
  extension: string,
): extension is FloorPlanExtension {
  return (FLOOR_PLAN_ALLOWED_EXTENSIONS as readonly string[]).includes(
    extension,
  );
}

export function isAllowedFloorPlanMimeType(
  mimeType: string,
): mimeType is FloorPlanMimeType {
  return (FLOOR_PLAN_ALLOWED_MIME_TYPES as readonly string[]).includes(
    mimeType,
  );
}
