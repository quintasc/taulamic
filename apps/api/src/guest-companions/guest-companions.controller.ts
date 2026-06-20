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
  EvaluateCompanionGroupUseCase,
  ListCompanionGroupsUseCase,
  RevertCompanionGroupSeparationUseCase,
  SeparateCompanionGroupUseCase,
} from './application/manage-companion-groups.use-case';
import {
  CompanionGroupEvaluationDto,
  CompanionGroupListResponseDto,
  SeparateCompanionGroupDto,
  toCompanionGroupDto,
  toCompanionGroupEvaluationDto,
} from './dto/companion-group.dto';

@ApiTags('guest-companions')
@Controller('events/:eventId/companion-groups')
export class GuestCompanionsController {
  constructor(
    private readonly listCompanionGroupsUseCase: ListCompanionGroupsUseCase,
    private readonly evaluateCompanionGroupUseCase: EvaluateCompanionGroupUseCase,
    private readonly separateCompanionGroupUseCase: SeparateCompanionGroupUseCase,
    private readonly revertCompanionGroupSeparationUseCase: RevertCompanionGroupSeparationUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Listar grupos de acompanantes del evento',
    description:
      'Agrupa invitados por acompanante_key. Por defecto keepTogether=true salvo excepcion explicita.',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiOkResponse({ type: CompanionGroupListResponseDto })
  async listGroups(
    @Param('eventId') eventId: string,
  ): Promise<CompanionGroupListResponseDto> {
    const groups = await this.listCompanionGroupsUseCase.execute(eventId);
    return {
      eventId,
      groups: groups.map(toCompanionGroupDto),
    };
  }

  @Get(':groupKey/evaluation')
  @ApiOperation({
    summary: 'Evaluar si un grupo puede sentarse junto',
    description:
      'Detecta incompatibilidades duras entre miembros cuando keepTogether=true.',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiParam({ name: 'groupKey', example: 'PAREJA_001' })
  @ApiOkResponse({ type: CompanionGroupEvaluationDto })
  async evaluateGroup(
    @Param('eventId') eventId: string,
    @Param('groupKey') groupKey: string,
  ): Promise<CompanionGroupEvaluationDto> {
    const evaluation = await this.evaluateCompanionGroupUseCase.execute(
      eventId,
      groupKey,
    );
    return toCompanionGroupEvaluationDto(evaluation);
  }

  @Post(':groupKey/separate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar excepcion explicita para no sentar juntos',
    description:
      'Solo administradores. Persiste motivo auditado con origen admin.',
  })
  @ApiHeader({
    name: 'x-taulame-actor-role',
    required: false,
    description: 'Rol del actor: admin o guest. Por defecto admin.',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiParam({ name: 'groupKey', example: 'PAREJA_001' })
  @ApiOkResponse({ type: CompanionGroupListResponseDto })
  @ApiForbiddenResponse({ description: 'Solo administradores (ADMIN_REQUIRED).' })
  async separateGroup(
    @Param('eventId') eventId: string,
    @Param('groupKey') groupKey: string,
    @ActorRoleHeader() actorRole: ActorRole,
    @Body() body: SeparateCompanionGroupDto,
  ): Promise<CompanionGroupListResponseDto> {
    const groups = await this.separateCompanionGroupUseCase.execute(
      eventId,
      groupKey,
      actorRole,
      body.reason,
    );
    return {
      eventId,
      groups: groups.map(toCompanionGroupDto),
    };
  }

  @Post(':groupKey/revert-separation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revertir excepcion y volver a regla juntos por defecto',
    description: 'Solo administradores.',
  })
  @ApiHeader({
    name: 'x-taulame-actor-role',
    required: false,
    description: 'Rol del actor: admin o guest. Por defecto admin.',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiParam({ name: 'groupKey', example: 'PAREJA_001' })
  @ApiOkResponse({ type: CompanionGroupListResponseDto })
  @ApiForbiddenResponse({ description: 'Solo administradores (ADMIN_REQUIRED).' })
  async revertSeparation(
    @Param('eventId') eventId: string,
    @Param('groupKey') groupKey: string,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<CompanionGroupListResponseDto> {
    const groups = await this.revertCompanionGroupSeparationUseCase.execute(
      eventId,
      groupKey,
      actorRole,
    );
    return {
      eventId,
      groups: groups.map(toCompanionGroupDto),
    };
  }
}
