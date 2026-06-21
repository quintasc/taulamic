import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { GuestImportModule } from '../guest-import/guest-import.module';
import {
  ConfirmDistributionUseCase,
  GetDistributionUseCase,
  RunDistributionUseCase,
} from './application/manage-distribution.use-case';
import { DistributionController } from './distribution.controller';
import { DISTRIBUTION_REPOSITORY } from './infrastructure/persistence/distribution.repository.port';
import { FileDistributionRepository } from './infrastructure/persistence/file-distribution.repository';

@Module({
  imports: [EventsModule, GuestImportModule],
  controllers: [DistributionController],
  providers: [
    RunDistributionUseCase,
    GetDistributionUseCase,
    ConfirmDistributionUseCase,
    FileDistributionRepository,
    {
      provide: DISTRIBUTION_REPOSITORY,
      useExisting: FileDistributionRepository,
    },
  ],
})
export class DistributionModule {}
