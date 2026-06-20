import type { GuestImportRow } from '../../domain/guest-import-row';
import type { GuestImportRowError } from '../../domain/guest-import-row-error';

export type GuestImportParseResult = {
  rows: GuestImportRow[];
  structuralErrors: GuestImportRowError[];
};

export type GuestImportParserPort = {
  parse(buffer: Buffer): Promise<GuestImportParseResult>;
};

export const GUEST_IMPORT_PARSER = Symbol('GUEST_IMPORT_PARSER');
