export const GUEST_IMPORT_ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const GUEST_IMPORT_ALLOWED_EXTENSIONS = ['.xlsx'] as const;

export type GuestImportMimeType = (typeof GUEST_IMPORT_ALLOWED_MIME_TYPES)[number];

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export function getGuestImportMaxBytes(): number {
  const raw = process.env.GUEST_IMPORT_MAX_BYTES;
  if (raw === undefined || raw.trim() === '') {
    return DEFAULT_MAX_BYTES;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_BYTES;
  }

  return parsed;
}

export function isAllowedGuestImportExtension(extension: string): boolean {
  return (GUEST_IMPORT_ALLOWED_EXTENSIONS as readonly string[]).includes(
    extension,
  );
}

export function isAllowedGuestImportMimeType(
  mimeType: string,
): mimeType is GuestImportMimeType {
  return (GUEST_IMPORT_ALLOWED_MIME_TYPES as readonly string[]).includes(
    mimeType,
  );
}
