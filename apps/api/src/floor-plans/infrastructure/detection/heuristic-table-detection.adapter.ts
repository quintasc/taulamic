import { Injectable } from '@nestjs/common';
import {
  RawDetectedTableCandidate,
  TableDetectionInput,
  TableDetectionPort,
} from './table-detection.port';

const MESA_LINE_PATTERN =
  /mesa\s*(?<number>\d+)(?<details>[^\n\r]{0,120})/gi;

const CAPACITY_PATTERN =
  /(?<capacity>\d{1,2})\s*(pax|personas|comensales|plazas)/i;

@Injectable()
export class HeuristicTableDetectionAdapter implements TableDetectionPort {
  async detect(input: TableDetectionInput): Promise<RawDetectedTableCandidate[]> {
    const text = input.buffer.toString('latin1');
    const matches = [...text.matchAll(MESA_LINE_PATTERN)];

    if (matches.length === 0) {
      return [];
    }

    const uniqueByNumber = new Map<string, RawDetectedTableCandidate>();

    for (const match of matches) {
      const tableNumber = match.groups?.number;
      if (!tableNumber) {
        continue;
      }

      const details = match.groups?.details ?? '';
      const capacityMatch = details.match(CAPACITY_PATTERN);
      const estimatedCapacity = capacityMatch?.groups?.capacity
        ? Number.parseInt(capacityMatch.groups.capacity, 10)
        : undefined;

      uniqueByNumber.set(tableNumber, {
        label: `Mesa ${tableNumber}`,
        rawShape: details.trim() || undefined,
        estimatedCapacity,
        hasExplicitShape: this.hasShapeHint(details),
        hasExplicitCapacity: estimatedCapacity !== undefined,
      });
    }

    return [...uniqueByNumber.values()].sort((left, right) =>
      left.label.localeCompare(right.label, 'es'),
    );
  }

  private hasShapeHint(details: string): boolean {
    return /\b(redonda|round|circular|rectangular|recta|imperial|ovalada|oval)\b/i.test(
      details,
    );
  }
}
