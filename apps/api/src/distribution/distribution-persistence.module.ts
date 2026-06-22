import { Module } from '@nestjs/common';
import { DISTRIBUTION_REPOSITORY } from './infrastructure/persistence/distribution.repository.port';
import { FileDistributionRepository } from './infrastructure/persistence/file-distribution.repository';

/** Persistencia de distribución sin dependencias de EventsModule (evita ciclos Nest). */
@Module({
  providers: [
    FileDistributionRepository,
    {
      provide: DISTRIBUTION_REPOSITORY,
      useExisting: FileDistributionRepository,
    },
  ],
  exports: [DISTRIBUTION_REPOSITORY],
})
export class DistributionPersistenceModule {}
