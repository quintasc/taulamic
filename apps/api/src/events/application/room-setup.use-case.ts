import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RoomSetup } from '../domain/room-setup';
import {
  assertRoomSetupEditable,
  parseRoomSetupInput,
  type RoomSetupInput,
} from '../domain/room-setup.validator';
import {
  EVENT_CONFIG_REPOSITORY,
  type EventConfigRepositoryPort,
} from '../infrastructure/persistence/event-config.repository.port';
import {
  ROOM_SETUP_REPOSITORY,
  type RoomSetupRepositoryPort,
} from '../infrastructure/persistence/room-setup.repository.port';

@Injectable()
export class GetRoomSetupUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(ROOM_SETUP_REPOSITORY)
    private readonly roomSetupRepository: RoomSetupRepositoryPort,
  ) {}

  async execute(eventId: string): Promise<RoomSetup> {
    await this.requireEvent(eventId);
    const setup = await this.roomSetupRepository.findByEventId(eventId);

    if (!setup) {
      throw new NotFoundException({
        code: 'ROOM_SETUP_NOT_FOUND',
        message: 'No hay configuracion de salon guardada para este evento.',
        details: { eventId },
      });
    }

    return setup;
  }

  private async requireEvent(eventId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }
    return event;
  }
}

@Injectable()
export class UpsertRoomSetupUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly eventRepository: EventConfigRepositoryPort,
    @Inject(ROOM_SETUP_REPOSITORY)
    private readonly roomSetupRepository: RoomSetupRepositoryPort,
  ) {}

  async execute(eventId: string, input: RoomSetupInput): Promise<RoomSetup> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    assertRoomSetupEditable(event);
    const parsed = parseRoomSetupInput(input);
    const setup: RoomSetup = {
      ...parsed,
      updatedAt: new Date().toISOString(),
    };

    return this.roomSetupRepository.save(eventId, setup);
  }
}
