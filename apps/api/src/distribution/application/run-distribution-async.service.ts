import { Inject, Injectable, Logger } from '@nestjs/common';
import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import {
  DISTRIBUTION_ENGINE,
  type DistributionEngine,
  type DistributionEngineInput,
  type SoftRuleKind,
} from '../domain/distribution-engine.port';
import type { DistributionProposal } from '../domain/distribution.types';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../infrastructure/persistence/distribution.repository.port';
import { persistScoredProposal } from './persist-scored-proposal';
import { DistributionCalculationTrackerService } from './distribution-calculation-tracker.service';

export type RunDistributionAsyncJobInput = {
  eventId: string;
  proposalId: string;
  createdAt: string;
  tables: EventTable[];
  guests: Guest[];
  softRules?: SoftRuleKind[];
  explicitAffinityRelations?: DistributionEngineInput['explicitAffinityRelations'];
  categoryAffinityMatrix?: DistributionEngineInput['categoryAffinityMatrix'];
};

@Injectable()
export class RunDistributionAsyncService {
  private readonly logger = new Logger(RunDistributionAsyncService.name);
  private readonly activeProposalByEventId = new Map<string, string>();

  constructor(
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
    @Inject(DISTRIBUTION_ENGINE)
    private readonly distributionEngine: DistributionEngine,
    private readonly tracker: DistributionCalculationTrackerService,
  ) {}

  schedule(input: RunDistributionAsyncJobInput): void {
    this.activeProposalByEventId.set(input.eventId, input.proposalId);
    this.tracker.markQueued({
      eventId: input.eventId,
      proposalId: input.proposalId,
      startedAt: input.createdAt,
      message: 'Cálculo en cola.',
    });
    setImmediate(() => {
      void this.executeJob(input);
    });
  }

  private async executeJob(input: RunDistributionAsyncJobInput): Promise<void> {
    const {
      eventId,
      proposalId,
      createdAt,
      tables,
      guests,
      softRules,
      explicitAffinityRelations,
      categoryAffinityMatrix,
    } = input;
    const estimatedDurationMs = this.estimateComputeDurationMs(input);
    this.tracker.markComputing({
      eventId,
      proposalId,
      estimatedDurationMs,
      message: 'Resolviendo distribución con CP-SAT.',
    });
    const heartbeat = setInterval(() => {
      this.tracker.tickComputing(eventId, proposalId);
    }, 1000);
    heartbeat.unref?.();

    try {
      const motorResult = await this.distributionEngine.compute({
        eventId,
        proposalId,
        createdAt,
        tables,
        guests,
        softRules,
        explicitAffinityRelations,
        categoryAffinityMatrix,
      });
      this.tracker.markPersisting({
        eventId,
        proposalId,
        message: 'Guardando propuesta calculada.',
      });

      const current = await this.findCurrentCalculatingProposal(
        eventId,
        proposalId,
      );
      if (!current) {
        return;
      }

      const proposal: DistributionProposal = {
        ...current,
        motorVersion: motorResult.motorVersion,
        status: 'draft',
        placements: motorResult.placements,
        unassignedGuestIds: motorResult.unassignedGuestIds,
        hardRuleViolations: motorResult.hardRuleViolations,
        stats: motorResult.stats,
      };

      await persistScoredProposal(
        this.distributionRepository,
        proposal,
        guests,
        tables,
        softRules,
      );
      this.tracker.markCompleted({
        eventId,
        proposalId,
        proposalStatus: 'draft',
        message: 'Cálculo completado.',
      });
    } catch (error) {
      this.logger.error(
        `Fallo en cálculo asíncrono de distribución para evento ${eventId}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.tracker.markFailed({
        eventId,
        proposalId,
        message:
          'El cálculo asíncrono falló. Reintenta la operación o revisa el servidor.',
      });

      const current = await this.findCurrentCalculatingProposal(
        eventId,
        proposalId,
      );
      if (!current) {
        return;
      }

      const fallback: DistributionProposal = {
        ...current,
        status: 'draft',
        placements: [],
        unassignedGuestIds: guests.map((guest) => guest.id),
        hardRuleViolations: [
          {
            code: 'ASYNC_DISTRIBUTION_ERROR',
            message:
              'El cálculo asíncrono falló. Reintenta la operación o revisa el servidor.',
            guestIds: guests.map((guest) => guest.id),
          },
        ],
        stats: {
          assignedCount: 0,
          unassignedCount: guests.length,
          tableCount: tables.length,
          totalCapacity: tables.reduce((sum, table) => sum + table.capacity, 0),
        },
      };

      await persistScoredProposal(
        this.distributionRepository,
        fallback,
        guests,
        tables,
        softRules,
      );
    } finally {
      clearInterval(heartbeat);
      const activeProposalId = this.activeProposalByEventId.get(eventId);
      if (activeProposalId === proposalId) {
        this.activeProposalByEventId.delete(eventId);
      }
      if (activeProposalId !== proposalId) {
        this.tracker.clearIfMatches(eventId, proposalId);
      }
    }
  }

  private async findCurrentCalculatingProposal(
    eventId: string,
    proposalId: string,
  ): Promise<DistributionProposal | null> {
    const current = await this.distributionRepository.findLatestByEventId(eventId);
    if (!current || current.id !== proposalId || current.status !== 'calculating') {
      return null;
    }
    return current;
  }

  private estimateComputeDurationMs(input: RunDistributionAsyncJobInput): number {
    const guestFactor = input.guests.length * 180;
    const tableFactor = input.tables.length * 850;
    const softRulesFactor = (input.softRules?.length ?? 0) * 1_000;
    return Math.min(
      90_000,
      Math.max(12_000, guestFactor + tableFactor + softRulesFactor),
    );
  }
}

