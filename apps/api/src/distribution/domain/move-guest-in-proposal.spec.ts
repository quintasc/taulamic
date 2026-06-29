import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal } from './distribution.types';
import { MoveGuestError, moveGuestInProposal } from './move-guest-in-proposal';

function guest(
  id: string,
  nombre: string,
  overrides: Partial<Guest> = {},
): Guest {
  return {
    id,
    eventId: 'evt_1',
    nombre,
    correo: `${id}@ejemplo.com`,
    telefono: '',
    direccion: '',
    categoriaIds: [],
    observaciones: '',
    acompananteKey: '',
    separarAcompanante: null,
    companionSeparationReason: null,
    companionSeparationOrigin: null,
    companionSeparationAt: null,
    preferenciaControl: null,
    restrictions: [],
    createdAt: '2026-06-21T10:00:00.000Z',
    updatedAt: '2026-06-21T10:00:00.000Z',
    ...overrides,
  };
}

describe('moveGuestInProposal', () => {
  const baseProposal = (): DistributionProposal => ({
    id: 'dist_1',
    eventId: 'evt_1',
    motorVersion: 'v0-pilot',
    status: 'draft',
    placements: [
      {
        guestId: 'g1',
        guestName: 'Ana Garcia',
        tableId: 't1',
        tableLabel: 'Mesa 1',
      },
      {
        guestId: 'g2',
        guestName: 'Luis Perez',
        tableId: 't1',
        tableLabel: 'Mesa 1',
      },
    ],
    unassignedGuestIds: [],
    hardRuleViolations: [],
    stats: {
      assignedCount: 2,
      unassignedCount: 0,
      tableCount: 2,
      totalCapacity: 8,
    },
    createdAt: '2026-06-29T00:00:00.000Z',
    confirmedAt: null,
  });

  const guests = [
    guest('g1', 'Ana Garcia'),
    guest('g2', 'Luis Perez'),
    guest('g3', 'Pepe Ruiz'),
  ];

  const tables: EventTable[] = [
    {
      id: 't1',
      label: 'Mesa 1',
      shape: 'redonda',
      capacity: 4,
    },
    {
      id: 't2',
      label: 'Mesa 2',
      shape: 'redonda',
      capacity: 4,
    },
  ];

  it('mueve invitado a otra mesa', () => {
    const updated = moveGuestInProposal(baseProposal(), {
      guestId: 'g1',
      tableId: 't2',
      guests,
      tables,
    });

    expect(updated.placements).toEqual(
      expect.arrayContaining([
        {
          guestId: 'g2',
          guestName: 'Luis Perez',
          tableId: 't1',
          tableLabel: 'Mesa 1',
        },
        {
          guestId: 'g1',
          guestName: 'Ana Garcia',
          tableId: 't2',
          tableLabel: 'Mesa 2',
        },
      ]),
    );
    expect(updated.placements).toHaveLength(2);
    expect(updated.stats.assignedCount).toBe(2);
    expect(updated.unassignedGuestIds).toEqual([]);
  });

  it('rechaza si la mesa destino esta llena', () => {
    const fullTarget = {
      ...baseProposal(),
      placements: [
        ...baseProposal().placements,
        {
          guestId: 'g3',
          guestName: 'Pepe Ruiz',
          tableId: 't2',
          tableLabel: 'Mesa 2',
        },
        {
          guestId: 'g4',
          guestName: 'Maria Lopez',
          tableId: 't2',
          tableLabel: 'Mesa 2',
        },
      ],
    };

    expect(() =>
      moveGuestInProposal(fullTarget, {
        guestId: 'g1',
        tableId: 't2',
        guests: [
          ...guests,
          guest('g4', 'Maria Lopez'),
        ],
        tables: tables.map((table) =>
          table.id === 't2' ? { ...table, capacity: 2 } : table,
        ),
      }),
    ).toThrow(MoveGuestError);
  });

  it('rechaza si la propuesta esta confirmada', () => {
    const confirmed = { ...baseProposal(), status: 'confirmed' as const };

    expect(() =>
      moveGuestInProposal(confirmed, {
        guestId: 'g1',
        tableId: 't2',
        guests,
        tables,
      }),
    ).toThrow(MoveGuestError);
  });

  it('rechaza mover a la misma mesa', () => {
    expect(() =>
      moveGuestInProposal(baseProposal(), {
        guestId: 'g1',
        tableId: 't1',
        guests,
        tables,
      }),
    ).toThrow(MoveGuestError);
  });
});
