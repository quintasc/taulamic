import { ImportGuestBatchUseCase } from './import-guest-batch.use-case';
import type { GuestImportParserPort } from '../infrastructure/excel/guest-import.parser.port';
import type { GuestRepositoryPort } from '../infrastructure/persistence/guest.repository.port';

describe('ImportGuestBatchUseCase', () => {
  let parser: jest.Mocked<GuestImportParserPort>;
  let repository: jest.Mocked<GuestRepositoryPort>;
  let useCase: ImportGuestBatchUseCase;

  beforeEach(() => {
    parser = {
      parse: jest.fn(),
    };
    repository = {
      upsertBatch: jest.fn(),
      generateSuggestionsFromObservations: jest.fn(),
      listSuggestions: jest.fn(),
      updatePendingSuggestion: jest.fn(),
      acceptSuggestion: jest.fn(),
      rejectSuggestion: jest.fn(),
      listGuestRestrictions: jest.fn(),
      addManualRestriction: jest.fn(),
      listGuests: jest.fn(),
      updateCompanionGroupSeparation: jest.fn(),
    };
    useCase = new ImportGuestBatchUseCase(parser, repository, {
      execute: jest.fn(),
    } as never);
  });

  it('rechaza importacion con errores estructurales sin persistir', async () => {
    parser.parse.mockResolvedValue({
      rows: [],
      structuralErrors: [
        {
          row: 1,
          field: 'invitados',
          code: 'XLS-001',
          message: 'Encabezado faltante',
        },
      ],
    });

    const result = await useCase.execute('evt_123', {
      originalname: 'invitados.xlsx',
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 100,
      buffer: Buffer.from('xlsx'),
    });

    expect(result.created).toBe(0);
    expect(repository.upsertBatch).not.toHaveBeenCalled();
    expect(result.errors[0]?.code).toBe('XLS-001');
    expect(result.detailMetaByCorreo).toEqual({});
  });

  it('importa filas validas y reporta rechazadas', async () => {
    parser.parse.mockResolvedValue({
      rows: [
        {
          rowNumber: 2,
          values: {
            nombre: 'Ana',
            correo: 'ana@ejemplo.com',
            telefono: '+34600111222',
            direccion: '',
            categoria_1: 'Familia',
            categoria_2: '',
            menu_especial: 'true',
            movilidad_reducida: '',
            notas_internas: 'Sin gluten',
            acompanante_key: '',
            separar_acompanante: '',
          },
        },
        {
          rowNumber: 3,
          values: {
            nombre: '',
            correo: 'mal',
            telefono: '123',
            direccion: '',
            categoria_1: '',
            categoria_2: '',
            menu_especial: '',
            movilidad_reducida: '',
            notas_internas: '',
            acompanante_key: '',
            separar_acompanante: '',
          },
        },
      ],
      structuralErrors: [],
    });
    repository.upsertBatch.mockResolvedValue({
      created: 1,
      updated: 0,
      categoriesEnsured: 1,
      affectedGuestIds: ['guest-1'],
      companionSeparationChanges: [],
    });
    repository.generateSuggestionsFromObservations.mockResolvedValue(0);

    const result = await useCase.execute('evt_123', {
      originalname: 'invitados.xlsx',
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 100,
      buffer: Buffer.from('xlsx'),
    });

    expect(result.created).toBe(1);
    expect(result.rejected).toBe(1);
    expect(result.totalRows).toBe(2);
    expect(repository.upsertBatch).toHaveBeenCalledTimes(1);
    expect(result.detailMetaByCorreo).toEqual({
      'ana@ejemplo.com': {
        dietaryAlert: true,
        mobilityAlert: false,
        notes: 'Sin gluten',
      },
    });
  });
});
