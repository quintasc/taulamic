export const DISTRIBUTION_CALCULATION_STATES = [
  'idle',
  'calculating',
  'draft',
  'confirmed',
  'failed',
] as const;

export type DistributionCalculationState =
  (typeof DISTRIBUTION_CALCULATION_STATES)[number];

export const DISTRIBUTION_CALCULATION_PHASES = [
  'queued',
  'computing',
  'persisting',
  'completed',
  'failed',
] as const;

export type DistributionCalculationPhase =
  (typeof DISTRIBUTION_CALCULATION_PHASES)[number];

export type DistributionCalculationStatus = {
  eventId: string;
  proposalId: string | null;
  state: DistributionCalculationState;
  phase: DistributionCalculationPhase;
  progressPercent: number;
  startedAt: string | null;
  updatedAt: string | null;
  elapsedMs: number | null;
  estimatedRemainingMs: number | null;
  message?: string;
};

