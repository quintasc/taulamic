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
import { GetDistributionCalculationStatusUseCase } from './application/get-distribution-calculation-status.use-case';
import { AssignGuestToDistributionUseCase } from './application/assign-guest-to-distribution.use-case';
import { MoveGuestInDistributionUseCase } from './application/move-guest-in-distribution.use-case';
import { UnassignGuestFromDistributionUseCase } from './application/unassign-guest-from-distribution.use-case';
import { UpdateGuestSeatInDistributionUseCase } from './application/update-guest-seat-in-distribution.use-case';
import { AssignGuestDto } from './dto/assign-guest.dto';
import {
  DistributionCalculationStatusDto,
  DistributionProposalDto,
} from './dto/distribution.dto';
import { RunDistributionDto } from './dto/run-distribution.dto';
import { UpdateGuestSeatDto } from './dto/update-guest-seat.dto';

@ApiTags('distribution')
@Controller('events/:eventId/distribution')
export class DistributionController {
  constructor(
    private readonly runDistributionUseCase: RunDistributionUseCase,
    private readonly getDistributionUseCase: GetDistributionUseCase,
    private readonly getDistributionCalculationStatusUseCase: GetDistributionCalculationStatusUseCase,
    private readonly confirmDistributionUseCase: ConfirmDistributionUseCase,
    private readonly unassignGuestFromDistributionUseCase: UnassignGuestFromDistributionUseCase,
    private readonly assignGuestToDistributionUseCase: AssignGuestToDistributionUseCase,
    private readonly moveGuestInDistributionUseCase: MoveGuestInDistributionUseCase,
    private readonly updateGuestSeatInDistributionUseCase: UpdateGuestSeatInDistributionUseCase,
  ) {}

  @Post('run')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Iniciar cálculo asíncrono de distribución y marcar propuesta como calculating',
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
    @Body() body?: RunDistributionDto,
  ): Promise<DistributionProposalDto> {
    return this.runDistributionUseCase.execute(
      eventId,
      actorRole,
      body?.softRules,
      body?.explicitAffinityRelations,
      body?.categoryAffinityRelations,
    );
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

  @Get('status')
  @ApiOperation({
    summary: 'Obtener estado del cálculo de distribución en segundo plano',
  })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiOkResponse({ type: DistributionCalculationStatusDto })
  @ApiNotFoundResponse({ description: 'Evento inexistente.' })
  async getStatus(
    @Param('eventId') eventId: string,
  ): Promise<DistributionCalculationStatusDto> {
    return this.getDistributionCalculationStatusUseCase.execute(eventId);
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
      body.seatIndex,
    );
  }

  @Post('placements/:guestId/move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mover invitado asignado a otra mesa (propuesta en borrador)',
  })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiParam({ name: 'guestId', example: 'guest-1' })
  @ApiHeader({
    name: 'x-taulamic-actor-role',
    required: true,
    description: 'Debe ser admin.',
  })
  @ApiOkResponse({ type: DistributionProposalDto })
  @ApiForbiddenResponse({ description: 'Solo admin puede mover.' })
  @ApiConflictResponse({
    description: 'Propuesta confirmada, mesa llena o regla dura.',
  })
  @ApiNotFoundResponse({ description: 'Sin propuesta o evento inexistente.' })
  async moveGuest(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Body() body: AssignGuestDto,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<DistributionProposalDto> {
    return this.moveGuestInDistributionUseCase.execute(
      eventId,
      guestId,
      body.tableId,
      actorRole,
      body.seatIndex,
    );
  }

  @Put('placements/:guestId/seat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar asiento de un invitado en su mesa (propuesta en borrador)',
  })
  @ApiParam({ name: 'eventId', example: 'evt_550e8400' })
  @ApiParam({ name: 'guestId', example: 'guest-1' })
  @ApiHeader({
    name: 'x-taulamic-actor-role',
    required: true,
    description: 'Debe ser admin.',
  })
  @ApiOkResponse({ type: DistributionProposalDto })
  @ApiForbiddenResponse({ description: 'Solo admin puede cambiar el asiento.' })
  @ApiConflictResponse({
    description: 'Propuesta confirmada, asiento invalido o invitado no asignado.',
  })
  @ApiNotFoundResponse({ description: 'Sin propuesta o evento inexistente.' })
  async updateGuestSeat(
    @Param('eventId') eventId: string,
    @Param('guestId') guestId: string,
    @Body() body: UpdateGuestSeatDto,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<DistributionProposalDto> {
    return this.updateGuestSeatInDistributionUseCase.execute(
      eventId,
      guestId,
      body.seatIndex,
      actorRole,
    );
  }
}
