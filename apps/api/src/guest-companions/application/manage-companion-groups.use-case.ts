import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  buildCompanionGroups,
  evaluateCompanionGroup,
  type CompanionGroup,
  type CompanionGroupEvaluation,
} from '../../guest-import/domain/companion-group.engine';
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../../guest-import/infrastructure/persistence/guest.repository.port';
import { AssertAdminActorUseCase } from '../../events/application/preference-permissions.use-case';
import { RecordCompanionSeparationAuditUseCase } from '../../event-governance-audit/application/governance-audit.use-case';
import type { CompanionSeparationAuditSnapshot } from '../../event-governance-audit/domain/governance-audit-entry';
import type { ActorRole } from '../../common/domain/actor-role';

function toCompanionSeparationSnapshot(
  group: CompanionGroup,
): CompanionSeparationAuditSnapshot {
  return {
    groupKey: group.key,
    keepTogether: group.keepTogether,
    reason: group.exception?.reason ?? null,
    origin: group.exception?.origin ?? null,
  };
}

@Injectable()
export class ListCompanionGroupsUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
  ) {}

  async execute(eventId: string): Promise<CompanionGroup[]> {
    const guests = await this.guestRepository.listGuests(eventId);
    return buildCompanionGroups(guests);
  }
}

@Injectable()
export class EvaluateCompanionGroupUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    groupKey: string,
  ): Promise<CompanionGroupEvaluation> {
    const guests = await this.guestRepository.listGuests(eventId);
    return evaluateCompanionGroup(guests, groupKey);
  }
}

@Injectable()
export class SeparateCompanionGroupUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
    private readonly recordCompanionSeparationAuditUseCase: RecordCompanionSeparationAuditUseCase,
  ) {}

  async execute(
    eventId: string,
    groupKey: string,
    actorRole: ActorRole,
    reason: string,
  ): Promise<CompanionGroup[]> {
    this.assertAdminActorUseCase.execute(actorRole);

    const guestsBefore = await this.guestRepository.listGuests(eventId);
    const beforeGroup = buildCompanionGroups(guestsBefore).find(
      (group) => group.key === groupKey.trim(),
    );

    if (!beforeGroup) {
      throw new NotFoundException({
        code: 'COMPANION_GROUP_NOT_FOUND',
        message: 'No se encontro un grupo de acompanantes con esa clave.',
      });
    }

    await this.guestRepository.updateCompanionGroupSeparation(
      eventId,
      groupKey,
      {
        separate: true,
        reason,
        origin: 'admin',
      },
    );

    const guests = await this.guestRepository.listGuests(eventId);
    const afterGroup = buildCompanionGroups(guests).find(
      (group) => group.key === groupKey.trim(),
    );

    if (afterGroup) {
      await this.recordCompanionSeparationAuditUseCase.execute({
        eventId,
        actorRole,
        before: toCompanionSeparationSnapshot(beforeGroup),
        after: toCompanionSeparationSnapshot(afterGroup),
      });
    }

    return buildCompanionGroups(guests);
  }
}

@Injectable()
export class RevertCompanionGroupSeparationUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
    private readonly recordCompanionSeparationAuditUseCase: RecordCompanionSeparationAuditUseCase,
  ) {}

  async execute(
    eventId: string,
    groupKey: string,
    actorRole: ActorRole,
  ): Promise<CompanionGroup[]> {
    this.assertAdminActorUseCase.execute(actorRole);

    const guestsBefore = await this.guestRepository.listGuests(eventId);
    const beforeGroup = buildCompanionGroups(guestsBefore).find(
      (group) => group.key === groupKey.trim(),
    );

    if (!beforeGroup) {
      throw new NotFoundException({
        code: 'COMPANION_GROUP_NOT_FOUND',
        message: 'No se encontro un grupo de acompanantes con esa clave.',
      });
    }

    await this.guestRepository.updateCompanionGroupSeparation(
      eventId,
      groupKey,
      {
        separate: false,
        origin: 'admin',
      },
    );

    const guests = await this.guestRepository.listGuests(eventId);
    const afterGroup = buildCompanionGroups(guests).find(
      (group) => group.key === groupKey.trim(),
    );

    if (afterGroup) {
      await this.recordCompanionSeparationAuditUseCase.execute({
        eventId,
        actorRole,
        before: toCompanionSeparationSnapshot(beforeGroup),
        after: toCompanionSeparationSnapshot(afterGroup),
      });
    }

    return buildCompanionGroups(guests);
  }
}
