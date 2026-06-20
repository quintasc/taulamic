import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DetectionResult } from '../domain/detection-result';

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

  async findUploadedFile(
    eventId: string,
    floorPlanId: string,
  ): Promise<StoredFloorPlanFile | null> {
    const eventDir = join(process.cwd(), this.uploadDir(), eventId);
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
    const detectionPath = join(
      process.cwd(),
      this.uploadDir(),
      eventId,
      `${floorPlanId}.detection.json`,
    );
    await writeFile(detectionPath, JSON.stringify(result, null, 2), 'utf8');
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
