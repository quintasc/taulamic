import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssertAdminActorUseCase } from '../../events/application/preference-permissions.use-case';
import type { ActorRole } from '../../common/domain/actor-role';
import type { EventConfig } from '../../events/domain/event-config';
import {
  EVENT_CONFIG_REPOSITORY,
  type EventConfigRepositoryPort,
} from '../../events/infrastructure/persistence/event-config.repository.port';
import type { DistributionProposal } from '../domain/distribution.types';
import {
  UnassignGuestError,
  unassignGuestFromProposal,
} from '../domain/unassign-guest-from-proposal';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';

@Injectable()
export class UnassignGuestFromDistributionUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    guestId: string,
    actorRole: ActorRole,
  ): Promise<DistributionProposal> {
    this.assertAdminActorUseCase.execute(actorRole);
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

    try {
      const updated = unassignGuestFromProposal(proposal, guestId);
      return this.distributionRepository.save(updated);
    } catch (error) {
      if (error instanceof UnassignGuestError) {
        throw new ConflictException({
          code: error.code,
          message: error.message,
          details: { guestId },
        });
      }
      throw error;
    }
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
