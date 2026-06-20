import type { GuestImportRowError } from './guest-import-row-error';

export function collectInvalidRowNumbers(
  errors: GuestImportRowError[],
): Set<number> {
  return new Set(
    errors.map((error) => error.row).filter((row) => row > 0),
  );
}
