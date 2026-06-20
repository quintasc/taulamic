import { ConfigService } from '@nestjs/config';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileGuestRepository } from './file-guest.repository';

describe('FileGuestRepository', () => {
  let tempDir: string;
  let repository: FileGuestRepository;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'taulamic-guests-'));
    repository = new FileGuestRepository({
      get: (_key: string, defaultValue: string) =>
        _key === 'guestImport.dataDir' ? tempDir : defaultValue,
    } as ConfigService);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('crea invitados y normaliza categorias por evento', async () => {
    const first = await repository.upsertBatch('evt_123', [
      {
        nombre: 'Ana Garcia',
        correo: 'ana@ejemplo.com',
        telefono: '+34600111222',
        direccion: '',
        categoryNames: ['Familia novia', '  familia novia  '],
        observaciones: '',
        acompananteKey: '',
        separarAcompanante: null,
        preferenciaControl: null,
      },
    ]);

    expect(first).toMatchObject({ created: 1, updated: 0, categoriesEnsured: 1 });

    const second = await repository.upsertBatch('evt_123', [
      {
        nombre: 'Ana Garcia Lopez',
        correo: 'ana@ejemplo.com',
        telefono: '+34600999888',
        direccion: 'Madrid',
        categoryNames: ['Familia novia'],
        observaciones: 'Nota',
        acompananteKey: 'PAREJA_001',
        separarAcompanante: false,
        preferenciaControl: 'colaborativo',
      },
    ]);

    expect(second).toMatchObject({ created: 0, updated: 1, categoriesEnsured: 0 });

    const raw = await readFile(
      join(tempDir, 'evt_123', 'event-guests.json'),
      'utf8',
    );
    const store = JSON.parse(raw);

    expect(store.guests).toHaveLength(1);
    expect(store.categories).toHaveLength(1);
    expect(store.guests[0]).toMatchObject({
      nombre: 'Ana Garcia Lopez',
      telefono: '+34600999888',
      correo: 'ana@ejemplo.com',
      restrictions: [],
    });
  });

  it('genera sugerencias desde observaciones sin aplicar restricciones', async () => {
    await repository.upsertBatch('evt_123', [
      {
        nombre: 'Ana Garcia',
        correo: 'ana@ejemplo.com',
        telefono: '+34600111222',
        direccion: '',
        categoryNames: [],
        observaciones: 'Intolerancia lactosa',
        acompananteKey: '',
        separarAcompanante: null,
        preferenciaControl: null,
      },
    ]);

    const upsert = await repository.upsertBatch('evt_123', [
      {
        nombre: 'Ana Garcia',
        correo: 'ana@ejemplo.com',
        telefono: '+34600111222',
        direccion: '',
        categoryNames: [],
        observaciones: 'No sentar con Juan Perez',
        acompananteKey: '',
        separarAcompanante: null,
        preferenciaControl: null,
      },
    ]);

    const generated = await repository.generateSuggestionsFromObservations(
      'evt_123',
      upsert.affectedGuestIds,
    );

    expect(generated).toBe(1);

    const pending = await repository.listSuggestions('evt_123');
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({
      kind: 'incompatibilidad',
      targetHint: 'Juan Perez',
      status: 'pending',
    });

    const raw = await readFile(
      join(tempDir, 'evt_123', 'event-guests.json'),
      'utf8',
    );
    const store = JSON.parse(raw);
    expect(store.guests[0].restrictions).toEqual([]);
  });

  it('acepta sugerencia y aplica restriccion con origen trazado', async () => {
    const upsert = await repository.upsertBatch('evt_123', [
      {
        nombre: 'Ana Garcia',
        correo: 'ana@ejemplo.com',
        telefono: '+34600111222',
        direccion: '',
        categoryNames: [],
        observaciones: 'Prefiere sentar con Maria Lopez',
        acompananteKey: '',
        separarAcompanante: null,
        preferenciaControl: null,
      },
    ]);

    await repository.generateSuggestionsFromObservations(
      'evt_123',
      upsert.affectedGuestIds,
    );

    const [suggestion] = await repository.listSuggestions('evt_123');
    const accepted = await repository.acceptSuggestion(
      'evt_123',
      suggestion!.id,
    );

    expect(accepted.status).toBe('accepted');

    const raw = await readFile(
      join(tempDir, 'evt_123', 'event-guests.json'),
      'utf8',
    );
    const store = JSON.parse(raw);

    expect(store.guests[0].restrictions).toEqual([
      expect.objectContaining({
        kind: 'afinidad',
        targetHint: 'Maria Lopez',
        origin: 'suggested',
        suggestionId: suggestion!.id,
      }),
    ]);
  });

  it('rechaza sugerencia sin aplicar restriccion', async () => {
    const upsert = await repository.upsertBatch('evt_123', [
      {
        nombre: 'Ana Garcia',
        correo: 'ana@ejemplo.com',
        telefono: '+34600111222',
        direccion: '',
        categoryNames: [],
        observaciones: 'Intolerancia lactosa',
        acompananteKey: '',
        separarAcompanante: null,
        preferenciaControl: null,
      },
    ]);

    await repository.generateSuggestionsFromObservations(
      'evt_123',
      upsert.affectedGuestIds,
    );

    const [suggestion] = await repository.listSuggestions('evt_123');
    const rejected = await repository.rejectSuggestion(
      'evt_123',
      suggestion!.id,
    );

    expect(rejected.status).toBe('rejected');

    const raw = await readFile(
      join(tempDir, 'evt_123', 'event-guests.json'),
      'utf8',
    );
    const store = JSON.parse(raw);
    expect(store.guests[0].restrictions).toEqual([]);
  });
});
