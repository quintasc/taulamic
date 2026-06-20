import type { GuestTemplateColumn } from './guest-template.schema';

export type GuestImportRow = {
  rowNumber: number;
  values: Record<GuestTemplateColumn, string>;
};
