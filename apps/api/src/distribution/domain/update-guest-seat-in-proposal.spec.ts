import type { EventTable } from '../../events/domain/event-config';
import type { DistributionProposal } from './distribution.types';
import {
  UpdateGuestSeatError,
  updateGuestSeatInProposal,
} from './update-guest-seat-in-proposal';

describe('updateGuestSeatInProposal', () => {
  const tables: EventTable[] = [
    {
      id: 't1',
      label: 'Mesa 1',
      shape: 'redonda',
      capacity: 8,
    },
  ];

  function baseProposal(): DistributionProposal {
    return {
      id: 'prop-1',
      eventId: 'evt-1',
      motorVersion: 'v1',
      status: 'draft',
      placements: [
        {
          guestId: 'g1',
          guestName: 'Rocio',
          tableId: 't1',
          tableLabel: 'Mesa 1',
          seatIndex: 0,
          seatLabel: 'S1',
        },
        {
          guestId: 'g2',
          guestName: 'Pareja',
          tableId: 't1',
          tableLabel: 'Mesa 1',
          seatIndex: 3,
          seatLabel: 'S4',
        },
      ],
      unassignedGuestIds: [],
      hardRuleViolations: [],
      stats: {
        assignedCount: 2,
        unassignedCount: 0,
        totalCapacity: 8,
        tableCount: 1,
      },
      createdAt: '2026-01-01T00:00:00.000Z',
      confirmedAt: null,
    };
  }

  it('actualiza el asiento del invitado', () => {
    const updated = updateGuestSeatInProposal(baseProposal(), {
      guestId: 'g2',
      seatIndex: 1,
      tables,
    });

    expect(updated.placements.find((item) => item.guestId === 'g2')).toEqual({
      guestId: 'g2',
      guestName: 'Pareja',
      tableId: 't1',
      tableLabel: 'Mesa 1',
      seatIndex: 1,
      seatLabel: 'S2',
    });
  });

  it('intercambia asientos si el destino esta ocupado', () => {
    const updated = updateGuestSeatInProposal(baseProposal(), {
      guestId: 'g2',
      seatIndex: 0,
      tables,
    });

    expect(updated.placements.find((item) => item.guestId === 'g1')?.seatIndex).toBe(3);
    expect(updated.placements.find((item) => item.guestId === 'g2')?.seatIndex).toBe(0);
  });

  it('rechaza asientos fuera de rango', () => {
    expect(() =>
      updateGuestSeatInProposal(baseProposal(), {
        guestId: 'g2',
        seatIndex: 8,
        tables,
      }),
    ).toThrow(UpdateGuestSeatError);
  });
});
