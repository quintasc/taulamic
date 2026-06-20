import type { GuestImportRowError } from './guest-import-row-error';

export type GuestImportBatchResult = {
  eventId: string;
  totalRows: number;
  created: number;
  updated: number;
  rejected: number;
  categoriesEnsured: number;
  suggestionsGenerated: number;
  errors: GuestImportRowError[];
};
