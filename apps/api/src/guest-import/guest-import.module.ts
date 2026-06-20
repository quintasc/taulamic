import { Module } from '@nestjs/common';
import { GenerateGuestTemplateUseCase } from './application/generate-guest-template.use-case';
import { ImportGuestBatchUseCase } from './application/import-guest-batch.use-case';
import { ValidateGuestImportUseCase } from './application/validate-guest-import.use-case';
import { GuestImportController } from './guest-import.controller';
import { ExcelJsGuestImportParser } from './infrastructure/excel/exceljs-guest-import.parser';
import { GUEST_IMPORT_PARSER } from './infrastructure/excel/guest-import.parser.port';
import { ExcelJsGuestTemplateGenerator } from './infrastructure/excel/exceljs-guest-template.generator';
import { GUEST_TEMPLATE_GENERATOR } from './infrastructure/excel/guest-template.generator.port';
import { FileGuestRepository } from './infrastructure/persistence/file-guest.repository';
import { GUEST_REPOSITORY } from './infrastructure/persistence/guest.repository.port';

@Module({
  controllers: [GuestImportController],
  providers: [
    GenerateGuestTemplateUseCase,
    ValidateGuestImportUseCase,
    ImportGuestBatchUseCase,
    ExcelJsGuestTemplateGenerator,
    ExcelJsGuestImportParser,
    FileGuestRepository,
    {
      provide: GUEST_TEMPLATE_GENERATOR,
      useExisting: ExcelJsGuestTemplateGenerator,
    },
    {
      provide: GUEST_IMPORT_PARSER,
      useExisting: ExcelJsGuestImportParser,
    },
    {
      provide: GUEST_REPOSITORY,
      useExisting: FileGuestRepository,
    },
  ],
})
export class GuestImportModule {}
