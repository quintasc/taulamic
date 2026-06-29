import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal } from './distribution.types';
import {
  AssignGuestError,
  assignGuestToProposal,
} from './assign-guest-to-proposal';

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

describe('assignGuestToProposal', () => {
  const baseProposal = (): DistributionProposal => ({
    id: 'dist_1',
    eventId: 'evt_1',
    motorVersion: 'v0-pilot',
    status: 'draft',
    placements: [
      {
        guestId: 'g2',
        guestName: 'Luis Perez',
        tableId: 't1',
        tableLabel: 'Mesa 1',
      },
    ],
    unassignedGuestIds: ['g1'],
    hardRuleViolations: [],
    stats: {
      assignedCount: 1,
      unassignedCount: 1,
      tableCount: 1,
      totalCapacity: 4,
    },
    createdAt: '2026-06-29T00:00:00.000Z',
    confirmedAt: null,
  });

  const guests = [
    guest('g1', 'Ana Garcia', { acompananteKey: 'PAREJA_1' }),
    guest('g2', 'Luis Perez', { acompananteKey: 'PAREJA_1' }),
  ];

  const tables: EventTable[] = [
    {
      id: 't1',
      label: 'Mesa 1',
      shape: 'redonda',
      capacity: 4,
    },
  ];

  it('asigna invitado sin asignar y actualiza KPIs', () => {
    const updated = assignGuestToProposal(baseProposal(), {
      guestId: 'g1',
      tableId: 't1',
      guests,
      tables,
    });

    expect(updated.placements).toHaveLength(2);
    expect(updated.unassignedGuestIds).toEqual([]);
    expect(updated.stats).toMatchObject({
      assignedCount: 2,
      unassignedCount: 0,
    });
  });

  it('rechaza si la mesa esta llena', () => {
    const fullTable = {
      ...baseProposal(),
      placements: [
        {
          guestId: 'g2',
          guestName: 'Luis Perez',
          tableId: 't1',
          tableLabel: 'Mesa 1',
        },
        {
          guestId: 'g3',
          guestName: 'Pepe Ruiz',
          tableId: 't1',
          tableLabel: 'Mesa 1',
        },
      ],
      unassignedGuestIds: ['g1'],
    };

    expect(() =>
      assignGuestToProposal(fullTable, {
        guestId: 'g1',
        tableId: 't1',
        guests,
        tables: [{ ...tables[0], capacity: 2 }],
      }),
    ).toThrow(AssignGuestError);
  });

  it('rechaza si la propuesta esta confirmada', () => {
    const confirmed = { ...baseProposal(), status: 'confirmed' as const };

    expect(() =>
      assignGuestToProposal(confirmed, {
        guestId: 'g1',
        tableId: 't1',
        guests,
        tables,
      }),
    ).toThrow(AssignGuestError);
  });

  it('permite asignar acompanantes en mesas distintas para override manual', () => {
    const updated = assignGuestToProposal(baseProposal(), {
      guestId: 'g1',
      tableId: 't2',
      guests,
      tables: [
        ...tables,
        {
          id: 't2',
          label: 'Mesa 2',
          shape: 'redonda',
          capacity: 4,
        },
      ],
    });

    expect(updated.placements).toHaveLength(2);
    expect(
      updated.placements.find((placement) => placement.guestId === 'g1')?.tableId,
    ).toBe('t2');
  });
});
