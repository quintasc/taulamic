import {
  Body,
  Controller,
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
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ActorRoleHeader } from '../common/http/actor-role.decorator';
import type { ActorRole } from '../common/domain/actor-role';
import {
  ConfirmDistributionUseCase,
  GetDistributionUseCase,
  RunDistributionUseCase,
} from './application/manage-distribution.use-case';
import { AssignGuestToDistributionUseCase } from './application/assign-guest-to-distribution.use-case';
import { UnassignGuestFromDistributionUseCase } from './application/unassign-guest-from-distribution.use-case';
import { AssignGuestDto } from './dto/assign-guest.dto';
import { DistributionProposalDto } from './dto/distribution.dto';

@ApiTags('distribution')
@Controller('events/:eventId/distribution')
export class DistributionController {
  constructor(
    private readonly runDistributionUseCase: RunDistributionUseCase,
    private readonly getDistributionUseCase: GetDistributionUseCase,
    private readonly confirmDistributionUseCase: ConfirmDistributionUseCase,
    private readonly unassignGuestFromDistributionUseCase: UnassignGuestFromDistributionUseCase,
    private readonly assignGuestToDistributionUseCase: AssignGuestToDistributionUseCase,
  ) {}

  @Post('run')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ejecutar motor v0 piloto y generar propuesta de distribucion',
  })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiHeader({
    name: 'x-taulamic-actor-role',
    required: true,
    description: 'Debe ser admin para ejecutar el motor.',
  })
  @ApiCreatedResponse({ type: DistributionProposalDto })
  @ApiForbiddenResponse({ description: 'Solo admin puede ejecutar el motor.' })
  @ApiConflictResponse({
    description: 'Plan aprobado o distribucion ya confirmada.',
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  async run(
    @Param('eventId') eventId: string,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<DistributionProposalDto> {
    return this.runDistributionUseCase.execute(eventId, actorRole);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la ultima propuesta de distribucion' })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiOkResponse({ type: DistributionProposalDto })
  @ApiNotFoundResponse({ description: 'Sin propuesta o evento inexistente.' })
  async getLatest(
    @Param('eventId') eventId: string,
  ): Promise<DistributionProposalDto> {
    return this.getDistributionUseCase.execute(eventId);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar distribucion piloto y aprobar plan del evento',
  })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiHeader({
    name: 'x-taulamic-actor-role',
    required: true,
    description: 'Debe ser admin para confirmar.',
  })
  @ApiOkResponse({ type: DistributionProposalDto })
  @ApiForbiddenResponse({ description: 'Solo admin puede confirmar.' })
  @ApiConflictResponse({
    description: 'Invitados sin asignar, violaciones o ya confirmada.',
  })
  @ApiNotFoundResponse({ description: 'Sin propuesta o evento inexistente.' })
  async confirm(
    @Param('eventId') eventId: string,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<DistributionProposalDto> {
    return this.confirmDistributionUseCase.execute(eventId, actorRole);
  }

  @Post('placements/:guestId/unassign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desasignar invitado de su mesa (propuesta en borrador)',
  })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiParam({ name: 'guestId', example: 'guest-1' })
  @ApiHeader({
    name: 'x-taulamic-actor-role',
    required: true,
    description: 'Debe ser admin.',
  })
  @ApiOkResponse({ type: DistributionProposalDto })
  @ApiForbiddenResponse({ description: 'Solo admin puede desasignar.' })
  @ApiConflictResponse({
    description: 'Propuesta confirmada o invitado no asignado.',
  })
  @ApiNotFoundResponse({ description: 'Sin propuesta o evento inexistente.' })
  async unassignGuest(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<DistributionProposalDto> {
    return this.unassignGuestFromDistributionUseCase.execute(
      eventId,
      guestId,
      actorRole,
    );
  }

  @Put('placements/:guestId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Asignar invitado sin asignar a una mesa (propuesta en borrador)',
  })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiParam({ name: 'guestId', example: 'guest-1' })
  @ApiHeader({
    name: 'x-taulamic-actor-role',
    required: true,
    description: 'Debe ser admin.',
  })
  @ApiOkResponse({ type: DistributionProposalDto })
  @ApiForbiddenResponse({ description: 'Solo admin puede asignar.' })
  @ApiConflictResponse({
    description: 'Propuesta confirmada, mesa llena o regla dura.',
  })
  @ApiNotFoundResponse({ description: 'Sin propuesta o evento inexistente.' })
  async assignGuest(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Body() body: AssignGuestDto,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<DistributionProposalDto> {
    return this.assignGuestToDistributionUseCase.execute(
      eventId,
      guestId,
      body.tableId,
      actorRole,
    );
  }
}
