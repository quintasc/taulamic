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
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../../guest-import/infrastructure/persistence/guest.repository.port';
import { finalizeManualPlacementMutation } from '../domain/finalize-manual-placement-mutation';
import type { DistributionProposal } from '../domain/distribution.types';
import {
  UpdateGuestSeatError,
  updateGuestSeatInProposal,
} from '../domain/update-guest-seat-in-proposal';
import { persistScoredProposal } from './persist-scored-proposal';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';

@Injectable()
export class UpdateGuestSeatInDistributionUseCase {
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
    guestId: string,
    seatIndex: number,
    actorRole: ActorRole,
  ): Promise<DistributionProposal> {
    this.assertAdminActorUseCase.execute(actorRole);
    const event = await this.requireEvent(eventId);

    const proposal =
      await this.distributionRepository.findLatestByEventId(eventId);

    if (!proposal) {
      throw new NotFoundException({
        code: 'DISTRIBUTION_NOT_FOUND',
        message: 'No hay ninguna propuesta de distribucion para este evento.',
        details: { eventId },
      });
    }

    const guests = await this.guestRepository.listGuests(eventId);

    try {
      const updated = updateGuestSeatInProposal(proposal, {
        guestId,
        seatIndex,
        tables: event.tables,
      });
      const withWarnings = finalizeManualPlacementMutation(
        updated,
        guests,
        guestId,
      );
      return persistScoredProposal(
        this.distributionRepository,
        withWarnings,
        guests,
        event.tables,
        proposal.appliedSoftRules,
      );
    } catch (error) {
      if (error instanceof UpdateGuestSeatError) {
        throw new ConflictException({
          code: error.code,
          message: error.message,
          details: { guestId, seatIndex },
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
