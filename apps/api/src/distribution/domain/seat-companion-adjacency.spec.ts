import { buildSeatTopology } from '../../floor-plans/domain/build-seat-topology';
import type { Guest } from '../../guest-import/domain/guest';
import {
  adjacentSeatIndexPairs,
  buildCompanionGuestPairs,
} from './seat-companion-adjacency';

function guest(id: string, overrides: Partial<Guest> = {}): Guest {
  return {
    id,
    eventId: 'evt_1',
    nombre: id,
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

describe('seat-companion-adjacency', () => {
  it('extrae parejas keepTogether de la mesa', () => {
    const pairs = buildCompanionGuestPairs([
      guest('g1', { acompananteKey: 'pareja-a' }),
      guest('g2', { acompananteKey: 'pareja-a' }),
      guest('g3'),
    ]);

    expect(pairs).toEqual([{ leftGuestId: 'g1', rightGuestId: 'g2' }]);
  });

  it('lista pares de sillas adyacentes sin duplicados', () => {
    const topology = buildSeatTopology('redonda', 8);
    const pairs = adjacentSeatIndexPairs(topology);

    expect(pairs.length).toBe(8);
    expect(pairs).toEqual(
      expect.arrayContaining([
        { from: 0, to: 1 },
        { from: 0, to: 7 },
      ]),
    );
  });
});
