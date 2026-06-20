import { ConfigService } from '@nestjs/config';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileEventGovernanceAuditRepository } from './file-event-governance-audit.repository';

describe('FileEventGovernanceAuditRepository', () => {
  let tempDir: string;
  let repository: FileEventGovernanceAuditRepository;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'taulame-governance-audit-'));
    repository = new FileEventGovernanceAuditRepository({
      get: (_key: string, defaultValue: string) =>
        _key === 'events.dataDir' ? tempDir : defaultValue,
    } as ConfigService);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('registra cambios de modo y excepciones en orden cronologico', async () => {
    await repository.appendPreferenceModeChange({
      eventId: 'evt_123',
      actorRole: 'admin',
      before: { mode: null, version: 0 },
      after: { mode: 'anfitrion_exclusivo', version: 1 },
    });

    await repository.appendCompanionSeparationChange({
      eventId: 'evt_123',
      actorRole: 'admin',
      before: {
        groupKey: 'PAREJA_001',
        keepTogether: true,
        reason: null,
        origin: null,
      },
      after: {
        groupKey: 'PAREJA_001',
        keepTogether: false,
        reason: 'Conflicto familiar',
        origin: 'admin',
      },
    });

    const entries = await repository.listEntries('evt_123');

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      type: 'preference_mode_changed',
      actorRole: 'admin',
      after: { mode: 'anfitrion_exclusivo', version: 1 },
    });
    expect(entries[1]).toMatchObject({
      type: 'companion_separation_changed',
      after: {
        groupKey: 'PAREJA_001',
        keepTogether: false,
        origin: 'admin',
      },
    });

    const raw = await readFile(
      join(tempDir, 'evt_123', 'governance-audit.json'),
      'utf8',
    );
    const store = JSON.parse(raw);
    expect(store.entries).toHaveLength(2);
  });
});
