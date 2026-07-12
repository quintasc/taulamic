import type { SoftRuleKind } from './distribution-engine.port';

export const MOTOR_VERSION_V0_PILOT = 'v0-pilot' as const;

/** Motor CP-SAT en dos fases (ADR-023). */
export const MOTOR_VERSION_V1_CPSAT = 'v1-cpsat' as const;

export type MotorVersion =
  | typeof MOTOR_VERSION_V0_PILOT
  | typeof MOTOR_VERSION_V1_CPSAT;

export const DISTRIBUTION_STATUSES = [
  'calculating',
  'draft',
  'confirmed',
] as const;

export type DistributionStatus = (typeof DISTRIBUTION_STATUSES)[number];

export type GuestPlacement = {
  guestId: string;
  guestName: string;
  tableId: string;
  tableLabel: string;
  /** Fase 2 (ADR-023): asiento intra-mesa; ausente en motor v0. */
  seatIndex?: number;
  seatLabel?: string;
};

export type HardRuleViolation = {
  code: string;
  message: string;
  guestIds: string[];
};

export type ManualPlacementWarning = {
  code: 'COMPANION_SEPARATED';
  message: string;
  guestIds: string[];
};

export type DistributionStats = {
  assignedCount: number;
  unassignedCount: number;
  tableCount: number;
  totalCapacity: number;
};

export type CompatibilityCriterionScore = {
  key: string;
  label: string;
  earnedPoints: number;
  maxPoints: number;
  /** 0-100 con un decimal. */
  percent: number;
  /** Texto aclaratorio para la UI (ej. unidad evaluada). */
  detail?: string;
};

/** Afinidad por mesa (vínculos personales cumplidos en una mesa concreta). */
export type TableAffinityScore = {
  tableId: string;
  earnedPoints: number;
  maxPoints: number;
  percent: number;
  detail: string;
};

/** Compatibilidad / afinidad de la propuesta (evaluacion post-hoc, HU-17). */
export type DistributionCompatibilityScore = {
  globalPercent: number;
  earnedPoints: number;
  maxPoints: number;
  criteria: CompatibilityCriterionScore[];
};

export type DistributionProposal = {
  id: string;
  eventId: string;
  motorVersion: MotorVersion;
  status: DistributionStatus;
  placements: GuestPlacement[];
  unassignedGuestIds: string[];
  hardRuleViolations: HardRuleViolation[];
  stats: DistributionStats;
  createdAt: string;
  confirmedAt: string | null;
  /** Reglas blandas usadas al calcular (para re-evaluar tras ajustes manuales). */
  appliedSoftRules?: SoftRuleKind[];
  /** Compatibilidad global y desglose por criterio. */
  compatibilityScore?: DistributionCompatibilityScore;
  /** Compatibilidad por mesa (mismas reglas que el índice global, acotado a la mesa). */
  tableAffinityScores?: TableAffinityScore[];
  /** Solo en respuestas de mutacion manual HU-05; no persistido. */
  manualWarnings?: ManualPlacementWarning[];
};
