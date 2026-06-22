import { reconcileProposalAfterTableRemoved } from './reconcile-proposal-after-table-removed';
import type { DistributionProposal } from './distribution.types';

function draftProposal(
  overrides: Partial<DistributionProposal> = {},
): DistributionProposal {
  return {
    id: 'dist-1',
    eventId: 'evt-1',
    motorVersion: 'v0-pilot',
    status: 'draft',
    placements: [],
    unassignedGuestIds: [],
    hardRuleViolations: [],
    stats: {
      assignedCount: 0,
      unassignedCount: 0,
      tableCount: 2,
      totalCapacity: 10,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    confirmedAt: null,
    ...overrides,
  };
}

describe('reconcileProposalAfterTableRemoved', () => {
  it('mueve invitados de la mesa eliminada a sin asignar y actualiza stats', () => {
    const proposal = draftProposal({
      placements: [
        {
          guestId: 'g1',
          guestName: 'Ana',
          tableId: 't1',
          tableLabel: 'M1',
        },
        {
          guestId: 'g2',
          guestName: 'Luis',
          tableId: 't1',
          tableLabel: 'M1',
        },
        {
          guestId: 'g3',
          guestName: 'Bea',
          tableId: 't2',
          tableLabel: 'M2',
        },
      ],
      stats: {
        assignedCount: 3,
        unassignedCount: 0,
        tableCount: 2,
        totalCapacity: 10,
      },
    });

    const reconciled = reconcileProposalAfterTableRemoved(proposal, 't1', [
      { id: 't2', capacity: 5 },
    ]);

    expect(reconciled).not.toBeNull();
    expect(reconciled?.placements).toEqual([
      {
        guestId: 'g3',
        guestName: 'Bea',
        tableId: 't2',
        tableLabel: 'M2',
      },
    ]);
    expect(reconciled?.unassignedGuestIds).toEqual(['g1', 'g2']);
    expect(reconciled?.stats).toEqual({
      assignedCount: 1,
      unassignedCount: 2,
      tableCount: 1,
      totalCapacity: 5,
    });
  });

  it('no modifica propuestas confirmadas', () => {
    const proposal = draftProposal({ status: 'confirmed' });

    expect(
      reconcileProposalAfterTableRemoved(proposal, 't1', [{ id: 't2', capacity: 5 }]),
    ).toBeNull();
  });

  it('actualiza capacidad cuando la mesa no tenia invitados', () => {
    const proposal = draftProposal({
      stats: {
        assignedCount: 0,
        unassignedCount: 0,
        tableCount: 2,
        totalCapacity: 10,
      },
    });

    const reconciled = reconcileProposalAfterTableRemoved(proposal, 't1', [
      { id: 't2', capacity: 5 },
    ]);

    expect(reconciled?.stats.tableCount).toBe(1);
    expect(reconciled?.stats.totalCapacity).toBe(5);
  });
});
