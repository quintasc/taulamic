import { Inject, Injectable } from '@nestjs/common';
import type { GuestImportBatchResult } from '../domain/guest-import-batch-result';
import { collectInvalidRowNumbers } from '../domain/guest-import-row-errors';
import { mapImportRowToGuestInput } from '../domain/guest-import.mapper';
import { validateGuestImportRows } from '../domain/guest-row.validator';
import {
  assertValidGuestImportFile,
  type GuestImportUploadFile,
} from '../infrastructure/guest-import-file.validator';
import {
  GUEST_IMPORT_PARSER,
  type GuestImportParserPort,
} from '../infrastructure/excel/guest-import.parser.port';
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../infrastructure/persistence/guest.repository.port';
import { RecordCompanionSeparationAuditUseCase } from '../../event-governance-audit/application/governance-audit.use-case';

@Injectable()
export class ImportGuestBatchUseCase {
  constructor(
    @Inject(GUEST_IMPORT_PARSER)
    private readonly parser: GuestImportParserPort,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    private readonly recordCompanionSeparationAuditUseCase: RecordCompanionSeparationAuditUseCase,
  ) {}

  async execute(
    eventId: string,
    file: GuestImportUploadFile | undefined,
  ): Promise<GuestImportBatchResult> {
    assertValidGuestImportFile(file);

    const parsed = await this.parser.parse(file!.buffer);

    if (parsed.structuralErrors.length > 0) {
      return {
        eventId,
        totalRows: 0,
        created: 0,
        updated: 0,
        rejected: 0,
        categoriesEnsured: 0,
        suggestionsGenerated: 0,
        errors: parsed.structuralErrors,
      };
    }

    const rowErrors = validateGuestImportRows(parsed.rows);
    const invalidRowNumbers = collectInvalidRowNumbers(rowErrors);
    const validRows = parsed.rows.filter(
      (row) => !invalidRowNumbers.has(row.rowNumber),
    );

    const upsertResult = await this.guestRepository.upsertBatch(
      eventId,
      validRows.map((row) => mapImportRowToGuestInput(row)),
    );

    for (const change of upsertResult.companionSeparationChanges) {
      await this.recordCompanionSeparationAuditUseCase.execute({
        eventId,
        actorRole: 'admin',
        before: change.before,
        after: change.after,
      });
    }

    const suggestionsGenerated =
      await this.guestRepository.generateSuggestionsFromObservations(
        eventId,
        upsertResult.affectedGuestIds,
      );

    return {
      eventId,
      totalRows: parsed.rows.length,
      created: upsertResult.created,
      updated: upsertResult.updated,
      rejected: parsed.rows.length - validRows.length,
      categoriesEnsured: upsertResult.categoriesEnsured,
      suggestionsGenerated,
      errors: rowErrors,
    };
  }
}
