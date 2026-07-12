import { Injectable } from '@nestjs/common';
import type { DistributionStatus } from '../domain/distribution.types';
import type {
  DistributionCalculationStatus,
  DistributionCalculationState,
} from './distribution-calculation-status';

type ActiveCalculationEntry = {
  eventId: string;
  proposalId: string;
  state: DistributionCalculationState;
  phase: DistributionCalculationStatus['phase'];
  progressPercent: number;
  startedAt: string;
  updatedAt: string;
  estimatedDurationMs: number | null;
  message?: string;
};

@Injectable()
export class DistributionCalculationTrackerService {
  private readonly activeByEventId = new Map<string, ActiveCalculationEntry>();

  markQueued(input: {
    eventId: string;
    proposalId: string;
    startedAt: string;
    message?: string;
  }): void {
    const now = new Date().toISOString();
    this.activeByEventId.set(input.eventId, {
      eventId: input.eventId,
      proposalId: input.proposalId,
      state: 'calculating',
      phase: 'queued',
      progressPercent: 5,
      startedAt: input.startedAt,
      updatedAt: now,
      estimatedDurationMs: null,
      message: input.message,
    });
  }

  markComputing(input: {
    eventId: string;
    proposalId: string;
    estimatedDurationMs: number | null;
    message?: string;
  }): void {
    this.updateCurrent(input.eventId, input.proposalId, (current) => ({
      ...current,
      state: 'calculating',
      phase: 'computing',
      progressPercent: Math.max(current.progressPercent, 12),
      estimatedDurationMs:
        input.estimatedDurationMs !== null && input.estimatedDurationMs > 0
          ? input.estimatedDurationMs
          : null,
      updatedAt: new Date().toISOString(),
      message: input.message ?? current.message,
    }));
  }

  tickComputing(eventId: string, proposalId: string): void {
    this.updateCurrent(eventId, proposalId, (current) => {
      if (current.phase !== 'computing') {
        return current;
      }
      const elapsedMs = this.elapsedMsFrom(current.startedAt);
      const estimatedDurationMs = current.estimatedDurationMs;
      const progressByTime =
        estimatedDurationMs === null || estimatedDurationMs <= 0
          ? current.progressPercent + 1
          : 12 + Math.floor((elapsedMs / estimatedDurationMs) * 72);
      const boundedProgress = Math.min(
        90,
        Math.max(current.progressPercent, progressByTime),
      );
      return {
        ...current,
        progressPercent: boundedProgress,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  markPersisting(input: {
    eventId: string;
    proposalId: string;
    message?: string;
  }): void {
    this.updateCurrent(input.eventId, input.proposalId, (current) => ({
      ...current,
      state: 'calculating',
      phase: 'persisting',
      progressPercent: Math.max(current.progressPercent, 94),
      updatedAt: new Date().toISOString(),
      message: input.message ?? current.message,
    }));
  }

  markCompleted(input: {
    eventId: string;
    proposalId: string;
    proposalStatus: Extract<DistributionStatus, 'draft' | 'confirmed'>;
    message?: string;
  }): void {
    this.updateCurrent(input.eventId, input.proposalId, (current) => ({
      ...current,
      state: input.proposalStatus,
      phase: 'completed',
      progressPercent: 100,
      updatedAt: new Date().toISOString(),
      message: input.message ?? current.message,
    }));
  }

  markFailed(input: {
    eventId: string;
    proposalId: string;
    message: string;
  }): void {
    this.updateCurrent(input.eventId, input.proposalId, (current) => ({
      ...current,
      state: 'failed',
      phase: 'failed',
      progressPercent: 100,
      updatedAt: new Date().toISOString(),
      message: input.message,
    }));
  }

  get(eventId: string): DistributionCalculationStatus | null {
    const current = this.activeByEventId.get(eventId);
    if (!current) {
      return null;
    }
    const elapsedMs = this.elapsedMsFrom(current.startedAt);
    const estimatedRemainingMs =
      current.state === 'calculating' &&
      current.estimatedDurationMs !== null &&
      current.estimatedDurationMs > elapsedMs
        ? current.estimatedDurationMs - elapsedMs
        : null;
    return {
      eventId: current.eventId,
      proposalId: current.proposalId,
      state: current.state,
      phase: current.phase,
      progressPercent: current.progressPercent,
      startedAt: current.startedAt,
      updatedAt: current.updatedAt,
      elapsedMs,
      estimatedRemainingMs,
      message: current.message,
    };
  }

  clearIfMatches(eventId: string, proposalId: string): void {
    const current = this.activeByEventId.get(eventId);
    if (current?.proposalId === proposalId) {
      this.activeByEventId.delete(eventId);
    }
  }

  private updateCurrent(
    eventId: string,
    proposalId: string,
    updater: (entry: ActiveCalculationEntry) => ActiveCalculationEntry,
  ): void {
    const current = this.activeByEventId.get(eventId);
    if (!current || current.proposalId !== proposalId) {
      return;
    }
    this.activeByEventId.set(eventId, updater(current));
  }

  private elapsedMsFrom(startedAtIso: string): number {
    const startedAtMs = Date.parse(startedAtIso);
    if (!Number.isFinite(startedAtMs)) {
      return 0;
    }
    return Math.max(0, Date.now() - startedAtMs);
  }
}

