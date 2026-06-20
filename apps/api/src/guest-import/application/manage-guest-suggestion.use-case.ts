import { Inject, Injectable } from '@nestjs/common';
import type { RestrictionSuggestion } from '../domain/restriction-suggestion';
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
  type UpdateSuggestionInput,
} from '../infrastructure/persistence/guest.repository.port';

@Injectable()
export class AcceptGuestSuggestionUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
  ) {}

  execute(eventId: string, suggestionId: string): Promise<RestrictionSuggestion> {
    return this.guestRepository.acceptSuggestion(eventId, suggestionId);
  }
}

@Injectable()
export class RejectGuestSuggestionUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
  ) {}

  execute(eventId: string, suggestionId: string): Promise<RestrictionSuggestion> {
    return this.guestRepository.rejectSuggestion(eventId, suggestionId);
  }
}

@Injectable()
export class UpdateGuestSuggestionUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
  ) {}

  execute(
    eventId: string,
    suggestionId: string,
    input: UpdateSuggestionInput,
  ): Promise<RestrictionSuggestion> {
    return this.guestRepository.updatePendingSuggestion(
      eventId,
      suggestionId,
      input,
    );
  }
}
