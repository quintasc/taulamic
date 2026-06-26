/**
 * Regenera docs/pilot/invitados-validacion-manual.xlsx alineado con
 * GUEST_TEMPLATE_DOWNLOAD_COLUMNS (sin preferencia_control).
 */
import ExcelJS from 'exceljs';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const COLUMNS = [
  'nombre',
  'correo',
  'telefono',
  'direccion',
  'categoria_1',
  'categoria_2',
  'observaciones',
  'acompanante_key',
  'separar_acompanante',
];

const ROWS = [
  [
    'Ana Garcia Lopez',
    'ana.garcia@ejemplo.com',
    '+34600111222',
    '',
    'Familia novia',
    '',
    'Intolerancia lactosa',
    'PAREJA_001',
    'false',
  ],
  [
    'Luis Martinez Ruiz',
    'luis.martinez@ejemplo.com',
    '+34600333444',
    '',
    'Familia novia',
    'Pareja',
    '',
    'PAREJA_001',
    'false',
  ],
  [
    'Maria Santos',
    'maria.santos@ejemplo.com',
    '+34600555666',
    '',
    'Familia novio',
    '',
    '',
    'PAREJA_002',
    'false',
  ],
  [
    'Pedro Ruiz',
    'pedro.ruiz@ejemplo.com',
    '+34600777888',
    '',
    'Familia novio',
    '',
    '',
    'PAREJA_002',
    'false',
  ],
];

const INSTRUCTIONS = [
  'Plantilla de validacion manual piloto Taulamic (4 invitados, 2 parejas).',
  'Columnas alineadas con la plantilla descargable desde la UI (sin preferencia_control).',
  'Modo colaborativo / anfitrion exclusivo: pantalla Preferencias del evento.',
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(
  __dirname,
  '../../../docs/pilot/invitados-validacion-manual.xlsx',
);

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Taulamic';

const guestsSheet = workbook.addWorksheet('invitados');
guestsSheet.addRow(COLUMNS);
for (const row of ROWS) {
  guestsSheet.addRow(row);
}
guestsSheet.getRow(1).font = { bold: true };
guestsSheet.views = [{ state: 'frozen', ySplit: 1 }];

const instructionsSheet = workbook.addWorksheet('instrucciones');
instructionsSheet.getColumn(1).width = 90;
for (const line of INSTRUCTIONS) {
  instructionsSheet.addRow([line]);
}

const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
await writeFile(outputPath, buffer);
console.log(`Escrito: ${outputPath}`);
