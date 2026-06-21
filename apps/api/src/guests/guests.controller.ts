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
  Query,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ActorRoleHeader } from '../common/http/actor-role.decorator';
import { parseActorRole, type ActorRole } from '../common/domain/actor-role';
import {
  CreateGuestUseCase,
  DeleteGuestUseCase,
  GetGuestUseCase,
  ListGuestCategoriesUseCase,
  ListGuestsUseCase,
  UpdateGuestUseCase,
} from './application/manage-guests.use-case';
import {
  GuestCategoryListResponseDto,
  GuestListResponseDto,
  GuestViewDto,
  UpsertGuestDto,
} from './dto/guest.dto';

@ApiTags('guests')
@Controller('events/:eventId/guests')
export class GuestsController {
  constructor(
    private readonly listGuestsUseCase: ListGuestsUseCase,
    private readonly getGuestUseCase: GetGuestUseCase,
    private readonly createGuestUseCase: CreateGuestUseCase,
    private readonly updateGuestUseCase: UpdateGuestUseCase,
    private readonly deleteGuestUseCase: DeleteGuestUseCase,
    private readonly listGuestCategoriesUseCase: ListGuestCategoriesUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar invitados del evento (HU-02/03 piloto)',
    description:
      'Admin ve datos completos; rol guest oculta telefono, direccion y observaciones sensibles.',
  })
  @ApiQuery({
    name: 'actorRole',
    required: false,
    enum: ['admin', 'guest'],
    example: 'admin',
  })
  @ApiOkResponse({ type: GuestListResponseDto })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  async list(
    @Param('eventId') eventId: string,
    @Query('actorRole') actorRoleRaw?: string,
  ): Promise<GuestListResponseDto> {
    const actorRole: ActorRole = parseActorRole(actorRoleRaw);
    const guests = await this.listGuestsUseCase.execute(eventId, actorRole);
    return { eventId, total: guests.length, guests };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias de invitados del evento' })
  @ApiOkResponse({ type: GuestCategoryListResponseDto })
  listCategories(
    @Param('eventId') eventId: string,
  ): Promise<GuestCategoryListResponseDto> {
    return this.listGuestCategoriesUseCase.execute(eventId);
  }

  @Get(':guestId')
  @ApiOperation({ summary: 'Consultar invitado por id' })
  @ApiQuery({
    name: 'actorRole',
    required: false,
    enum: ['admin', 'guest'],
    example: 'admin',
  })
  @ApiOkResponse({ type: GuestViewDto })
  @ApiNotFoundResponse({ description: 'Evento o invitado no encontrado.' })
  get(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Query('actorRole') actorRoleRaw?: string,
  ): Promise<GuestViewDto> {
    const actorRole: ActorRole = parseActorRole(actorRoleRaw);
    return this.getGuestUseCase.execute(eventId, guestId, actorRole);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar invitado manualmente (admin)' })
  @ApiHeader({
    name: 'x-taulamic-actor-role',
    required: false,
    description: 'Solo admin en piloto.',
  })
  @ApiCreatedResponse({ type: GuestViewDto })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiConflictResponse({ description: 'Correo duplicado en el evento.' })
  @ApiForbiddenResponse({ description: 'Solo admin.' })
  create(
    @Param('eventId') eventId: string,
    @ActorRoleHeader() actorRole: ActorRole,
    @Body() body: UpsertGuestDto,
  ): Promise<GuestViewDto> {
    return this.createGuestUseCase.execute(eventId, actorRole, body);
  }

  @Put(':guestId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar datos base del invitado (admin)' })
  @ApiHeader({ name: 'x-taulamic-actor-role', required: false })
  @ApiOkResponse({ type: GuestViewDto })
  @ApiNotFoundResponse({ description: 'Evento o invitado no encontrado.' })
  @ApiConflictResponse({ description: 'Correo duplicado en el evento.' })
  @ApiForbiddenResponse({ description: 'Solo admin.' })
  update(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @ActorRoleHeader() actorRole: ActorRole,
    @Body() body: UpsertGuestDto,
  ): Promise<GuestViewDto> {
    return this.updateGuestUseCase.execute(eventId, guestId, actorRole, body);
  }

  @Delete(':guestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar invitado del evento (admin)' })
  @ApiHeader({ name: 'x-taulamic-actor-role', required: false })
  @ApiNoContentResponse({ description: 'Invitado eliminado.' })
  @ApiNotFoundResponse({ description: 'Evento o invitado no encontrado.' })
  @ApiForbiddenResponse({ description: 'Solo admin.' })
  async remove(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<void> {
    await this.deleteGuestUseCase.execute(eventId, guestId, actorRole);
  }
}
