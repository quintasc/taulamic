import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DetectedTable } from '../domain/detected-table';
import { DetectionResult } from '../domain/detection-result';
import { DetectionStatus } from '../domain/detection-status';
import { normalizeTableShape } from '../domain/table-shape.normalizer';
import { FloorPlanStorageRepository } from '../infrastructure/floor-plan-storage.repository';
import { TABLE_DETECTION_PORT } from '../infrastructure/detection/table-detection.port';
import type {
  RawDetectedTableCandidate,
  TableDetectionPort,
} from '../infrastructure/detection/table-detection.port';

const DEFAULT_CAPACITY = 8;
const MIN_PARTIAL_CONFIDENCE = 0.45;
const MIN_COMPLETED_CONFIDENCE = 0.65;

@Injectable()
export class DetectTablesUseCase {
  constructor(
    private readonly storage: FloorPlanStorageRepository,
    @Inject(TABLE_DETECTION_PORT)
    private readonly detectionPort: TableDetectionPort,
  ) {}

  async execute(eventId: string, floorPlanId: string): Promise<DetectionResult> {
    const uploaded = await this.storage.findUploadedFile(eventId, floorPlanId);

    if (!uploaded) {
      throw new NotFoundException({
        code: 'FLOOR_PLAN_NOT_FOUND',
        message: 'No se encontro el plano indicado para este evento.',
        details: { eventId, floorPlanId },
      });
    }

    const candidates = this.detectionPort.detect({
      buffer: uploaded.buffer,
      mimeType: uploaded.mimeType,
      originalName: uploaded.originalName,
    });

    const tables = candidates.map((candidate) =>
      this.toDetectedTable(candidate),
    );
    const status = this.resolveStatus(tables);

    const result: DetectionResult = {
      floorPlanId,
      eventId,
      status,
      tables,
      manualFallbackAvailable: true,
      detectedAt: new Date().toISOString(),
      message: this.buildMessage(status),
    };

    await this.storage.saveDetectionResult(eventId, floorPlanId, result);
    return result;
  }

  private toDetectedTable(candidate: RawDetectedTableCandidate): DetectedTable {
    const normalizedShape = normalizeTableShape(candidate.rawShape);
    let confidence = 0.35;

    if (candidate.hasExplicitCapacity) {
      confidence += 0.25;
    }
    if (normalizedShape.matched) {
      confidence += 0.25;
    } else if (candidate.hasExplicitShape) {
      confidence += 0.1;
    }
    if (candidate.label) {
      confidence += 0.15;
    }

    return {
      id: randomUUID(),
      label: candidate.label,
      shape: normalizedShape.shape,
      estimatedCapacity: candidate.estimatedCapacity ?? DEFAULT_CAPACITY,
      confidence: Math.min(Number(confidence.toFixed(2)), 0.95),
    };
  }

  private resolveStatus(tables: DetectedTable[]): DetectionStatus {
    if (tables.length === 0) {
      return 'failed';
    }

    const maxConfidence = Math.max(...tables.map((table) => table.confidence));

    if (maxConfidence >= MIN_COMPLETED_CONFIDENCE) {
      return 'completed';
    }

    if (maxConfidence >= MIN_PARTIAL_CONFIDENCE) {
      return 'partial';
    }

    return 'failed';
  }

  private buildMessage(status: DetectionStatus): string | undefined {
    if (status === 'failed') {
      return 'No se detectaron mesas de forma fiable. Puedes continuar con configuracion manual.';
    }

    if (status === 'partial') {
      return 'Deteccion parcial: revisa forma y capacidad antes de confirmar.';
    }

    return undefined;
  }
}
