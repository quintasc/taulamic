import type { RoomSetup } from '../../domain/room-setup';

export const ROOM_SETUP_REPOSITORY = Symbol('ROOM_SETUP_REPOSITORY');

export type RoomSetupRepositoryPort = {
  findByEventId(eventId: string): Promise<RoomSetup | null>;
  save(eventId: string, setup: RoomSetup): Promise<RoomSetup>;
};
