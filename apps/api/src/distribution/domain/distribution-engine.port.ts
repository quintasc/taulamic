import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal, MotorVersion } from './distribution.types';

export const DISTRIBUTION_ENGINE = Symbol('DISTRIBUTION_ENGINE');

/**
 * Reglas genericas de la pantalla de afinidades (ADR-018).
 * El orden del array define la prioridad: indice 0 domina al 1, etc. (HU-17).
 */
export const SOFT_RULE_KINDS = [
  'groupByCategory',
  'keepFamiliesTogether',
  'singlesTable',
  'separateKnownIncompatibles',
  'groupByAge',
  'alternateGender',
] as const;

export type SoftRuleKind = (typeof SOFT_RULE_KINDS)[number];

export type ExplicitAffinityRelation = {
  guestA: string;
  guestB: string;
  type: 'afinidad' | 'incompatibilidad';
};

export type ExplicitCategoryAffinityRelation = {
  categoryA: string;
  categoryB: string;
  type: 'afinidad' | 'incompatibilidad';
};

/**
 * Matriz de afinidad entre categorías para mesas híbridas:
 * - valor > 0: favorece mezclar ese par de categorías
 * - valor < 0: penaliza mezclar ese par de categorías
 */
export type CategoryAffinityMatrix = Readonly<
  Record<string, Readonly<Record<string, number>>>
>;

export type DistributionEngineInput = {
  eventId: string;
  proposalId: string;
  tables: EventTable[];
  guests: Guest[];
  createdAt: string;
  /** Presupuesto de tiempo del solver; ignorado por motores no acotados. */
  timeBudgetMs?: number;
  /**
   * Reglas blandas activas en orden de prioridad (posicion 1 = indice 0).
   * Si se omite, el motor solo maximiza invitados asignados.
   */
  softRules?: SoftRuleKind[];
  /**
   * Afinidades/incompatibilidades declaradas en pantalla Afinidades (por nombre).
   * Complementa guest.restrictions cuando aún no están persistidas en servidor.
   */
  explicitAffinityRelations?: ExplicitAffinityRelation[];
  /**
   * Afinidad social entre categorías para guiar mezclas en Fase 1.
   * Si no se proporciona, el motor aplica una matriz por defecto.
   */
  categoryAffinityMatrix?: CategoryAffinityMatrix;
  /**
   * Catálogo id→nombre para excluir metadatos del agrupado (p. ej. «Pareja»).
   */
  categoryCatalog?: ReadonlyArray<{ id: string; name: string }>;
};

export type SolverStatus = 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'UNKNOWN';

export type DistributionEngineResult = Pick<
  DistributionProposal,
  | 'placements'
  | 'unassignedGuestIds'
  | 'hardRuleViolations'
  | 'stats'
  | 'motorVersion'
> & {
  /** HU-17: valor de la funcion objetivo; undefined en motores sin objetivo. */
  objectiveScore?: number;
  solverStatus?: SolverStatus;
};

/**
 * Puerto Strategy del motor de distribucion (ADR-023, SDD-01 seccion 14).
 * Permite convivir motor v0 greedy y CP-SAT tras el mismo contrato.
 */
export interface DistributionEngine {
  readonly motorVersion: MotorVersion;
  compute(input: DistributionEngineInput): Promise<DistributionEngineResult>;
}
