import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { buildSeatTopology } from '../domain/build-seat-topology';
import { isTableShape } from '../domain/table-shape';
import { LayoutDraftGuard } from './layout-draft.guard';

@Injectable()
export class GetSeatTopologyPreviewUseCase {
  execute(shape: string, capacity: number) {
    if (!isTableShape(shape)) {
      throw new BadRequestException({
        code: 'INVALID_TABLE_SHAPE',
        message: 'Forma de mesa no soportada.',
        details: { shape },
      });
    }

    return buildSeatTopology(shape, capacity);
  }
}

@Injectable()
export class GetDraftTableSeatTopologyUseCase {
  constructor(private readonly guard: LayoutDraftGuard) {}

  async execute(eventId: string, floorPlanId: string, tableId: string) {
    const draft = await this.guard.loadOrInitDraft(eventId, floorPlanId);
    const table = draft.tables.find((entry) => entry.id === tableId);

    if (!table) {
      throw new NotFoundException({
        code: 'DRAFT_TABLE_NOT_FOUND',
        message: 'No se encontro la mesa indicada en el borrador.',
        details: { tableId },
      });
    }

    return buildSeatTopology(table.shape, table.estimatedCapacity);
  }
}
