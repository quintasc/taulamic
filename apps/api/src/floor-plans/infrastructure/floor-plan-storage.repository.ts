import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { access, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ConfirmedLayout } from '../domain/confirmed-layout';
import { DetectionResult } from '../domain/detection-result';
import { LayoutDraft } from '../domain/layout-draft';

export type StoredFloorPlanFile = {
  id: string;
  eventId: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  absolutePath: string;
};

@Injectable()
export class FloorPlanStorageRepository {
  constructor(private readonly configService: ConfigService) {}

  private uploadDir(): string {
    return this.configService.get<string>(
      'floorPlan.uploadDir',
      'uploads/floor-plans',
    );
  }

  private eventDir(eventId: string): string {
    return join(process.cwd(), this.uploadDir(), eventId);
  }

  async findUploadedFile(
    eventId: string,
    floorPlanId: string,
  ): Promise<StoredFloorPlanFile | null> {
    const eventDir = this.eventDir(eventId);
    let entries: string[];

    try {
      entries = await readdir(eventDir);
    } catch {
      return null;
    }

    const matchedEntry = entries.find((entry) =>
      entry.startsWith(`${floorPlanId}-`),
    );

    if (!matchedEntry) {
      return null;
    }

    const absolutePath = join(eventDir, matchedEntry);
    const buffer = await readFile(absolutePath);
    const originalName = matchedEntry.slice(floorPlanId.length + 1);
    const mimeType = this.inferMimeType(originalName);

    return {
      id: floorPlanId,
      eventId,
      originalName,
      mimeType,
      buffer,
      absolutePath,
    };
  }

  async saveDetectionResult(
    eventId: string,
    floorPlanId: string,
    result: DetectionResult,
  ): Promise<void> {
    await writeFile(
      this.detectionPath(eventId, floorPlanId),
      JSON.stringify(result, null, 2),
      'utf8',
    );
  }

  async loadDetectionResult(
    eventId: string,
    floorPlanId: string,
  ): Promise<DetectionResult | null> {
    return this.readJson<DetectionResult>(
      this.detectionPath(eventId, floorPlanId),
    );
  }

  async loadDraft(
    eventId: string,
    floorPlanId: string,
  ): Promise<LayoutDraft | null> {
    return this.readJson<LayoutDraft>(this.draftPath(eventId, floorPlanId));
  }

  async saveDraft(
    eventId: string,
    floorPlanId: string,
    draft: LayoutDraft,
  ): Promise<void> {
    await writeFile(
      this.draftPath(eventId, floorPlanId),
      JSON.stringify(draft, null, 2),
      'utf8',
    );
  }

  async loadConfirmed(
    eventId: string,
    floorPlanId: string,
  ): Promise<ConfirmedLayout | null> {
    return this.readJson<ConfirmedLayout>(
      this.confirmedPath(eventId, floorPlanId),
    );
  }

  async saveConfirmed(
    eventId: string,
    floorPlanId: string,
    confirmed: ConfirmedLayout,
  ): Promise<void> {
    await writeFile(
      this.confirmedPath(eventId, floorPlanId),
      JSON.stringify(confirmed, null, 2),
      'utf8',
    );
  }

  private detectionPath(eventId: string, floorPlanId: string): string {
    return join(this.eventDir(eventId), `${floorPlanId}.detection.json`);
  }

  private draftPath(eventId: string, floorPlanId: string): string {
    return join(this.eventDir(eventId), `${floorPlanId}.draft.json`);
  }

  private confirmedPath(eventId: string, floorPlanId: string): string {
    return join(this.eventDir(eventId), `${floorPlanId}.confirmed.json`);
  }

  private async readJson<T>(absolutePath: string): Promise<T | null> {
    try {
      await access(absolutePath);
    } catch {
      return null;
    }

    const raw = await readFile(absolutePath, 'utf8');
    return JSON.parse(raw) as T;
  }

  private inferMimeType(originalName: string): string {
    const lower = originalName.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return 'application/pdf';
    }
    if (lower.endsWith('.png')) {
      return 'image/png';
    }
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
    return 'application/octet-stream';
  }
}
