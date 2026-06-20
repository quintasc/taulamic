import type { GuestImportRow } from './guest-import-row';
import {
  validateGuestImportHeaders,
  validateGuestImportRows,
} from './guest-row.validator';

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
          observaciones: '',
          acompanante_key: '',
          separar_acompanante: 'maybe',
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
      observaciones: '',
      acompanante_key: '',
      separar_acompanante: '',
      preferencia_control: '',
      ...overrides,
    },
  };
}
