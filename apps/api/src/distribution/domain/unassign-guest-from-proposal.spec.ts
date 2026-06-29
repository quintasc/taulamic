import type { DistributionProposal } from './distribution.types';
import {
  UnassignGuestError,
  unassignGuestFromProposal,
} from './unassign-guest-from-proposal';

describe('unassignGuestFromProposal', () => {
  const baseProposal = (): DistributionProposal => ({
    id: 'dist_1',
    eventId: 'evt_1',
    motorVersion: 'v0-pilot',
    status: 'draft',
    placements: [
      {
        guestId: 'g1',
        guestName: 'Ana',
        tableId: 't1',
        tableLabel: 'Mesa 1',
      },
      {
        guestId: 'g2',
        guestName: 'Luis',
        tableId: 't1',
        tableLabel: 'Mesa 1',
      },
    ],
    unassignedGuestIds: [],
    hardRuleViolations: [
      {
        code: 'INCOMPATIBLE',
        message: 'Conflicto',
        guestIds: ['g1', 'g2'],
      },
    ],
    stats: {
      assignedCount: 2,
      unassignedCount: 0,
      tableCount: 1,
      totalCapacity: 4,
    },
    createdAt: '2026-06-21T12:00:00.000Z',
    confirmedAt: null,
  });

  it('mueve invitado a sin asignar y actualiza KPIs', () => {
    const updated = unassignGuestFromProposal(baseProposal(), 'g1');

    expect(updated.placements).toHaveLength(1);
    expect(updated.placements[0]?.guestId).toBe('g2');
    expect(updated.unassignedGuestIds).toEqual(['g1']);
    expect(updated.stats).toMatchObject({
      assignedCount: 1,
      unassignedCount: 1,
      tableCount: 1,
      totalCapacity: 4,
    });
    expect(updated.hardRuleViolations).toEqual([
      expect.objectContaining({ guestIds: ['g2'] }),
    ]);
  });

  it('rechaza si la propuesta esta confirmada', () => {
    const confirmed = { ...baseProposal(), status: 'confirmed' as const };

    expect(() => unassignGuestFromProposal(confirmed, 'g1')).toThrow(
      UnassignGuestError,
    );
  });

  it('rechaza si el invitado no esta asignado', () => {
    expect(() => unassignGuestFromProposal(baseProposal(), 'g9')).toThrow(
      UnassignGuestError,
    );
  });
});
