import { Controller, Get, Param } from '@nestjs/common';
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
import { ListEventGovernanceAuditUseCase } from './application/governance-audit.use-case';
import {
  GovernanceAuditListResponseDto,
  toGovernanceAuditEntryDto,
} from './dto/governance-audit.dto';

@ApiTags('event-governance-audit')
@Controller('events/:eventId/governance-audit')
export class EventGovernanceAuditController {
  constructor(
    private readonly listEventGovernanceAuditUseCase: ListEventGovernanceAuditUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar auditoria de gobernanza del evento',
    description:
      'Historico unificado de cambios de modo y excepciones de acompanantes (quien/cuando/antes/despues). Solo admin.',
  })
  @ApiHeader({
    name: 'x-taulame-actor-role',
    required: false,
    description: 'Rol del actor: admin o guest. Por defecto admin.',
  })
  @ApiParam({ name: 'eventId', example: 'evt_123' })
  @ApiOkResponse({ type: GovernanceAuditListResponseDto })
  @ApiForbiddenResponse({ description: 'Solo administradores (ADMIN_REQUIRED).' })
  async listAudit(
    @Param('eventId') eventId: string,
    @ActorRoleHeader() actorRole: ActorRole,
  ): Promise<GovernanceAuditListResponseDto> {
    const entries = await this.listEventGovernanceAuditUseCase.execute(
      eventId,
      actorRole,
    );

    return {
      eventId,
      entries: entries.map(toGovernanceAuditEntryDto),
    };
  }
}
