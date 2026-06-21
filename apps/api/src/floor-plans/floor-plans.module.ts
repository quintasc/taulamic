import { Module } from '@nestjs/common';
import { DetectTablesUseCase } from './application/detect-tables.use-case';
import {
  GetDraftTableSeatTopologyUseCase,
  GetSeatTopologyPreviewUseCase,
} from './application/get-seat-topology.use-case';
import { GetTableShapeCatalogUseCase } from './application/get-table-shape-catalog.use-case';
import { GetLayoutDraftUseCase } from './application/get-layout-draft.use-case';
import { LayoutDraftGuard } from './application/layout-draft.guard';
import {
  GetLayoutVersionUseCase,
  ListLayoutVersionsUseCase,
} from './application/layout-version.use-case';
import {
  AddDraftTableUseCase,
  ConfirmLayoutDraftUseCase,
  GetConfirmedLayoutUseCase,
  RemoveDraftTableUseCase,
  UpdateDraftTableUseCase,
} from './application/manage-layout-draft.use-case';
import { HeuristicTableDetectionAdapter } from './infrastructure/detection/heuristic-table-detection.adapter';
import { TABLE_DETECTION_PORT } from './infrastructure/detection/table-detection.port';
import { FloorPlanStorageRepository } from './infrastructure/floor-plan-storage.repository';
import { FileLayoutVersionRepository } from './infrastructure/persistence/file-layout-version.repository';
import { LAYOUT_VERSION_REPOSITORY } from './infrastructure/persistence/layout-version.repository.port';
import { FloorPlansController } from './floor-plans.controller';
import { TableShapesController } from './table-shapes.controller';
import { FloorPlansService } from './floor-plans.service';

@Module({
  controllers: [FloorPlansController, TableShapesController],
  providers: [
    FloorPlansService,
    FloorPlanStorageRepository,
    LayoutDraftGuard,
    DetectTablesUseCase,
    GetTableShapeCatalogUseCase,
    GetSeatTopologyPreviewUseCase,
    GetDraftTableSeatTopologyUseCase,
    GetLayoutDraftUseCase,
    AddDraftTableUseCase,
    UpdateDraftTableUseCase,
    RemoveDraftTableUseCase,
    ConfirmLayoutDraftUseCase,
    GetConfirmedLayoutUseCase,
    ListLayoutVersionsUseCase,
    GetLayoutVersionUseCase,
    HeuristicTableDetectionAdapter,
    FileLayoutVersionRepository,
    {
      provide: TABLE_DETECTION_PORT,
      useExisting: HeuristicTableDetectionAdapter,
    },
    {
      provide: LAYOUT_VERSION_REPOSITORY,
      useExisting: FileLayoutVersionRepository,
    },
  ],
})
export class FloorPlansModule {}
