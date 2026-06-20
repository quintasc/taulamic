import { Controller, Get, Param, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { GenerateGuestTemplateUseCase } from './application/generate-guest-template.use-case';

@ApiTags('guest-import')
@Controller('events/:eventId/guest-import')
export class GuestImportController {
  constructor(
    private readonly generateGuestTemplateUseCase: GenerateGuestTemplateUseCase,
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
}
