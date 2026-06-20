import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import {
  DEFAULT_PREFERENCE_CONTROL_MODE,
  type EventPreferenceControlSettings,
  type PreferenceControlMode,
  type PreferenceControlModeRevision,
} from '../../domain/preference-control-mode';
import type { EventPreferenceSettingsRepositoryPort } from './event-preference-settings.repository.port';

type PreferenceControlModeStore = EventPreferenceControlSettings;

@Injectable()
export class FileEventPreferenceSettingsRepository
  implements EventPreferenceSettingsRepositoryPort
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
    return join(root, eventId, 'preference-control-mode.json');
  }

  async getSettings(eventId: string): Promise<EventPreferenceControlSettings> {
    const store = await this.loadStore(eventId);
    if (store) {
      return store;
    }

    const now = new Date().toISOString();
    return {
      eventId,
      currentMode: DEFAULT_PREFERENCE_CONTROL_MODE,
      latestVersion: 0,
      updatedAt: now,
      revisions: [],
    };
  }

  async updateMode(
    eventId: string,
    mode: PreferenceControlMode,
  ): Promise<EventPreferenceControlSettings> {
    const store = (await this.loadStore(eventId)) ?? {
      eventId,
      currentMode: DEFAULT_PREFERENCE_CONTROL_MODE,
      latestVersion: 0,
      updatedAt: new Date().toISOString(),
      revisions: [],
    };

    if (store.currentMode === mode && store.latestVersion > 0) {
      return store;
    }

    const now = new Date().toISOString();
    const nextVersion = store.latestVersion + 1;
    const revision: PreferenceControlModeRevision = {
      version: nextVersion,
      mode,
      previousMode: store.latestVersion > 0 ? store.currentMode : null,
      changedAt: now,
    };

    const updated: PreferenceControlModeStore = {
      eventId,
      currentMode: mode,
      latestVersion: nextVersion,
      updatedAt: now,
      revisions: [...store.revisions, revision],
    };

    await this.saveStore(updated);
    return updated;
  }

  async listRevisions(
    eventId: string,
  ): Promise<PreferenceControlModeRevision[]> {
    const store = await this.getSettings(eventId);
    return store.revisions;
  }

  private async loadStore(
    eventId: string,
  ): Promise<PreferenceControlModeStore | null> {
    const path = this.storePath(eventId);

    try {
      const raw = await readFile(path, 'utf8');
      const parsed = JSON.parse(raw) as PreferenceControlModeStore;
      return {
        ...parsed,
        revisions: parsed.revisions ?? [],
      };
    } catch {
      return null;
    }
  }

  private async saveStore(store: PreferenceControlModeStore): Promise<void> {
    const path = this.storePath(store.eventId);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(store, null, 2), 'utf8');
  }
}
