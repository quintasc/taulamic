import type { Guest } from '../../guest-import/domain/guest';
import { buildPlacementUnits } from './placement-units';
import { prepareDistributionMotorInput } from './prepare-distribution-motor-input';

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

describe('prepareDistributionMotorInput', () => {
  it('fusiona parejas Excel en una unidad indivisible (D3)', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'pareja_1', categoriaIds: ['amigos novia'] }),
      guest('g2', 'Luis', { acompananteKey: 'pareja_1', categoriaIds: ['amigos novia'] }),
      guest('g3', 'Carla', { categoriaIds: ['amigos novia'] }),
    ];

    const prepared = prepareDistributionMotorInput(guests, ['groupByCategory'], [
      { guestA: 'Ana', guestB: 'Luis', type: 'afinidad' },
    ]);

    expect(prepared.strippedCompanionRelationCount).toBe(1);
    expect(prepared.explicitAffinityRelations).toEqual([]);
    expect(prepared.placementUnits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          guestIds: ['g1', 'g2'],
          keepTogether: true,
        }),
      ]),
    );
    expect(buildPlacementUnits(guests)).toEqual(prepared.placementUnits);
  });

  it('reduce unidades de colocacion para groupByCategory (3 invitados -> 2 unidades)', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'p1' }),
      guest('g2', 'Luis', { acompananteKey: 'p1' }),
      guest('g3', 'Carla'),
    ];

    const prepared = prepareDistributionMotorInput(guests);
    expect(prepared.placementUnits).toHaveLength(2);
    expect(
      prepared.placementUnits.find((unit) => unit.keepTogether)?.guestIds,
    ).toEqual(['g1', 'g2']);
  });
});
