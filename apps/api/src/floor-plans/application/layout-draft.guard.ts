import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EditableLayoutTable } from '../domain/editable-layout-table';
import { LayoutDraft } from '../domain/layout-draft';
import { FloorPlanStorageRepository } from '../infrastructure/floor-plan-storage.repository';
import {
  LAYOUT_VERSION_REPOSITORY,
} from '../infrastructure/persistence/layout-version.repository.port';
import type { LayoutVersionRepositoryPort } from '../infrastructure/persistence/layout-version.repository.port';

@Injectable()
export class LayoutDraftGuard {
  constructor(
    private readonly storage: FloorPlanStorageRepository,
    @Inject(LAYOUT_VERSION_REPOSITORY)
    private readonly layoutVersionRepository: LayoutVersionRepositoryPort,
  ) {}

  async ensureFloorPlanExists(
    eventId: string,
    floorPlanId: string,
  ): Promise<void> {
    const uploaded = await this.storage.findUploadedFile(eventId, floorPlanId);

    if (!uploaded) {
      throw new NotFoundException({
        code: 'FLOOR_PLAN_NOT_FOUND',
        message: 'No se encontro el plano indicado para este evento.',
        details: { eventId, floorPlanId },
      });
    }
  }

  async ensureNotConfirmed(eventId: string, floorPlanId: string): Promise<void> {
    const hasVersion = await this.layoutVersionRepository.hasAnyVersion(
      eventId,
      floorPlanId,
    );

    if (hasVersion) {
      throw new ConflictException({
        code: 'LAYOUT_ALREADY_CONFIRMED',
        message:
          'La configuracion ya fue confirmada. Consulta el layout confirmado.',
        details: { eventId, floorPlanId },
      });
    }
  }

  async loadOrInitDraft(eventId: string, floorPlanId: string): Promise<LayoutDraft> {
    await this.ensureFloorPlanExists(eventId, floorPlanId);

    const existingDraft = await this.storage.loadDraft(eventId, floorPlanId);
    if (existingDraft) {
      return existingDraft;
    }

    const detection = await this.storage.loadDetectionResult(eventId, floorPlanId);
    const tables: EditableLayoutTable[] =
      detection?.tables.map((table) => ({
        id: table.id,
        label: table.label,
        shape: table.shape,
        estimatedCapacity: table.estimatedCapacity,
        confidence: table.confidence,
        origin: 'detected' as const,
      })) ?? [];

    const draft: LayoutDraft = {
      floorPlanId,
      eventId,
      status: 'draft',
      tables,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.saveDraft(eventId, floorPlanId, draft);
    return draft;
  }

  async saveDraft(draft: LayoutDraft): Promise<LayoutDraft> {
    const updatedDraft: LayoutDraft = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    await this.storage.saveDraft(
      draft.eventId,
      draft.floorPlanId,
      updatedDraft,
    );
    return updatedDraft;
  }

  createManualTable(
    label: string,
    shape: EditableLayoutTable['shape'],
    estimatedCapacity: number,
  ): EditableLayoutTable {
    return {
      id: randomUUID(),
      label,
      shape,
      estimatedCapacity,
      origin: 'manual',
    };
  }
}
