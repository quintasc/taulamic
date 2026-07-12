import { buildCompanionGroups } from '../../guest-import/domain/companion-group.engine';
import type { Guest } from '../../guest-import/domain/guest';

/**
 * Unidad indivisible de colocacion: un invitado suelto o un grupo de
 * acompanantes con keepTogether (regla dura SDD seccion 7.1).
 */
export type PlacementUnit = {
  guestIds: string[];
  keepTogether: boolean;
};

export function buildPlacementUnits(guests: Guest[]): PlacementUnit[] {
  const groups = buildCompanionGroups(guests);
  const groupedGuestIds = new Set<string>();
  const units: PlacementUnit[] = [];

  for (const group of groups) {
    for (const guestId of group.guestIds) {
      groupedGuestIds.add(guestId);
    }

    if (group.keepTogether) {
      units.push({ guestIds: group.guestIds, keepTogether: true });
      continue;
    }

    for (const guestId of group.guestIds) {
      units.push({ guestIds: [guestId], keepTogether: false });
    }
  }

  for (const guest of guests) {
    if (!groupedGuestIds.has(guest.id)) {
      units.push({ guestIds: [guest.id], keepTogether: false });
    }
  }

  return units.sort(
    (left, right) => right.guestIds.length - left.guestIds.length,
  );
}

export function hasInternalIncompatibility(members: Guest[]): boolean {
  for (let left = 0; left < members.length; left += 1) {
    for (let right = left + 1; right < members.length; right += 1) {
      if (areIncompatible(members[left], members[right])) {
        return true;
      }
    }
  }

  return false;
}

export function hasCrossIncompatibility(
  incoming: Guest[],
  tablemates: Guest[],
): boolean {
  for (const guest of incoming) {
    for (const tablemate of tablemates) {
      if (areIncompatible(guest, tablemate)) {
        return true;
      }
    }
  }

  return false;
}

export function areIncompatible(left: Guest, right: Guest): boolean {
  return (
    hasRestrictionToward(left, right.nombre, 'incompatibilidad') ||
    hasRestrictionToward(right, left.nombre, 'incompatibilidad')
  );
}

/** Afinidad declarada por persona (restriccion kind 'afinidad' con targetHint). */
export function areAffine(left: Guest, right: Guest): boolean {
  return (
    hasRestrictionToward(left, right.nombre, 'afinidad') ||
    hasRestrictionToward(right, left.nombre, 'afinidad')
  );
}

export function sharesCategory(left: Guest, right: Guest): boolean {
  if (left.categoriaIds.length === 0 || right.categoriaIds.length === 0) {
    return false;
  }
  const rightSet = new Set(right.categoriaIds);
  return left.categoriaIds.some((categoryId) => rightSet.has(categoryId));
}

function hasRestrictionToward(
  from: Guest,
  targetName: string,
  kind: 'incompatibilidad' | 'afinidad',
): boolean {
  return from.restrictions.some(
    (restriction) =>
      restriction.kind === kind &&
      restriction.targetHint !== null &&
      namesMatch(targetName, restriction.targetHint),
  );
}

function namesMatch(guestName: string, targetHint: string): boolean {
  const normalizedGuest = normalizeName(guestName);
  const normalizedTarget = normalizeName(targetHint);

  return (
    normalizedGuest.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedGuest)
  );
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}
