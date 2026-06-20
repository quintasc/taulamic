import { Inject, Injectable } from '@nestjs/common';
import type { RestrictionSuggestion } from '../domain/restriction-suggestion';
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../infrastructure/persistence/guest.repository.port';

@Injectable()
export class ListGuestSuggestionsUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
  ) {}

  execute(eventId: string): Promise<RestrictionSuggestion[]> {
    return this.guestRepository.listSuggestions(eventId, 'pending');
  }
}
