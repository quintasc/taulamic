import type { Guest } from '../../guest-import/domain/guest';
import { partitionExplicitAffinityRelations } from './companion-affinity-partition';
import { buildSeatPairWeights } from './seat-affinity';
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
    createdAt: '2026-07-07T10:00:00.000Z',
    updatedAt: '2026-07-07T10:00:00.000Z',
    ...overrides,
  };
}

function affinity(id: string, targetHint: string) {
  return {
    id,
    kind: 'afinidad' as const,
    targetHint,
    description: '',
    origin: 'manual' as const,
    suggestionId: null,
    createdAt: '2026-07-07T10:00:00.000Z',
  };
}

describe('buildSeatPairWeights', () => {
  it('sin ninguna relacion: matriz vacia', () => {
    const guests = [guest('g1', 'Ana'), guest('g2', 'Luis')];
    expect(buildSeatPairWeights(guests)).toEqual([]);
  });

  it('acompanantes (keepTogether) reciben el peso mas alto', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'pareja-1' }),
      guest('g2', 'Luis', { acompananteKey: 'pareja-1' }),
      guest('g3', 'Carla'),
    ];
    const weights = buildSeatPairWeights(guests);

    expect(weights).toHaveLength(1);
    expect(weights[0]).toMatchObject({
      leftGuestId: 'g1',
      rightGuestId: 'g2',
      weight: 3,
    });
  });

  it('afinidad declarada suma peso independiente de categoria', () => {
    const guests = [
      guest('g1', 'Ana', { restrictions: [affinity('r1', 'Carla')] }),
      guest('g2', 'Luis'),
      guest('g3', 'Carla'),
    ];
    const weights = buildSeatPairWeights(guests);

    expect(weights).toHaveLength(1);
    expect(weights[0].weight).toBe(2);
  });

  it('acumula pesos cuando coinciden varias senales', () => {
    const guests = [
      guest('g1', 'Ana', {
        acompananteKey: 'pareja-1',
        categoriaIds: ['familia'],
        restrictions: [affinity('r1', 'Luis')],
      }),
      guest('g2', 'Luis', {
        acompananteKey: 'pareja-1',
        categoriaIds: ['familia'],
      }),
    ];
    const weights = buildSeatPairWeights(guests);

    expect(weights).toHaveLength(1);
    // companion (3) + afinidad (2) + categoria (1) = 6
    expect(weights[0].weight).toBe(6);
  });

  it('afinidad explicita por nombre cuando no esta en restrictions', () => {
    const guests = [
      guest('g1', 'Inés Blanco'),
      guest('g2', 'Blanca Gómez'),
      guest('g3', 'Carla'),
    ];
    const weights = buildSeatPairWeights(guests, [
      { guestA: 'Inés Blanco', guestB: 'Blanca Gómez', type: 'afinidad' },
    ]);

    expect(weights).toHaveLength(1);
    expect(weights[0].weight).toBe(2);
  });

  it('separar_acompanante excluye el peso de companion', () => {
    const guests = [
      guest('g1', 'Ana', {
        acompananteKey: 'pareja-1',
        separarAcompanante: true,
        companionSeparationOrigin: 'excel',
      }),
      guest('g2', 'Luis', {
        acompananteKey: 'pareja-1',
        separarAcompanante: true,
        companionSeparationOrigin: 'excel',
      }),
    ];
    const weights = buildSeatPairWeights(guests);

    expect(weights).toEqual([]);
  });

  it('pareja Excel en explicitAffinityRelations se filtra antes de Fase 2', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'pareja-1' }),
      guest('g2', 'Luis', { acompananteKey: 'pareja-1' }),
    ];
    const { uiExplicitAffinityRelations } = partitionExplicitAffinityRelations(
      guests,
      [{ guestA: 'Ana', guestB: 'Luis', type: 'afinidad' }],
    );

    expect(uiExplicitAffinityRelations).toEqual([]);
    const weights = buildSeatPairWeights(guests, uiExplicitAffinityRelations);
    expect(weights).toHaveLength(1);
    expect(weights[0].weight).toBe(3);
  });
});
