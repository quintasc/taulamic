import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  AddEventTableUseCase,
  CreateEventUseCase,
  GetEventUseCase,
  RemoveEventTableUseCase,
  UpdateEventTableUseCase,
  UpdateEventUseCase,
  type EventDetail,
} from './application/manage-event-config.use-case';
import {
  CreateEventDto,
  EventDetailResponseDto,
  UpdateEventDto,
  UpsertEventTableDto,
} from './dto/event-config.dto';

function toResponse(event: EventDetail): EventDetailResponseDto {
  return {
    id: event.id,
    name: event.name,
    status: event.status,
    tables: event.tables.map((table) => ({
      id: table.id,
      label: table.label,
      shape: table.shape,
      capacity: table.capacity,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    })),
    capacitySummary: event.capacitySummary,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

@ApiTags('events')
@Controller('events')
export class EventConfigController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly getEventUseCase: GetEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly addEventTableUseCase: AddEventTableUseCase,
    private readonly updateEventTableUseCase: UpdateEventTableUseCase,
    private readonly removeEventTableUseCase: RemoveEventTableUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear evento (HU-01)' })
  @ApiCreatedResponse({ type: EventDetailResponseDto })
  async create(@Body() body: CreateEventDto): Promise<EventDetailResponseDto> {
    const event = await this.createEventUseCase.execute(body.name);
    return toResponse(event);
  }

  @Get(':eventId')
  @ApiOperation({
    summary: 'Consultar evento con mesas y capacidad total disponible',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiOkResponse({ type: EventDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  async get(
    @Param('eventId') eventId: string,
  ): Promise<EventDetailResponseDto> {
    const event = await this.getEventUseCase.execute(eventId);
    return toResponse(event);
  }

  @Put(':eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar datos base del evento' })
  @ApiOkResponse({ type: EventDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  async update(
    @Param('eventId') eventId: string,
    @Body() body: UpdateEventDto,
  ): Promise<EventDetailResponseDto> {
    const event = await this.updateEventUseCase.execute(eventId, body.name);
    return toResponse(event);
  }

  @Post(':eventId/tables')
  @ApiOperation({ summary: 'Anadir mesa al evento con forma y capacidad' })
  @ApiCreatedResponse({ type: EventDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiConflictResponse({ description: 'Plan aprobado; mesas bloqueadas.' })
  async addTable(
    @Param('eventId') eventId: string,
    @Body() body: UpsertEventTableDto,
  ): Promise<EventDetailResponseDto> {
    const event = await this.addEventTableUseCase.execute(eventId, body);
    return toResponse(event);
  }

  @Put(':eventId/tables/:tableId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Editar mesa (capacidad/forma) antes de aprobar plan final',
  })
  @ApiOkResponse({ type: EventDetailResponseDto })
  @ApiNotFoundResponse({ description: 'Evento o mesa no encontrados.' })
  @ApiConflictResponse({ description: 'Plan aprobado; mesas bloqueadas.' })
  async updateTable(
    @Param('eventId') eventId: string,
    @Param('tableId') tableId: string,
    @Body() body: UpsertEventTableDto,
  ): Promise<EventDetailResponseDto> {
    const event = await this.updateEventTableUseCase.execute(
      eventId,
      tableId,
      body,
    );
    return toResponse(event);
  }

  @Delete(':eventId/tables/:tableId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar mesa del evento' })
  @ApiNoContentResponse({ description: 'Mesa eliminada.' })
  @ApiNotFoundResponse({ description: 'Evento o mesa no encontrados.' })
  @ApiConflictResponse({ description: 'Plan aprobado; mesas bloqueadas.' })
  async removeTable(
    @Param('eventId') eventId: string,
    @Param('tableId') tableId: string,
  ): Promise<void> {
    await this.removeEventTableUseCase.execute(eventId, tableId);
  }
}
