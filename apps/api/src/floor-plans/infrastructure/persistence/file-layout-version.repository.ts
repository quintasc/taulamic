import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createLayoutVersion, toLayoutVersionSummary } from '../../domain/layout-version.mapper';
import {
  LayoutVersion,
  LayoutVersionStore,
  LayoutVersionSummary,
} from '../../domain/layout-version';
import {
  LayoutVersionRepositoryPort,
  SaveLayoutVersionInput,
} from './layout-version.repository.port';

@Injectable()
export class FileLayoutVersionRepository implements LayoutVersionRepositoryPort {
  constructor(private readonly configService: ConfigService) {}

  private uploadDir(): string {
    return this.configService.get<string>(
      'floorPlan.uploadDir',
      'uploads/floor-plans',
    );
  }

  private versionsPath(eventId: string, floorPlanId: string): string {
    return join(
      process.cwd(),
      this.uploadDir(),
      eventId,
      `${floorPlanId}.layout-versions.json`,
    );
  }

  async hasAnyVersion(eventId: string, floorPlanId: string): Promise<boolean> {
    const store = await this.loadStore(eventId, floorPlanId);
    return store !== null && store.versions.length > 0;
  }

  async saveVersion(input: SaveLayoutVersionInput): Promise<LayoutVersion> {
    const store =
      (await this.loadStore(input.eventId, input.floorPlanId)) ??
      ({
        floorPlanId: input.floorPlanId,
        eventId: input.eventId,
        latestVersion: 0,
        versions: [],
      } satisfies LayoutVersionStore);

    const nextVersion = store.latestVersion + 1;
    const layoutVersion = createLayoutVersion({
      version: nextVersion,
      floorPlanId: input.floorPlanId,
      eventId: input.eventId,
      configurationOrigin: input.configurationOrigin,
      confirmedAt: input.confirmedAt,
      tables: input.tables,
    });

    const updatedStore: LayoutVersionStore = {
      floorPlanId: input.floorPlanId,
      eventId: input.eventId,
      latestVersion: nextVersion,
      versions: [...store.versions, layoutVersion],
    };

    await writeFile(
      this.versionsPath(input.eventId, input.floorPlanId),
      JSON.stringify(updatedStore, null, 2),
      'utf8',
    );

    return layoutVersion;
  }

  async getLatestVersion(
    eventId: string,
    floorPlanId: string,
  ): Promise<LayoutVersion | null> {
    const store = await this.loadStore(eventId, floorPlanId);
    if (!store || store.versions.length === 0) {
      return null;
    }

    return store.versions[store.versions.length - 1] ?? null;
  }

  async getVersion(
    eventId: string,
    floorPlanId: string,
    version: number,
  ): Promise<LayoutVersion | null> {
    const store = await this.loadStore(eventId, floorPlanId);
    if (!store) {
      return null;
    }

    return store.versions.find((entry) => entry.version === version) ?? null;
  }

  async listVersionSummaries(
    eventId: string,
    floorPlanId: string,
  ): Promise<LayoutVersionSummary[]> {
    const store = await this.loadStore(eventId, floorPlanId);
    if (!store) {
      return [];
    }

    return store.versions.map(toLayoutVersionSummary);
  }

  private async loadStore(
    eventId: string,
    floorPlanId: string,
  ): Promise<LayoutVersionStore | null> {
    const path = this.versionsPath(eventId, floorPlanId);

    try {
      await access(path);
    } catch {
      return null;
    }

    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw) as LayoutVersionStore;
  }
}
