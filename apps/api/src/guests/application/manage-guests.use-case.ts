import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ActorRole } from '../../common/domain/actor-role';
import {
  EVENT_CONFIG_REPOSITORY,
  type EventConfigRepositoryPort,
} from '../../events/infrastructure/persistence/event-config.repository.port';
import { AssertAdminActorUseCase } from '../../events/application/preference-permissions.use-case';
import {
  GUEST_REPOSITORY,
  type GuestRepositoryPort,
} from '../../guest-import/infrastructure/persistence/guest.repository.port';
import { parseGuestManualInput } from '../domain/guest-input.validator';
import { mapGuestToView, type GuestView } from '../domain/guest-privacy.mapper';

@Injectable()
export class ListGuestsUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
  ) {}

  async execute(eventId: string, actorRole: ActorRole): Promise<GuestView[]> {
    await this.ensureEventExists(eventId);
    const [guests, categories] = await Promise.all([
      this.guestRepository.listGuests(eventId),
      this.guestRepository.listCategories(eventId),
    ]);

    return guests.map((guest) => mapGuestToView(guest, categories, actorRole));
  }

  private async ensureEventExists(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }
  }
}

@Injectable()
export class GetGuestUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    guestId: string,
    actorRole: ActorRole,
  ): Promise<GuestView> {
    await this.ensureEventExists(eventId);
    const [guest, categories] = await Promise.all([
      this.guestRepository.getGuest(eventId, guestId),
      this.guestRepository.listCategories(eventId),
    ]);

    return mapGuestToView(guest, categories, actorRole);
  }

  private async ensureEventExists(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }
  }
}

@Injectable()
export class CreateGuestUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    actorRole: ActorRole,
    input: Parameters<typeof parseGuestManualInput>[0],
  ): Promise<GuestView> {
    this.assertAdminActorUseCase.execute(actorRole);
    await this.ensureEventExists(eventId);
    const parsed = parseGuestManualInput(input);
    const guest = await this.guestRepository.createGuest(eventId, parsed);
    const categories = await this.guestRepository.listCategories(eventId);
    return mapGuestToView(guest, categories, actorRole);
  }

  private async ensureEventExists(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }
  }
}

@Injectable()
export class UpdateGuestUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    guestId: string,
    actorRole: ActorRole,
    input: Parameters<typeof parseGuestManualInput>[0],
  ): Promise<GuestView> {
    this.assertAdminActorUseCase.execute(actorRole);
    await this.ensureEventExists(eventId);
    const parsed = parseGuestManualInput(input);
    const guest = await this.guestRepository.updateGuest(
      eventId,
      guestId,
      parsed,
    );
    const categories = await this.guestRepository.listCategories(eventId);
    return mapGuestToView(guest, categories, actorRole);
  }

  private async ensureEventExists(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }
  }
}

@Injectable()
export class DeleteGuestUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    guestId: string,
    actorRole: ActorRole,
  ): Promise<void> {
    this.assertAdminActorUseCase.execute(actorRole);
    await this.ensureEventExists(eventId);
    await this.guestRepository.deleteGuest(eventId, guestId);
  }

  private async ensureEventExists(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }
  }
}

@Injectable()
export class ListGuestCategoriesUseCase {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepositoryPort,
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
  ) {}

  async execute(eventId: string) {
    await this.ensureEventExists(eventId);
    const categories = await this.guestRepository.listCategories(eventId);
    return {
      eventId,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    };
  }

  private async ensureEventExists(eventId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }
  }
}
