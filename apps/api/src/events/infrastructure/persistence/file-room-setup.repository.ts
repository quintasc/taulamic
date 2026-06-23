import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import type { RoomSetup } from '../../domain/room-setup';
import type { RoomSetupRepositoryPort } from './room-setup.repository.port';

@Injectable()
export class FileRoomSetupRepository implements RoomSetupRepositoryPort {
  constructor(private readonly configService: ConfigService) {}

  private dataDir(): string {
    return this.configService.get<string>(
      'events.dataDir',
      'uploads/events',
    );
  }

  private storePath(eventId: string): string {
    const base = this.dataDir();
    const root = isAbsolute(base) ? base : join(process.cwd(), base);
    return join(root, eventId, 'room-setup.json');
  }

  async findByEventId(eventId: string): Promise<RoomSetup | null> {
    try {
      const raw = await readFile(this.storePath(eventId), 'utf8');
      return JSON.parse(raw) as RoomSetup;
    } catch {
      return null;
    }
  }

  async save(eventId: string, setup: RoomSetup): Promise<RoomSetup> {
    const path = this.storePath(eventId);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(setup, null, 2), 'utf8');
    return setup;
  }
}
