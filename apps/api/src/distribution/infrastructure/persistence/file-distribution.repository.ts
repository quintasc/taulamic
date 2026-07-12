import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import type { DistributionProposal } from '../../domain/distribution.types';
import { stripManualWarnings } from '../../domain/companion-separation-warning';
import type { DistributionRepositoryPort } from './distribution.repository.port';

@Injectable()
export class FileDistributionRepository implements DistributionRepositoryPort {
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
    return join(root, eventId, 'distribution-latest.json');
  }

  async save(proposal: DistributionProposal): Promise<DistributionProposal> {
    const path = this.storePath(proposal.eventId);
    const tmpPath = `${path}.tmp-${process.pid}-${Date.now()}`;
    const persisted = stripManualWarnings(proposal);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(tmpPath, JSON.stringify(persisted, null, 2), 'utf8');
    await rename(tmpPath, path);
    return persisted;
  }

  async findLatestByEventId(
    eventId: string,
  ): Promise<DistributionProposal | null> {
    const path = this.storePath(eventId);

    try {
      const raw = await readFile(path, 'utf8');
      return JSON.parse(raw) as DistributionProposal;
    } catch {
      return null;
    }
  }

  async findById(
    eventId: string,
    proposalId: string,
  ): Promise<DistributionProposal | null> {
    const latest = await this.findLatestByEventId(eventId);

    if (!latest || latest.id !== proposalId) {
      return null;
    }

    return latest;
  }

  async requireById(
    eventId: string,
    proposalId: string,
  ): Promise<DistributionProposal> {
    const proposal = await this.findById(eventId, proposalId);

    if (!proposal) {
      throw new NotFoundException({
        code: 'DISTRIBUTION_NOT_FOUND',
        message: 'No se encontro la propuesta de distribucion indicada.',
        details: { eventId, proposalId },
      });
    }

    return proposal;
  }
}
