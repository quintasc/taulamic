import type { GuestImportRow } from './guest-import-row';
import {
  validateGuestImportHeaders,
  validateGuestImportRows,
} from './guest-row.validator';
import {
  GUEST_TEMPLATE_DOWNLOAD_COLUMNS,
  GUEST_TEMPLATE_LEGACY_IMPORT_HEADERS,
} from './guest-template.schema';

describe('guest-row.validator', () => {
  it('detecta encabezados faltantes (XLS-001)', () => {
    const errors = validateGuestImportHeaders(['nombre', 'correo']);

    expect(errors).toEqual([
      expect.objectContaining({
        code: 'XLS-001',
        field: 'invitados',
      }),
    ]);
  });

  it('acepta plantilla nueva y legacy con observaciones', () => {
    expect(
      validateGuestImportHeaders([...GUEST_TEMPLATE_DOWNLOAD_COLUMNS]),
    ).toEqual([]);
    expect(
      validateGuestImportHeaders([...GUEST_TEMPLATE_LEGACY_IMPORT_HEADERS]),
    ).toEqual([]);
  });

  it('detecta correo, telefono y obligatorios por fila', () => {
    const rows: GuestImportRow[] = [
      {
        rowNumber: 2,
        values: {
          nombre: '',
          correo: 'no-es-correo',
          telefono: '123',
          direccion: '',
          categoria_1: '',
          categoria_2: '',
          menu_especial: '',
          movilidad_reducida: '',
          notas_internas: '',
          acompanante_key: '',
          separar_acompanante: 'maybe',
          observaciones: '',
          preferencia_control: '',
        },
      },
    ];

    const errors = validateGuestImportRows(rows);
    const codes = errors.map((error) => error.code);

    expect(codes).toEqual(
      expect.arrayContaining(['XLS-007', 'XLS-002', 'XLS-003', 'XLS-005']),
    );
  });

  it('detecta duplicados por correo (XLS-004)', () => {
    const rows: GuestImportRow[] = [
      buildRow(2, { correo: 'ana@ejemplo.com', telefono: '+34600111222' }),
      buildRow(3, { correo: 'ana@ejemplo.com', telefono: '+34600333444' }),
    ];

    const errors = validateGuestImportRows(rows);

    expect(errors).toEqual([
      expect.objectContaining({
        row: 3,
        field: 'correo',
        code: 'XLS-004',
      }),
    ]);
  });

  it('detecta acompanante_key inconsistente (XLS-006)', () => {
    const rows: GuestImportRow[] = [
      buildRow(2, {
        acompanante_key: 'PAREJA_001',
        separar_acompanante: 'false',
      }),
      buildRow(3, {
        acompanante_key: 'PAREJA_001',
        separar_acompanante: 'true',
      }),
    ];

    const errors = validateGuestImportRows(rows);

    expect(errors.some((error) => error.code === 'XLS-006')).toBe(true);
  });

  it('rechaza menu_especial invalido (XLS-005)', () => {
    const rows: GuestImportRow[] = [
      buildRow(2, { menu_especial: 'quizas' }),
    ];

    const errors = validateGuestImportRows(rows);

    expect(errors).toEqual([
      expect.objectContaining({
        row: 2,
        field: 'menu_especial',
        code: 'XLS-005',
        message: expect.stringContaining('X'),
      }),
    ]);
  });
});

function buildRow(
  rowNumber: number,
  overrides: Partial<GuestImportRow['values']> = {},
): GuestImportRow {
  return {
    rowNumber,
    values: {
      nombre: 'Ana Garcia',
      correo: 'ana@ejemplo.com',
      telefono: '+34600111222',
      direccion: '',
      categoria_1: '',
      categoria_2: '',
      menu_especial: '',
      movilidad_reducida: '',
      notas_internas: '',
      acompanante_key: '',
      separar_acompanante: '',
      observaciones: '',
      preferencia_control: '',
      ...overrides,
    },
  };
}
