import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { GenerateGuestTemplateUseCase } from './application/generate-guest-template.use-case';
import { ImportGuestBatchUseCase } from './application/import-guest-batch.use-case';
import { ValidateGuestImportUseCase } from './application/validate-guest-import.use-case';
import { GuestImportBatchResponseDto } from './dto/guest-import-batch-response.dto';
import { GuestImportValidationResponseDto } from './dto/guest-import-validation-response.dto';

@ApiTags('guest-import')
@Controller('events/:eventId/guest-import')
export class GuestImportController {
  constructor(
    private readonly generateGuestTemplateUseCase: GenerateGuestTemplateUseCase,
    private readonly validateGuestImportUseCase: ValidateGuestImportUseCase,
    private readonly importGuestBatchUseCase: ImportGuestBatchUseCase,
  ) {}

  @Get('template')
  @ApiOperation({
    summary: 'Descargar plantilla Excel v1 de invitados',
    description:
      'Genera un archivo .xlsx con hoja invitados (encabezados oficiales y filas de ejemplo) e instrucciones de uso.',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({
    description: 'Plantilla Excel descargable.',
    schema: { type: 'string', format: 'binary' },
  })
  async downloadTemplate(
    @Param('eventId') eventId: string,
    @Res() response: Response,
  ): Promise<void> {
    const template = await this.generateGuestTemplateUseCase.execute(eventId);

    response.set({
      'Content-Type': template.mimeType,
      'Content-Disposition': `attachment; filename="${template.filename}"`,
      'Content-Length': template.buffer.length,
    });
    response.send(template.buffer);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar archivo Excel de invitados',
    description:
      'Parsea el .xlsx y devuelve errores por fila, campo y codigo (XLS-001..007).',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: GuestImportValidationResponseDto })
  @ApiBadRequestResponse({
    description: 'Archivo ausente, formato invalido o tamano excedido.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  validate(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<GuestImportValidationResponseDto> {
    return this.validateGuestImportUseCase.execute(eventId, file).then(
      (result) => ({
        eventId: result.eventId,
        valid: result.valid,
        totalRows: result.totalRows,
        validRows: result.validRows,
        invalidRows: result.invalidRows,
        errors: result.errors,
      }),
    );
  }

  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Importar invitados desde Excel',
    description:
      'Valida filas validas, hace upsert por correo y normaliza categorias del evento. Las filas con error se rechazan sin bloquear las validas.',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: GuestImportBatchResponseDto })
  @ApiBadRequestResponse({
    description: 'Archivo ausente, formato invalido o tamano excedido.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  import(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<GuestImportBatchResponseDto> {
    return this.importGuestBatchUseCase.execute(eventId, file);
  }
}
