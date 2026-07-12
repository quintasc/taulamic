import type { Guest } from '../../guest-import/domain/guest';
import {
  buildKeepTogetherCompanionNamePairKeys,
  partitionExplicitAffinityRelations,
} from './companion-affinity-partition';

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

describe('companion-affinity-partition', () => {
  it('detecta pares keepTogether por acompanante_key', () => {
    const guests = [
      guest('g1', 'Ana García', { acompananteKey: 'pareja_1' }),
      guest('g2', 'Luis Pérez', { acompananteKey: 'pareja_1' }),
    ];

    const keys = buildKeepTogetherCompanionNamePairKeys(guests);
    expect(keys.size).toBe(1);
    expect(keys.has('ana garcía|luis pérez')).toBe(true);
  });

  it('excluye parejas con separar_acompanante del conjunto duro', () => {
    const guests = [
      guest('g1', 'Ana', {
        acompananteKey: 'pareja_1',
        separarAcompanante: true,
      }),
      guest('g2', 'Luis', {
        acompananteKey: 'pareja_1',
        separarAcompanante: true,
      }),
    ];

    expect(buildKeepTogetherCompanionNamePairKeys(guests).size).toBe(0);
  });

  it('retira afinidades explicitas de parejas Excel del payload UI', () => {
    const guests = [
      guest('g1', 'Ana García', { acompananteKey: 'pareja_1' }),
      guest('g2', 'Luis Pérez', { acompananteKey: 'pareja_1' }),
      guest('g3', 'Carla', { acompananteKey: '' }),
      guest('g4', 'Pablo', { acompananteKey: '' }),
    ];

    const partition = partitionExplicitAffinityRelations(guests, [
      { guestA: 'Ana García', guestB: 'Luis Pérez', type: 'afinidad' },
      { guestA: 'Carla', guestB: 'Pablo', type: 'afinidad' },
    ]);

    expect(partition.strippedCompanionRelations).toHaveLength(1);
    expect(partition.uiExplicitAffinityRelations).toEqual([
      { guestA: 'Carla', guestB: 'Pablo', type: 'afinidad' },
    ]);
  });

  it('conserva incompatibilidades explicitas aunque coincidan nombres de pareja', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'pareja_1' }),
      guest('g2', 'Luis', { acompananteKey: 'pareja_1' }),
    ];

    const partition = partitionExplicitAffinityRelations(guests, [
      { guestA: 'Ana', guestB: 'Luis', type: 'incompatibilidad' },
    ]);

    expect(partition.strippedCompanionRelations).toHaveLength(0);
    expect(partition.uiExplicitAffinityRelations).toHaveLength(1);
  });
});
