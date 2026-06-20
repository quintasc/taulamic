import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ActorRoleHeader } from '../common/http/actor-role.decorator';
import type { ActorRole } from '../common/domain/actor-role';
import {
  AddGuestRestrictionUseCase,
  ListGuestRestrictionsUseCase,
} from './application/manage-guest-restrictions.use-case';
import {
  AddGuestRestrictionDto,
  GuestRestrictionDto,
  GuestRestrictionListResponseDto,
  toGuestRestrictionDto,
} from './dto/guest-restriction.dto';

@ApiTags('guest-preferences')
@Controller('events/:eventId/guests/:guestId/restrictions')
export class GuestPreferencesController {
  constructor(
    private readonly listGuestRestrictionsUseCase: ListGuestRestrictionsUseCase,
    private readonly addGuestRestrictionUseCase: AddGuestRestrictionUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar restricciones de un invitado' })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiParam({ name: 'guestId', example: 'guest-uuid' })
  @ApiOkResponse({ type: GuestRestrictionListResponseDto })
  async listRestrictions(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
  ): Promise<GuestRestrictionListResponseDto> {
    const restrictions = await this.listGuestRestrictionsUseCase.execute(
      eventId,
      guestId,
    );

    return {
      eventId,
      guestId,
      restrictions: restrictions.map(toGuestRestrictionDto),
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Anadir restriccion manual de invitado',
    description:
      'En modo anfitrion_exclusivo solo admins pueden editar. En colaborativo, invitados autorizados tambien.',
  })
  @ApiHeader({
    name: 'x-taulame-actor-role',
    required: false,
    description: 'Rol del actor: admin o guest. Por defecto admin.',
  })
  @ApiOkResponse({ type: GuestRestrictionDto })
  @ApiForbiddenResponse({
    description: 'Operacion no permitida segun modo del evento (PREF-001).',
  })
  addRestriction(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @ActorRoleHeader() actorRole: ActorRole,
    @Body() body: AddGuestRestrictionDto,
  ): Promise<GuestRestrictionDto> {
    return this.addGuestRestrictionUseCase
      .execute(eventId, guestId, actorRole, {
        kind: body.kind,
        targetHint: body.targetHint ?? null,
        description: body.description,
      })
      .then(toGuestRestrictionDto);
  }
}
