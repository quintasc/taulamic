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

const DEFAULT_DETECTION_TIMEOUT_MS = 30_000;

export function getFloorPlanDetectionTimeoutMs(): number {
  const raw = process.env.FLOOR_PLAN_DETECTION_TIMEOUT_MS;
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_DETECTION_TIMEOUT_MS;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_DETECTION_TIMEOUT_MS;
  }

  return parsed;
}
