import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RecordDistributionPlacementAuditUseCase } from '../../event-governance-audit/application/governance-audit.use-case';
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
import { finalizeManualPlacementMutation } from '../domain/finalize-manual-placement-mutation';
import { persistScoredProposal } from './persist-scored-proposal';
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../../guest-import/infrastructure/persistence/guest.repository.port';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';
import {
  findGuestPlacement,
  recordDistributionPlacementAudit,
} from './record-distribution-placement-audit';

@Injectable()
export class UnassignGuestFromDistributionUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
    private readonly recordDistributionPlacementAuditUseCase: RecordDistributionPlacementAuditUseCase,
  ) {}

  async execute(
    eventId: string,
    guestId: string,
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

    try {
      const from = findGuestPlacement(proposal, guestId);
      const updated = unassignGuestFromProposal(proposal, guestId);
      const guests = await this.guestRepository.listGuests(eventId);
      const withWarnings = finalizeManualPlacementMutation(
        updated,
        guests,
        guestId,
      );
      const scored = await persistScoredProposal(
        this.distributionRepository,
        withWarnings,
        guests,
        event.tables,
        proposal.appliedSoftRules,
      );
      if (from) {
        await recordDistributionPlacementAudit(
          this.recordDistributionPlacementAuditUseCase,
          {
            eventId,
            actorRole,
            guestId,
            action: 'unassign',
            from,
            to: null,
            companionSeparationWarning: Boolean(
              scored.manualWarnings?.length,
            ),
          },
        );
      }
      return scored;
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
