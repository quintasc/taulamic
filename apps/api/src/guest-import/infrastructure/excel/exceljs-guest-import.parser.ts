import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import {
  GUEST_TEMPLATE_COLUMNS,
  GUEST_TEMPLATE_SHEET_NAME,
  type GuestTemplateColumn,
} from '../../domain/guest-template.schema';
import type { GuestImportRow } from '../../domain/guest-import-row';
import {
  cellToString,
  isGuestImportRowEmpty,
  validateGuestImportHeaders,
} from '../../domain/guest-row.validator';
import type {
  GuestImportParseResult,
  GuestImportParserPort,
} from './guest-import.parser.port';

@Injectable()
export class ExcelJsGuestImportParser implements GuestImportParserPort {
  async parse(buffer: Buffer): Promise<GuestImportParseResult> {
    const workbook = new ExcelJS.Workbook();
    // ExcelJS typings expect a legacy Buffer shape; Node's Buffer is compatible at runtime.
    await workbook.xlsx.load(buffer as never);

    const sheet = workbook.getWorksheet(GUEST_TEMPLATE_SHEET_NAME);
    if (!sheet) {
      return {
        rows: [],
        structuralErrors: [
          {
            row: 0,
            field: GUEST_TEMPLATE_SHEET_NAME,
            code: 'XLS-001',
            message: `Falta la hoja obligatoria "${GUEST_TEMPLATE_SHEET_NAME}".`,
          },
        ],
      };
    }

    const headerRow = sheet.getRow(1);
    const headers: string[] = [];
    headerRow.eachCell({ includeEmpty: false }, (cell) => {
      headers.push(cellToString(cell.value));
    });

    const structuralErrors = validateGuestImportHeaders(headers);
    if (structuralErrors.length > 0) {
      return { rows: [], structuralErrors };
    }

    const columnIndexes = this.mapColumnIndexes(headerRow);
    const rows: GuestImportRow[] = [];

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const excelRow = sheet.getRow(rowNumber);
      const values = {} as Record<GuestTemplateColumn, string>;

      for (const column of GUEST_TEMPLATE_COLUMNS) {
        const columnIndex = columnIndexes[column];
        values[column] =
          columnIndex !== undefined
            ? cellToString(excelRow.getCell(columnIndex).value)
            : '';
      }

      if (isGuestImportRowEmpty(values)) {
        continue;
      }

      rows.push({ rowNumber, values });
    }

    return { rows, structuralErrors: [] };
  }

  private mapColumnIndexes(
    headerRow: ExcelJS.Row,
  ): Record<GuestTemplateColumn, number> {
    const indexes = {} as Record<GuestTemplateColumn, number>;

    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = cellToString(cell.value).toLowerCase();
      if ((GUEST_TEMPLATE_COLUMNS as readonly string[]).includes(header)) {
        indexes[header as GuestTemplateColumn] = colNumber;
      }
    });

    return indexes;
  }
}
