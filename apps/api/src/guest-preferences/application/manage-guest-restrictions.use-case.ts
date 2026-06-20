import { Inject, Injectable } from '@nestjs/common';
import type { GuestRestriction } from '../../guest-import/domain/restriction-suggestion';
import {
  GUEST_REPOSITORY,
  type AddManualRestrictionInput,
  type GuestRepositoryPort,
} from '../../guest-import/infrastructure/persistence/guest.repository.port';
import { AssertPreferenceEditPermissionUseCase } from '../../events/application/preference-permissions.use-case';
import type { ActorRole } from '../../common/domain/actor-role';

@Injectable()
export class ListGuestRestrictionsUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
  ) {}

  execute(eventId: string, guestId: string): Promise<GuestRestriction[]> {
    return this.guestRepository.listGuestRestrictions(eventId, guestId);
  }
}

@Injectable()
export class AddGuestRestrictionUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    private readonly assertPreferenceEditPermissionUseCase: AssertPreferenceEditPermissionUseCase,
  ) {}

  async execute(
    eventId: string,
    guestId: string,
    actorRole: ActorRole,
    input: AddManualRestrictionInput,
  ): Promise<GuestRestriction> {
    await this.assertPreferenceEditPermissionUseCase.execute(eventId, actorRole);
    return this.guestRepository.addManualRestriction(eventId, guestId, input);
  }
}
