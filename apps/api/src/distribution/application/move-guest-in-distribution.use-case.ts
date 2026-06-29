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
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../../guest-import/infrastructure/persistence/guest.repository.port';
import {
  MoveGuestError,
  moveGuestInProposal,
} from '../domain/move-guest-in-proposal';
import { finalizeManualPlacementMutation } from '../domain/finalize-manual-placement-mutation';
import type { DistributionProposal } from '../domain/distribution.types';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';
import {
  findGuestPlacement,
  findTableRef,
  recordDistributionPlacementAudit,
} from './record-distribution-placement-audit';

@Injectable()
export class MoveGuestInDistributionUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
    private readonly recordDistributionPlacementAuditUseCase: RecordDistributionPlacementAuditUseCase,
  ) {}

  async execute(
    eventId: string,
    guestId: string,
    tableId: string,
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
      const from = findGuestPlacement(proposal, guestId);
      const updated = moveGuestInProposal(proposal, {
        guestId,
        tableId,
        guests,
        tables: event.tables,
      });
      const saved = await this.distributionRepository.save(updated);
      const withWarnings = finalizeManualPlacementMutation(
        saved,
        guests,
        guestId,
      );
      const to = findTableRef(event.tables, tableId);
      if (from && to) {
        await recordDistributionPlacementAudit(
          this.recordDistributionPlacementAuditUseCase,
          {
            eventId,
            actorRole,
            guestId,
            action: 'move',
            from,
            to,
            companionSeparationWarning: Boolean(
              withWarnings.manualWarnings?.length,
            ),
          },
        );
      }
      return withWarnings;
    } catch (error) {
      if (error instanceof MoveGuestError) {
        throw new ConflictException({
          code: error.code,
          message: error.message,
          details: { guestId, tableId },
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
