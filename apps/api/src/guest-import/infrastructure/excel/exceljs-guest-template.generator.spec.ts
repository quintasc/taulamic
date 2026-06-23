import ExcelJS from 'exceljs';
import {
  GUEST_TEMPLATE_DOWNLOAD_COLUMNS,
  GUEST_TEMPLATE_FILENAME,
  GUEST_TEMPLATE_INSTRUCTIONS_SHEET_NAME,
  GUEST_TEMPLATE_SHEET_NAME,
} from '../../domain/guest-template.schema';
import { ExcelJsGuestTemplateGenerator } from './exceljs-guest-template.generator';

describe('ExcelJsGuestTemplateGenerator', () => {
  const generator = new ExcelJsGuestTemplateGenerator();

  it('genera xlsx con hoja invitados, encabezados oficiales e instrucciones', async () => {
    const result = await generator.generate();

    expect(result.filename).toBe(GUEST_TEMPLATE_FILENAME);
    expect(result.mimeType).toContain('spreadsheetml');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(result.buffer);

    const guestsSheet = workbook.getWorksheet(GUEST_TEMPLATE_SHEET_NAME);
    expect(guestsSheet).toBeDefined();

    const headerRow = guestsSheet!.getRow(1).values as Array<string | undefined>;
    const headers = headerRow.slice(1);
    expect(headers).toEqual([...GUEST_TEMPLATE_DOWNLOAD_COLUMNS]);

    expect(guestsSheet!.rowCount).toBeGreaterThanOrEqual(3);

    const instructionsSheet = workbook.getWorksheet(
      GUEST_TEMPLATE_INSTRUCTIONS_SHEET_NAME,
    );
    expect(instructionsSheet).toBeDefined();
    expect(instructionsSheet!.getCell('A1').value).toContain('Plantilla oficial');
  });
});
