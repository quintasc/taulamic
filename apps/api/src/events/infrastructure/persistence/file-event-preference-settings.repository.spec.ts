import { ConfigService } from '@nestjs/config';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileEventPreferenceSettingsRepository } from './file-event-preference-settings.repository';

describe('FileEventPreferenceSettingsRepository', () => {
  let tempDir: string;
  let repository: FileEventPreferenceSettingsRepository;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'taulamic-events-'));
    repository = new FileEventPreferenceSettingsRepository({
      get: (_key: string, defaultValue: string) =>
        _key === 'events.dataDir' ? tempDir : defaultValue,
    } as ConfigService);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('devuelve modo colaborativo por defecto sin persistencia previa', async () => {
    const settings = await repository.getSettings('evt_123');

    expect(settings).toMatchObject({
      eventId: 'evt_123',
      currentMode: 'colaborativo',
      latestVersion: 0,
      revisions: [],
    });
  });

  it('persiste cambios versionados sin sobrescribir historial', async () => {
    const first = await repository.updateMode(
      'evt_123',
      'anfitrion_exclusivo',
      'admin',
    );
    const second = await repository.updateMode('evt_123', 'colaborativo', 'admin');

    expect(first.latestVersion).toBe(1);
    expect(second.latestVersion).toBe(2);
    expect(second.revisions).toHaveLength(2);
    expect(second.revisions[1]).toMatchObject({
      version: 2,
      mode: 'colaborativo',
      previousMode: 'anfitrion_exclusivo',
      actorRole: 'admin',
    });

    const raw = await readFile(
      join(tempDir, 'evt_123', 'preference-control-mode.json'),
      'utf8',
    );
    const store = JSON.parse(raw);
    expect(store.revisions).toHaveLength(2);
  });

  it('no duplica revision si el modo no cambia', async () => {
    await repository.updateMode('evt_123', 'anfitrion_exclusivo', 'admin');
    const unchanged = await repository.updateMode(
      'evt_123',
      'anfitrion_exclusivo',
      'admin',
    );

    expect(unchanged.latestVersion).toBe(1);
    expect(unchanged.revisions).toHaveLength(1);
  });
});
