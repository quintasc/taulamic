import type { GuestImportErrorCode } from './guest-import-error-code';

export type GuestImportRowError = {
  row: number;
  field: string;
  code: GuestImportErrorCode;
  message: string;
};
