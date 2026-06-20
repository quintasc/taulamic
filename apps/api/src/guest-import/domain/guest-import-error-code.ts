export const GUEST_IMPORT_ERROR_CODES = [
  'XLS-001',
  'XLS-002',
  'XLS-003',
  'XLS-004',
  'XLS-005',
  'XLS-006',
  'XLS-007',
] as const;

export type GuestImportErrorCode = (typeof GUEST_IMPORT_ERROR_CODES)[number];
