import { buildCompanionGroups } from '../../guest-import/domain/companion-group.engine';
import type { Guest } from '../../guest-import/domain/guest';
import type { ExplicitAffinityRelation } from './distribution-engine.port';
import { guestNamePairKey, guestNamesMatch } from './guest-name-match';

export type CompanionAffinityPartition = {
  /** Solo enlaces opcionales dibujados en UI (no parejas Excel). */
  uiExplicitAffinityRelations: ExplicitAffinityRelation[];
  /** Relaciones elevadas a regla dura D3 (acompanante_key + keepTogether). */
  strippedCompanionRelations: ExplicitAffinityRelation[];
};

/**
 * Pares de nombres que deben compartir mesa por regla dura D3 (ADR-012).
 * Incluye grupos de 3+ con la misma acompanante_key.
 */
export function buildKeepTogetherCompanionNamePairKeys(
  guests: Guest[],
): Set<string> {
  const groups = buildCompanionGroups(guests);
  const pairKeys = new Set<string>();

  for (const group of groups) {
    if (!group.keepTogether || group.guestNames.length < 2) {
      continue;
    }

    for (let left = 0; left < group.guestNames.length; left += 1) {
      for (let right = left + 1; right < group.guestNames.length; right += 1) {
        pairKeys.add(
          guestNamePairKey(group.guestNames[left], group.guestNames[right]),
        );
      }
    }
  }

  return pairKeys;
}

export function isKeepTogetherCompanionAffinity(
  relation: ExplicitAffinityRelation,
  companionNamePairKeys: Set<string>,
): boolean {
  if (relation.type !== 'afinidad') {
    return false;
  }

  if (
    companionNamePairKeys.has(
      guestNamePairKey(relation.guestA, relation.guestB),
    )
  ) {
    return true;
  }

  return companionNamePairKeysHasFuzzyMatch(
    relation,
    companionNamePairKeys,
  );
}

/** Respaldo si los nombres del payload difieren ligeramente del invitado en BD. */
function companionNamePairKeysHasFuzzyMatch(
  relation: ExplicitAffinityRelation,
  companionNamePairKeys: Set<string>,
): boolean {
  for (const key of companionNamePairKeys) {
    const [leftName, rightName] = key.split('|');
    const matchesForward =
      guestNamesMatch(relation.guestA, leftName) &&
      guestNamesMatch(relation.guestB, rightName);
    const matchesReverse =
      guestNamesMatch(relation.guestA, rightName) &&
      guestNamesMatch(relation.guestB, leftName);
    if (matchesForward || matchesReverse) {
      return true;
    }
  }

  return false;
}

/**
 * Separa afinidades explícitas de UI de parejas Excel ya cubiertas por D3.
 * Las parejas eliminadas NO deben alimentar objetivos blandos (Fase 2 sillas).
 */
export function partitionExplicitAffinityRelations(
  guests: Guest[],
  relations: ExplicitAffinityRelation[] | undefined,
): CompanionAffinityPartition {
  if (relations === undefined || relations.length === 0) {
    return {
      uiExplicitAffinityRelations: [],
      strippedCompanionRelations: [],
    };
  }

  const companionNamePairKeys =
    buildKeepTogetherCompanionNamePairKeys(guests);
  const uiExplicitAffinityRelations: ExplicitAffinityRelation[] = [];
  const strippedCompanionRelations: ExplicitAffinityRelation[] = [];

  for (const relation of relations) {
    if (isKeepTogetherCompanionAffinity(relation, companionNamePairKeys)) {
      strippedCompanionRelations.push(relation);
      continue;
    }
    uiExplicitAffinityRelations.push(relation);
  }

  return {
    uiExplicitAffinityRelations,
    strippedCompanionRelations,
  };
}
