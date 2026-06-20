import { Inject, Injectable } from '@nestjs/common';
import { validateGuestImportRows } from '../domain/guest-row.validator';
import type { GuestImportValidationResult } from '../domain/guest-import-validation-result';
import { collectInvalidRowNumbers } from '../domain/guest-import-row-errors';
import {
  assertValidGuestImportFile,
  type GuestImportUploadFile,
} from '../infrastructure/guest-import-file.validator';
import {
  GUEST_IMPORT_PARSER,
  type GuestImportParserPort,
} from '../infrastructure/excel/guest-import.parser.port';

@Injectable()
export class ValidateGuestImportUseCase {
  constructor(
    @Inject(GUEST_IMPORT_PARSER)
    private readonly parser: GuestImportParserPort,
  ) {}

  async execute(
    eventId: string,
    file: GuestImportUploadFile | undefined,
  ): Promise<GuestImportValidationResult> {
    assertValidGuestImportFile(file);

    const parsed = await this.parser.parse(file!.buffer);
    const rowErrors = validateGuestImportRows(parsed.rows);
    const errors = [...parsed.structuralErrors, ...rowErrors];
    const invalidRowNumbers = collectInvalidRowNumbers(errors);
    const validRows = parsed.rows.filter(
      (row) => !invalidRowNumbers.has(row.rowNumber),
    ).length;

    return {
      eventId,
      valid: errors.length === 0,
      totalRows: parsed.rows.length,
      validRows,
      invalidRows: parsed.rows.length - validRows,
      errors,
      rows: parsed.rows,
    };
  }
}
