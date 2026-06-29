import type { GuestImportRow } from './guest-import-row';
import { mapImportRowToGuestInput } from './guest-import.mapper';

describe('guest-import.mapper', () => {
  it('mapea alertas y notas internas de plantilla', () => {
    const mapped = mapImportRowToGuestInput(
      buildRow({
        menu_especial: 'X',
        movilidad_reducida: 'Si',
        notas_internas: 'Sin gluten',
      }),
    );

    expect(mapped.guest.observaciones).toBe('Sin gluten');
    expect(mapped.detailMeta).toEqual({
      dietaryAlert: true,
      mobilityAlert: true,
      notes: 'Sin gluten',
    });
    expect(mapped.guest.preferenciaControl).toBeNull();
  });

  it('mapea notas internas para drawer e IA de sugerencias', () => {
    const mapped = mapImportRowToGuestInput(
      buildRow({
        notas_internas: 'No sentar con Juan Perez',
      }),
    );

    expect(mapped.guest.observaciones).toBe('No sentar con Juan Perez');
    expect(mapped.detailMeta.notes).toBe('No sentar con Juan Perez');
  });

  it('celda vacia en alertas equivale a no', () => {
    const mapped = mapImportRowToGuestInput(buildRow());

    expect(mapped.detailMeta.dietaryAlert).toBe(false);
    expect(mapped.detailMeta.mobilityAlert).toBe(false);
  });

  it('acepta true/false en marcas de alerta', () => {
    const mapped = mapImportRowToGuestInput(
      buildRow({ menu_especial: 'true', movilidad_reducida: 'false' }),
    );

    expect(mapped.detailMeta.dietaryAlert).toBe(true);
    expect(mapped.detailMeta.mobilityAlert).toBe(false);
  });
});

function buildRow(
  overrides: Partial<GuestImportRow['values']> = {},
): GuestImportRow {
  return {
    rowNumber: 2,
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
      ...overrides,
    },
  };
}
