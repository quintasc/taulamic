import { Module } from '@nestjs/common';
import { DetectTablesUseCase } from './application/detect-tables.use-case';
import { HeuristicTableDetectionAdapter } from './infrastructure/detection/heuristic-table-detection.adapter';
import { TABLE_DETECTION_PORT } from './infrastructure/detection/table-detection.port';
import { FloorPlanStorageRepository } from './infrastructure/floor-plan-storage.repository';
import { FloorPlansController } from './floor-plans.controller';
import { FloorPlansService } from './floor-plans.service';

@Module({
  controllers: [FloorPlansController],
  providers: [
    FloorPlansService,
    FloorPlanStorageRepository,
    DetectTablesUseCase,
    HeuristicTableDetectionAdapter,
    {
      provide: TABLE_DETECTION_PORT,
      useExisting: HeuristicTableDetectionAdapter,
    },
  ],
})
export class FloorPlansModule {}
