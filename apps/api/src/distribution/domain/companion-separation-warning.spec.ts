import type { Guest } from '../../guest-import/domain/guest';
import type { DistributionProposal } from './distribution.types';
import { buildCompanionSeparationWarning } from './companion-separation-warning';

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

describe('buildCompanionSeparationWarning', () => {
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
    guest('g1', 'Ana', { acompananteKey: 'PAREJA_1' }),
    guest('g2', 'Luis', { acompananteKey: 'PAREJA_1' }),
  ];

  it('no advierte si el grupo sigue junto', () => {
    expect(
      buildCompanionSeparationWarning(guests, baseProposal(), 'g1'),
    ).toBeNull();
  });

  it('advierte si los acompanantes quedan en mesas distintas', () => {
    const separated = {
      ...baseProposal(),
      placements: [
        {
          guestId: 'g1',
          guestName: 'Ana',
          tableId: 't2',
          tableLabel: 'Mesa 2',
        },
        {
          guestId: 'g2',
          guestName: 'Luis',
          tableId: 't1',
          tableLabel: 'Mesa 1',
        },
      ],
    };

    const warning = buildCompanionSeparationWarning(guests, separated, 'g1');
    expect(warning).toMatchObject({
      code: 'COMPANION_SEPARATED',
      guestIds: ['g1', 'g2'],
    });
  });

  it('no advierte si el excel marca separar_acompanante', () => {
    const separated = {
      ...baseProposal(),
      placements: [
        {
          guestId: 'g1',
          guestName: 'Ana',
          tableId: 't2',
          tableLabel: 'Mesa 2',
        },
        {
          guestId: 'g2',
          guestName: 'Luis',
          tableId: 't1',
          tableLabel: 'Mesa 1',
        },
      ],
    };

    const guestsWithException = [
      guest('g1', 'Ana', {
        acompananteKey: 'PAREJA_1',
        separarAcompanante: true,
      }),
      guest('g2', 'Luis', { acompananteKey: 'PAREJA_1' }),
    ];

    expect(
      buildCompanionSeparationWarning(
        guestsWithException,
        separated,
        'g1',
      ),
    ).toBeNull();
  });
});
