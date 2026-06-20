import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfirmedLayout } from '../domain/confirmed-layout';
import { layoutVersionToConfirmedLayout } from '../domain/layout-version.mapper';
import type { LayoutVersionSummary } from '../domain/layout-version';
import { LayoutDraftGuard } from './layout-draft.guard';
import {
  LAYOUT_VERSION_REPOSITORY,
} from '../infrastructure/persistence/layout-version.repository.port';
import type { LayoutVersionRepositoryPort } from '../infrastructure/persistence/layout-version.repository.port';

@Injectable()
export class ListLayoutVersionsUseCase {
  constructor(
    private readonly guard: LayoutDraftGuard,
    @Inject(LAYOUT_VERSION_REPOSITORY)
    private readonly layoutVersionRepository: LayoutVersionRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    floorPlanId: string,
  ): Promise<LayoutVersionSummary[]> {
    await this.guard.ensureFloorPlanExists(eventId, floorPlanId);
    return this.layoutVersionRepository.listVersionSummaries(eventId, floorPlanId);
  }
}

@Injectable()
export class GetLayoutVersionUseCase {
  constructor(
    private readonly guard: LayoutDraftGuard,
    @Inject(LAYOUT_VERSION_REPOSITORY)
    private readonly layoutVersionRepository: LayoutVersionRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    floorPlanId: string,
    version: number,
  ): Promise<ConfirmedLayout> {
    await this.guard.ensureFloorPlanExists(eventId, floorPlanId);
    const layoutVersion = await this.layoutVersionRepository.getVersion(
      eventId,
      floorPlanId,
      version,
    );

    if (!layoutVersion) {
      throw new NotFoundException({
        code: 'LAYOUT_VERSION_NOT_FOUND',
        message: 'No se encontro la version indicada del layout.',
        details: { eventId, floorPlanId, version },
      });
    }

    return layoutVersionToConfirmedLayout(layoutVersion);
  }
}
