import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { parseActorRole, type ActorRole } from '../common/domain/actor-role';
import {
  GetEventPreferenceModeUseCase,
  ListEventPreferenceModeRevisionsUseCase,
} from './application/get-event-preference-mode.use-case';
import { GetPreferencePermissionsUseCase } from './application/preference-permissions.use-case';
import { UpdateEventPreferenceModeUseCase } from './application/update-event-preference-mode.use-case';
import type { EventPreferenceControlSettings } from './domain/preference-control-mode';
import {
  EventPreferenceModeResponseDto,
  PreferenceControlModeRevisionListDto,
  PreferencePermissionsResponseDto,
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
    private readonly getPreferencePermissionsUseCase: GetPreferencePermissionsUseCase,
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

  @Get('permissions')
  @ApiOperation({
    summary: 'Consultar permisos de edicion segun modo y rol',
    description:
      'Pensado para UI: indica si el actor puede editar preferencias y mensaje de feedback.',
  })
  @ApiQuery({
    name: 'actorRole',
    required: false,
    enum: ['admin', 'guest'],
    example: 'guest',
  })
  @ApiOkResponse({ type: PreferencePermissionsResponseDto })
  getPermissions(
    @Param('eventId') eventId: string,
    @Query('actorRole') actorRoleRaw?: string,
  ): Promise<PreferencePermissionsResponseDto> {
    const actorRole: ActorRole = parseActorRole(actorRoleRaw);
    return this.getPreferencePermissionsUseCase.execute(eventId, actorRole);
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
