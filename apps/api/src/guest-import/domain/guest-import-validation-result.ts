import type { GuestImportRowError } from './guest-import-row-error';
import type { GuestImportRow } from './guest-import-row';

export type GuestImportValidationResult = {
  eventId: string;
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: GuestImportRowError[];
  rows: GuestImportRow[];
};
