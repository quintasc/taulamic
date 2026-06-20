import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  assertValidDraftTableInput,
  resolveConfigurationOrigin,
} from '../domain/draft-table.validator';
import { ConfirmedLayout } from '../domain/confirmed-layout';
import { layoutVersionToConfirmedLayout } from '../domain/layout-version.mapper';
import { EditableLayoutTable } from '../domain/editable-layout-table';
import { LayoutDraft } from '../domain/layout-draft';
import type { TableShape } from '../domain/table-shape';
import { FloorPlanStorageRepository } from '../infrastructure/floor-plan-storage.repository';
import {
  LAYOUT_VERSION_REPOSITORY,
} from '../infrastructure/persistence/layout-version.repository.port';
import type { LayoutVersionRepositoryPort } from '../infrastructure/persistence/layout-version.repository.port';
import { LayoutDraftGuard } from './layout-draft.guard';

@Injectable()
export class AddDraftTableUseCase {
  constructor(
    private readonly guard: LayoutDraftGuard,
    private readonly storage: FloorPlanStorageRepository,
  ) {}

  async execute(
    eventId: string,
    floorPlanId: string,
    input: { label?: string; shape?: string; estimatedCapacity?: number },
  ): Promise<LayoutDraft> {
    await this.guard.ensureNotConfirmed(eventId, floorPlanId);
    const draft = await this.guard.loadOrInitDraft(eventId, floorPlanId);
    const validated = assertValidDraftTableInput(input);
    const table = this.guard.createManualTable(
      validated.label,
      validated.shape as TableShape,
      validated.estimatedCapacity,
    );

    return this.guard.saveDraft({
      ...draft,
      tables: [...draft.tables, table],
    });
  }
}

@Injectable()
export class UpdateDraftTableUseCase {
  constructor(private readonly guard: LayoutDraftGuard) {}

  async execute(
    eventId: string,
    floorPlanId: string,
    tableId: string,
    input: { label?: string; shape?: string; estimatedCapacity?: number },
  ): Promise<LayoutDraft> {
    await this.guard.ensureNotConfirmed(eventId, floorPlanId);
    const draft = await this.guard.loadOrInitDraft(eventId, floorPlanId);
    const tableIndex = draft.tables.findIndex((table) => table.id === tableId);

    if (tableIndex === -1) {
      throw new NotFoundException({
        code: 'DRAFT_TABLE_NOT_FOUND',
        message: 'No se encontro la mesa indicada en el borrador.',
        details: { tableId },
      });
    }

    const current = draft.tables[tableIndex];
    const validated = assertValidDraftTableInput({
      label: input.label ?? current.label,
      shape: input.shape ?? current.shape,
      estimatedCapacity: input.estimatedCapacity ?? current.estimatedCapacity,
    });

    const updatedTable: EditableLayoutTable = {
      ...current,
      label: validated.label,
      shape: validated.shape as TableShape,
      estimatedCapacity: validated.estimatedCapacity,
      origin:
        current.origin === 'detected' || current.origin === 'detected_edited'
          ? 'detected_edited'
          : 'manual',
    };

    const tables = [...draft.tables];
    tables[tableIndex] = updatedTable;

    return this.guard.saveDraft({ ...draft, tables });
  }
}

@Injectable()
export class RemoveDraftTableUseCase {
  constructor(private readonly guard: LayoutDraftGuard) {}

  async execute(
    eventId: string,
    floorPlanId: string,
    tableId: string,
  ): Promise<LayoutDraft> {
    await this.guard.ensureNotConfirmed(eventId, floorPlanId);
    const draft = await this.guard.loadOrInitDraft(eventId, floorPlanId);
    const tables = draft.tables.filter((table) => table.id !== tableId);

    if (tables.length === draft.tables.length) {
      throw new NotFoundException({
        code: 'DRAFT_TABLE_NOT_FOUND',
        message: 'No se encontro la mesa indicada en el borrador.',
        details: { tableId },
      });
    }

    return this.guard.saveDraft({ ...draft, tables });
  }
}

@Injectable()
export class ConfirmLayoutDraftUseCase {
  constructor(
    private readonly guard: LayoutDraftGuard,
    private readonly storage: FloorPlanStorageRepository,
    @Inject(LAYOUT_VERSION_REPOSITORY)
    private readonly layoutVersionRepository: LayoutVersionRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    floorPlanId: string,
    confirmed: boolean,
  ): Promise<ConfirmedLayout> {
    if (confirmed !== true) {
      throw new BadRequestException({
        code: 'CONFIRMATION_REQUIRED',
        message:
          'Debes confirmar explicitamente la configuracion antes de guardar.',
      });
    }

    await this.guard.ensureNotConfirmed(eventId, floorPlanId);
    const draft = await this.guard.loadOrInitDraft(eventId, floorPlanId);

    if (draft.tables.length === 0) {
      throw new BadRequestException({
        code: 'DRAFT_EMPTY',
        message: 'Anade al menos una mesa antes de confirmar la configuracion.',
      });
    }

    const detection = await this.storage.loadDetectionResult(eventId, floorPlanId);
    const detectionHadTables = (detection?.tables.length ?? 0) > 0;
    const confirmedAt = new Date().toISOString();
    const configurationOrigin = resolveConfigurationOrigin(detectionHadTables);

    const version = await this.layoutVersionRepository.saveVersion({
      eventId,
      floorPlanId,
      configurationOrigin,
      confirmedAt,
      tables: draft.tables,
    });

    return layoutVersionToConfirmedLayout(version);
  }
}

@Injectable()
export class GetConfirmedLayoutUseCase {
  constructor(
    private readonly guard: LayoutDraftGuard,
    @Inject(LAYOUT_VERSION_REPOSITORY)
    private readonly layoutVersionRepository: LayoutVersionRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    floorPlanId: string,
  ): Promise<ConfirmedLayout> {
    await this.guard.ensureFloorPlanExists(eventId, floorPlanId);
    const latest = await this.layoutVersionRepository.getLatestVersion(
      eventId,
      floorPlanId,
    );

    if (!latest) {
      throw new NotFoundException({
        code: 'LAYOUT_NOT_CONFIRMED',
        message: 'Aun no existe una configuracion confirmada para este plano.',
        details: { eventId, floorPlanId },
      });
    }

    return layoutVersionToConfirmedLayout(latest);
  }
}
