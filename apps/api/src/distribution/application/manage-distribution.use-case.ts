import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AssertAdminActorUseCase } from '../../events/application/preference-permissions.use-case';
import type { ActorRole } from '../../common/domain/actor-role';
import type { EventConfig } from '../../events/domain/event-config';
import {
  EVENT_CONFIG_REPOSITORY,
  type EventConfigRepositoryPort,
} from '../../events/infrastructure/persistence/event-config.repository.port';
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../../guest-import/infrastructure/persistence/guest.repository.port';
import type { DistributionProposal } from '../domain/distribution.types';
import { runMotorV0 } from '../domain/motor-v0.engine';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';

@Injectable()
export class RunDistributionUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    actorRole: ActorRole,
  ): Promise<DistributionProposal> {
    this.assertAdminActorUseCase.execute(actorRole);
    const event = await this.requireEvent(eventId);
    this.assertDistributionEditable(event);

    const [guests] = await Promise.all([
      this.guestRepository.listGuests(eventId),
    ]);

    if (event.tables.length === 0) {
      throw new BadRequestException({
        code: 'MOTOR_NO_TABLES',
        message: 'El evento no tiene mesas configuradas.',
      });
    }

    if (guests.length === 0) {
      throw new BadRequestException({
        code: 'MOTOR_NO_GUESTS',
        message: 'El evento no tiene invitados registrados.',
      });
    }

    const existing =
      await this.distributionRepository.findLatestByEventId(eventId);

    if (existing?.status === 'confirmed') {
      throw new ConflictException({
        code: 'DISTRIBUTION_ALREADY_CONFIRMED',
        message:
          'Ya existe una distribucion confirmada. No se puede recalcular en piloto v0.',
      });
    }

    const totalCapacity = event.tables.reduce(
      (sum, table) => sum + table.capacity,
      0,
    );

    if (totalCapacity < guests.length) {
      throw new BadRequestException({
        code: 'MOTOR_INSUFFICIENT_CAPACITY',
        message: `Capacidad total (${totalCapacity}) inferior al numero de invitados (${guests.length}).`,
      });
    }

    const createdAt = new Date().toISOString();
    const proposalId = `dist_${randomUUID()}`;
    const motorResult = runMotorV0({
      eventId,
      proposalId,
      tables: event.tables,
      guests,
      createdAt,
    });

    const proposal: DistributionProposal = {
      id: proposalId,
      eventId,
      motorVersion: motorResult.motorVersion,
      status: 'draft',
      placements: motorResult.placements,
      unassignedGuestIds: motorResult.unassignedGuestIds,
      hardRuleViolations: motorResult.hardRuleViolations,
      stats: motorResult.stats,
      createdAt,
      confirmedAt: null,
    };

    return this.distributionRepository.save(proposal);
  }

  private async requireEvent(eventId: string): Promise<EventConfig> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    return event;
  }

  private assertDistributionEditable(event: EventConfig): void {
    if (event.status === 'plan_approved') {
      throw new ConflictException({
        code: 'EVENT_PLAN_APPROVED',
        message:
          'No se puede recalcular la distribucion tras aprobar el plan final.',
      });
    }
  }
}

@Injectable()
export class GetDistributionUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
  ) {}

  async execute(eventId: string): Promise<DistributionProposal> {
    await this.requireEvent(eventId);

    const proposal =
      await this.distributionRepository.findLatestByEventId(eventId);

    if (!proposal) {
      throw new NotFoundException({
        code: 'DISTRIBUTION_NOT_FOUND',
        message: 'No hay ninguna propuesta de distribucion para este evento.',
        details: { eventId },
      });
    }

    return proposal;
  }

  private async requireEvent(eventId: string): Promise<EventConfig> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    return event;
  }
}

@Injectable()
export class ConfirmDistributionUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    actorRole: ActorRole,
  ): Promise<DistributionProposal> {
    this.assertAdminActorUseCase.execute(actorRole);
    await this.requireEvent(eventId);

    const proposal =
      await this.distributionRepository.findLatestByEventId(eventId);

    if (!proposal) {
      throw new NotFoundException({
        code: 'DISTRIBUTION_NOT_FOUND',
        message: 'No hay ninguna propuesta de distribucion para confirmar.',
        details: { eventId },
      });
    }

    if (proposal.status === 'confirmed') {
      throw new ConflictException({
        code: 'DISTRIBUTION_ALREADY_CONFIRMED',
        message: 'La distribucion ya estaba confirmada.',
      });
    }

    if (proposal.unassignedGuestIds.length > 0) {
      throw new ConflictException({
        code: 'MOTOR_UNASSIGNED_GUESTS',
        message:
          'No se puede confirmar una distribucion con invitados sin asignar.',
        details: { unassignedGuestIds: proposal.unassignedGuestIds },
      });
    }

    if (proposal.hardRuleViolations.length > 0) {
      throw new ConflictException({
        code: 'MOTOR_HARD_VIOLATIONS',
        message:
          'No se puede confirmar una distribucion con violaciones de reglas duras.',
        details: { violations: proposal.hardRuleViolations },
      });
    }

    const confirmedAt = new Date().toISOString();
    const confirmed: DistributionProposal = {
      ...proposal,
      status: 'confirmed',
      confirmedAt,
    };

    await this.eventRepository.approvePlan(eventId);
    return this.distributionRepository.save(confirmed);
  }

  private async requireEvent(eventId: string): Promise<EventConfig> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    return event;
  }
}
