import { Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import {
  GUEST_TEMPLATE_COLUMNS,
  GUEST_TEMPLATE_EXAMPLE_ROWS,
  GUEST_TEMPLATE_FILENAME,
  GUEST_TEMPLATE_INSTRUCTIONS,
  GUEST_TEMPLATE_INSTRUCTIONS_SHEET_NAME,
  GUEST_TEMPLATE_SHEET_NAME,
} from '../../domain/guest-template.schema';
import type {
  GeneratedGuestTemplate,
  GuestTemplateGeneratorPort,
} from './guest-template.generator.port';

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Injectable()
export class ExcelJsGuestTemplateGenerator implements GuestTemplateGeneratorPort {
  async generate(): Promise<GeneratedGuestTemplate> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Taulame';
    workbook.created = new Date();

    const guestsSheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
    guestsSheet.addRow([...GUEST_TEMPLATE_COLUMNS]);

    for (const exampleRow of GUEST_TEMPLATE_EXAMPLE_ROWS) {
      guestsSheet.addRow(
        GUEST_TEMPLATE_COLUMNS.map((column) => exampleRow[column]),
      );
    }

    guestsSheet.getRow(1).font = { bold: true };
    guestsSheet.views = [{ state: 'frozen', ySplit: 1 }];

    const instructionsSheet = workbook.addWorksheet(
      GUEST_TEMPLATE_INSTRUCTIONS_SHEET_NAME,
    );
    instructionsSheet.getColumn(1).width = 90;

    for (const line of GUEST_TEMPLATE_INSTRUCTIONS) {
      instructionsSheet.addRow([line]);
    }

    instructionsSheet.getCell('A1').font = { bold: true };

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    return {
      buffer,
      filename: GUEST_TEMPLATE_FILENAME,
      mimeType: XLSX_MIME_TYPE,
    };
  }
}
