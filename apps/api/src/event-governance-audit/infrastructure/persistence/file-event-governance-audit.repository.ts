import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import type {
  GovernanceAuditEntry,
  RecordCompanionSeparationAuditInput,
  RecordDistributionPlacementAuditInput,
  RecordPreferenceModeAuditInput,
} from '../../domain/governance-audit-entry';
import type { EventGovernanceAuditRepositoryPort } from './event-governance-audit.repository.port';

type GovernanceAuditStore = {
  eventId: string;
  entries: GovernanceAuditEntry[];
};

@Injectable()
export class FileEventGovernanceAuditRepository
  implements EventGovernanceAuditRepositoryPort
{
  constructor(private readonly configService: ConfigService) {}

  private dataDir(): string {
    return this.configService.get<string>(
      'events.dataDir',
      'uploads/events',
    );
  }

  private storePath(eventId: string): string {
    const base = this.dataDir();
    const root = isAbsolute(base) ? base : join(process.cwd(), base);
    return join(root, eventId, 'governance-audit.json');
  }

  appendPreferenceModeChange(
    input: RecordPreferenceModeAuditInput,
  ): Promise<GovernanceAuditEntry> {
    return this.appendEntry({
      eventId: input.eventId,
      type: 'preference_mode_changed',
      actorRole: input.actorRole,
      changedAt: new Date().toISOString(),
      before: input.before,
      after: input.after,
    });
  }

  appendCompanionSeparationChange(
    input: RecordCompanionSeparationAuditInput,
  ): Promise<GovernanceAuditEntry> {
    return this.appendEntry({
      eventId: input.eventId,
      type: 'companion_separation_changed',
      actorRole: input.actorRole,
      changedAt: new Date().toISOString(),
      before: input.before,
      after: input.after,
    });
  }

  appendDistributionPlacementChange(
    input: RecordDistributionPlacementAuditInput,
  ): Promise<GovernanceAuditEntry> {
    return this.appendEntry({
      eventId: input.eventId,
      type: 'distribution_placement_changed',
      actorRole: input.actorRole,
      changedAt: new Date().toISOString(),
      before: input.before,
      after: input.after,
    });
  }

  async listEntries(eventId: string): Promise<GovernanceAuditEntry[]> {
    const store = await this.loadStore(eventId);
    return store?.entries ?? [];
  }

  private async appendEntry(
    draft: Omit<GovernanceAuditEntry, 'id'>,
  ): Promise<GovernanceAuditEntry> {
    const store = (await this.loadStore(draft.eventId)) ?? {
      eventId: draft.eventId,
      entries: [],
    };

    const entry: GovernanceAuditEntry = {
      id: randomUUID(),
      ...draft,
    };

    store.entries.push(entry);
    await this.saveStore(store);
    return entry;
  }

  private async loadStore(
    eventId: string,
  ): Promise<GovernanceAuditStore | null> {
    const path = this.storePath(eventId);

    try {
      const raw = await readFile(path, 'utf8');
      const parsed = JSON.parse(raw) as GovernanceAuditStore;
      return {
        eventId: parsed.eventId,
        entries: parsed.entries ?? [],
      };
    } catch {
      return null;
    }
  }

  private async saveStore(store: GovernanceAuditStore): Promise<void> {
    const path = this.storePath(store.eventId);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(store, null, 2), 'utf8');
  }
}
