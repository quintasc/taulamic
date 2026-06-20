import type { Guest } from './guest';

export type CompanionSeparationException = {
  reason: string;
  origin: 'excel' | 'admin';
  recordedAt: string;
};

export type CompanionGroup = {
  key: string;
  guestIds: string[];
  guestNames: string[];
  keepTogether: boolean;
  exception: CompanionSeparationException | null;
};

export type CompanionPlacementBlocker = {
  guestId: string;
  guestName: string;
  otherGuestId: string;
  otherGuestName: string;
  restrictionKind: string;
};

export type CompanionGroupEvaluation = {
  groupKey: string;
  keepTogether: boolean;
  canKeepTogether: boolean;
  explanation: string | null;
  blockers: CompanionPlacementBlocker[];
};

export function buildCompanionGroups(guests: Guest[]): CompanionGroup[] {
  const grouped = new Map<string, Guest[]>();

  for (const guest of guests) {
    const key = guest.acompananteKey.trim();
    if (!key) {
      continue;
    }

    const members = grouped.get(key) ?? [];
    members.push(guest);
    grouped.set(key, members);
  }

  const groups: CompanionGroup[] = [];

  for (const [key, members] of grouped.entries()) {
    if (members.length < 2) {
      continue;
    }

    const separatedMember = members.find(
      (member) => member.separarAcompanante === true,
    );

    groups.push({
      key,
      guestIds: members.map((member) => member.id),
      guestNames: members.map((member) => member.nombre),
      keepTogether: separatedMember === undefined,
      exception:
        separatedMember && separatedMember.companionSeparationReason
          ? {
              reason: separatedMember.companionSeparationReason,
              origin: separatedMember.companionSeparationOrigin ?? 'excel',
              recordedAt:
                separatedMember.companionSeparationAt ??
                separatedMember.updatedAt,
            }
          : null,
    });
  }

  return groups.sort((left, right) => left.key.localeCompare(right.key));
}

export function evaluateCompanionGroup(
  guests: Guest[],
  groupKey: string,
): CompanionGroupEvaluation {
  const members = guests.filter(
    (guest) => guest.acompananteKey.trim() === groupKey.trim(),
  );

  if (members.length < 2) {
    return {
      groupKey,
      keepTogether: true,
      canKeepTogether: true,
      explanation: 'No hay un grupo de acompanantes con esa clave.',
      blockers: [],
    };
  }

  const group = buildCompanionGroups(guests).find((item) => item.key === groupKey);
  const keepTogether = group?.keepTogether ?? true;

  if (!keepTogether) {
    return {
      groupKey,
      keepTogether: false,
      canKeepTogether: true,
      explanation:
        group?.exception?.reason ??
        'Excepcion explicita registrada: no se exige sentar juntos.',
      blockers: [],
    };
  }

  const blockers = findIncompatibilityBlockers(members);

  if (blockers.length > 0) {
    return {
      groupKey,
      keepTogether: true,
      canKeepTogether: false,
      explanation:
        'No se puede garantizar la misma mesa por incompatibilidades duras entre miembros del grupo.',
      blockers,
    };
  }

  return {
    groupKey,
    keepTogether: true,
    canKeepTogether: true,
    explanation: null,
    blockers: [],
  };
}

function findIncompatibilityBlockers(members: Guest[]): CompanionPlacementBlocker[] {
  const blockers: CompanionPlacementBlocker[] = [];

  for (const guest of members) {
    for (const restriction of guest.restrictions) {
      if (restriction.kind !== 'incompatibilidad' || !restriction.targetHint) {
        continue;
      }

      const target = members.find((member) =>
        namesMatch(member.nombre, restriction.targetHint!),
      );

      if (!target || target.id === guest.id) {
        continue;
      }

      blockers.push({
        guestId: guest.id,
        guestName: guest.nombre,
        otherGuestId: target.id,
        otherGuestName: target.nombre,
        restrictionKind: restriction.kind,
      });
    }
  }

  return blockers;
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

export function companionSeparationFromImport(
  separarAcompanante: boolean | null,
  observaciones: string,
): Pick<
  Guest,
  | 'companionSeparationReason'
  | 'companionSeparationOrigin'
  | 'companionSeparationAt'
> {
  if (separarAcompanante !== true) {
    return {
      companionSeparationReason: null,
      companionSeparationOrigin: null,
      companionSeparationAt: null,
    };
  }

  const reasonFromObservation = observaciones.trim();
  return {
    companionSeparationReason:
      reasonFromObservation ||
      'Marcado en plantilla Excel (separar_acompanante=true).',
    companionSeparationOrigin: 'excel',
    companionSeparationAt: new Date().toISOString(),
  };
}
