import { Module } from '@nestjs/common';
import { GenerateGuestTemplateUseCase } from './application/generate-guest-template.use-case';
import { GuestImportController } from './guest-import.controller';
import { ExcelJsGuestTemplateGenerator } from './infrastructure/excel/exceljs-guest-template.generator';
import { GUEST_TEMPLATE_GENERATOR } from './infrastructure/excel/guest-template.generator.port';

@Module({
  controllers: [GuestImportController],
  providers: [
    GenerateGuestTemplateUseCase,
    ExcelJsGuestTemplateGenerator,
    {
      provide: GUEST_TEMPLATE_GENERATOR,
      useExisting: ExcelJsGuestTemplateGenerator,
    },
  ],
})
export class GuestImportModule {}
