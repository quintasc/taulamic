import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { EventConfig } from '../../events/domain/event-config';
import {
  EVENT_CONFIG_REPOSITORY,
  type EventConfigRepositoryPort,
} from '../../events/infrastructure/persistence/event-config.repository.port';
import type { DistributionProposal } from '../domain/distribution.types';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';
import type { DistributionCalculationStatus } from './distribution-calculation-status';
import { DistributionCalculationTrackerService } from './distribution-calculation-tracker.service';

const ASYNC_ERROR_CODE = 'ASYNC_DISTRIBUTION_ERROR';
const DEFAULT_CALCULATING_ESTIMATE_MS = 45_000;
/** Timeout si el tracker en memoria sigue vivo (cálculo real largo). */
const STALE_CALCULATION_TIMEOUT_MS = 4 * 60_000;
/**
 * Sin tracker = job huérfano (reinicio API / crash). No esperar 4 min:
 * el proceso en memoria ya no existe.
 */
const ORPHAN_CALCULATION_TIMEOUT_MS = 8_000;

@Injectable()
export class GetDistributionCalculationStatusUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
    private readonly tracker: DistributionCalculationTrackerService,
  ) {}

  async execute(eventId: string): Promise<DistributionCalculationStatus> {
    await this.requireEvent(eventId);
    const proposal =
      await this.distributionRepository.findLatestByEventId(eventId);
    const tracked = this.tracker.get(eventId);

    if (!proposal) {
      return {
        eventId,
        proposalId: null,
        state: 'idle',
        phase: 'completed',
        progressPercent: 0,
        startedAt: null,
        updatedAt: null,
        elapsedMs: null,
        estimatedRemainingMs: null,
      };
    }

    if (proposal.status === 'calculating') {
      const elapsedMs = this.elapsedMs(proposal.createdAt);
      const trackerAlive =
        tracked !== null && tracked.proposalId === proposal.id;

      if (trackerAlive) {
        const trackedElapsedMs = tracked.elapsedMs ?? elapsedMs;
        if (trackedElapsedMs < STALE_CALCULATION_TIMEOUT_MS) {
          return tracked;
        }
        const staleMessage =
          this.buildStaleCalculationMessage(trackedElapsedMs);
        const recoveredProposal = await this.recoverStaleCalculation(
          proposal,
          staleMessage,
        );
        return this.buildCompletedStatus(
          eventId,
          recoveredProposal,
          'failed',
          'failed',
          staleMessage,
        );
      }

      if (elapsedMs >= ORPHAN_CALCULATION_TIMEOUT_MS) {
        const orphanMessage = this.buildOrphanCalculationMessage();
        const recoveredProposal = await this.recoverStaleCalculation(
          proposal,
          orphanMessage,
        );
        return this.buildCompletedStatus(
          eventId,
          recoveredProposal,
          'failed',
          'failed',
          orphanMessage,
        );
      }

      return {
        eventId,
        proposalId: proposal.id,
        state: 'calculating',
        phase: 'computing',
        progressPercent: Math.min(90, 12 + Math.floor(elapsedMs / 900)),
        startedAt: proposal.createdAt,
        updatedAt: proposal.createdAt,
        elapsedMs,
        estimatedRemainingMs: Math.max(
          0,
          DEFAULT_CALCULATING_ESTIMATE_MS - elapsedMs,
        ),
        message: 'Cálculo en curso.',
      };
    }

    const asyncError = proposal.hardRuleViolations.find(
      (violation) => violation.code === ASYNC_ERROR_CODE,
    );
    if (asyncError) {
      return this.buildCompletedStatus(
        eventId,
        proposal,
        'failed',
        'failed',
        asyncError.message,
      );
    }

    return this.buildCompletedStatus(
      eventId,
      proposal,
      proposal.status,
      'completed',
    );
  }

  private buildCompletedStatus(
    eventId: string,
    proposal: DistributionProposal,
    state: DistributionCalculationStatus['state'],
    phase: DistributionCalculationStatus['phase'],
    message?: string,
  ): DistributionCalculationStatus {
    const updatedAt = proposal.confirmedAt ?? proposal.createdAt;
    return {
      eventId,
      proposalId: proposal.id,
      state,
      phase,
      progressPercent: 100,
      startedAt: proposal.createdAt,
      updatedAt,
      elapsedMs: null,
      estimatedRemainingMs: null,
      message,
    };
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

  private elapsedMs(startedAtIso: string): number {
    const startedAt = Date.parse(startedAtIso);
    if (!Number.isFinite(startedAt)) {
      return 0;
    }
    return Math.max(0, Date.now() - startedAt);
  }

  private buildStaleCalculationMessage(elapsedMs: number): string {
    const elapsedSeconds = Math.round(elapsedMs / 1000);
    return `El cálculo asíncrono no finalizó tras ${elapsedSeconds} s y se marcó como fallido. Puedes relanzar el cálculo.`;
  }

  private buildOrphanCalculationMessage(): string {
    return 'El cálculo se interrumpió (reinicio del servidor o pérdida del proceso). Relanza el cálculo.';
  }

  private async recoverStaleCalculation(
    proposal: DistributionProposal,
    message: string,
  ): Promise<DistributionProposal> {
    const hasAsyncError = proposal.hardRuleViolations.some(
      (violation) => violation.code === ASYNC_ERROR_CODE,
    );
    const nextViolations = hasAsyncError
      ? proposal.hardRuleViolations.map((violation) =>
          violation.code === ASYNC_ERROR_CODE
            ? { ...violation, message }
            : violation,
        )
      : [
          ...proposal.hardRuleViolations,
          {
            code: ASYNC_ERROR_CODE,
            message,
            guestIds: proposal.unassignedGuestIds,
          },
        ];
    this.tracker.clearIfMatches(proposal.eventId, proposal.id);
    return this.distributionRepository.save({
      ...proposal,
      status: 'draft',
      hardRuleViolations: nextViolations,
    });
  }
}
