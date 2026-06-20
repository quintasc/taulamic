import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetEventPreferenceModeUseCase,
  ListEventPreferenceModeRevisionsUseCase,
} from './application/get-event-preference-mode.use-case';
import { UpdateEventPreferenceModeUseCase } from './application/update-event-preference-mode.use-case';
import type { EventPreferenceControlSettings } from './domain/preference-control-mode';
import {
  EventPreferenceModeResponseDto,
  PreferenceControlModeRevisionListDto,
  UpdateEventPreferenceModeDto,
} from './dto/event-preference-mode.dto';

function toResponse(
  settings: EventPreferenceControlSettings,
): EventPreferenceModeResponseDto {
  return {
    eventId: settings.eventId,
    mode: settings.currentMode,
    version: settings.latestVersion,
    updatedAt: settings.updatedAt,
  };
}

@ApiTags('events')
@Controller('events/:eventId/preference-control-mode')
export class EventsController {
  constructor(
    private readonly getEventPreferenceModeUseCase: GetEventPreferenceModeUseCase,
    private readonly updateEventPreferenceModeUseCase: UpdateEventPreferenceModeUseCase,
    private readonly listEventPreferenceModeRevisionsUseCase: ListEventPreferenceModeRevisionsUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar modo de control de preferencias del evento',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiOkResponse({ type: EventPreferenceModeResponseDto })
  async getMode(
    @Param('eventId') eventId: string,
  ): Promise<EventPreferenceModeResponseDto> {
    const settings = await this.getEventPreferenceModeUseCase.execute(eventId);
    return toResponse(settings);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar modo de control de preferencias del evento',
    description:
      'Persiste el modo con historial versionado. No elimina preferencias ya registradas.',
  })
  @ApiOkResponse({ type: EventPreferenceModeResponseDto })
  updateMode(
    @Param('eventId') eventId: string,
    @Body() body: UpdateEventPreferenceModeDto,
  ): Promise<EventPreferenceModeResponseDto> {
    return this.updateEventPreferenceModeUseCase
      .execute(eventId, body.mode)
      .then(toResponse);
  }

  @Get('revisions')
  @ApiOperation({
    summary: 'Historial auditado de cambios de modo',
  })
  @ApiOkResponse({ type: PreferenceControlModeRevisionListDto })
  async listRevisions(
    @Param('eventId') eventId: string,
  ): Promise<PreferenceControlModeRevisionListDto> {
    const revisions =
      await this.listEventPreferenceModeRevisionsUseCase.execute(eventId);
    return { eventId, revisions };
  }
}
