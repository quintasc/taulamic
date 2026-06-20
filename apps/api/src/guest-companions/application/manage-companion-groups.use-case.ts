import { Inject, Injectable } from '@nestjs/common';
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
import type { ActorRole } from '../../common/domain/actor-role';

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
  ) {}

  async execute(
    eventId: string,
    groupKey: string,
    actorRole: ActorRole,
    reason: string,
  ): Promise<CompanionGroup[]> {
    this.assertAdminActorUseCase.execute(actorRole);
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
    return buildCompanionGroups(guests);
  }
}

@Injectable()
export class RevertCompanionGroupSeparationUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    groupKey: string,
    actorRole: ActorRole,
  ): Promise<CompanionGroup[]> {
    this.assertAdminActorUseCase.execute(actorRole);
    await this.guestRepository.updateCompanionGroupSeparation(
      eventId,
      groupKey,
      {
        separate: false,
        origin: 'admin',
      },
    );
    const guests = await this.guestRepository.listGuests(eventId);
    return buildCompanionGroups(guests);
  }
}
