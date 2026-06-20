import type { Guest } from './guest';
import {
  buildCompanionGroups,
  companionSeparationFromImport,
  evaluateCompanionGroup,
} from './companion-group.engine';

function createGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: overrides.id ?? 'guest-1',
    eventId: 'evt_123',
    nombre: overrides.nombre ?? 'Ana Garcia',
    correo: overrides.correo ?? 'ana@ejemplo.com',
    telefono: '+34600111222',
    direccion: '',
    categoriaIds: [],
    observaciones: overrides.observaciones ?? '',
    acompananteKey: overrides.acompananteKey ?? 'PAREJA_001',
    separarAcompanante: overrides.separarAcompanante ?? false,
    companionSeparationReason: overrides.companionSeparationReason ?? null,
    companionSeparationOrigin: overrides.companionSeparationOrigin ?? null,
    companionSeparationAt: overrides.companionSeparationAt ?? null,
    preferenciaControl: null,
    restrictions: overrides.restrictions ?? [],
    createdAt: '2026-06-18T10:00:00.000Z',
    updatedAt: '2026-06-18T10:00:00.000Z',
  };
}

describe('companion-group.engine', () => {
  it('agrupa invitados con la misma acompanante_key', () => {
    const guests = [
      createGuest({ id: 'g1', nombre: 'Ana Garcia' }),
      createGuest({
        id: 'g2',
        nombre: 'Luis Martinez',
        correo: 'luis@ejemplo.com',
      }),
      createGuest({
        id: 'g3',
        nombre: 'Solo',
        correo: 'solo@ejemplo.com',
        acompananteKey: '',
      }),
    ];

    const groups = buildCompanionGroups(guests);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      key: 'PAREJA_001',
      guestIds: ['g1', 'g2'],
      keepTogether: true,
      exception: null,
    });
  });

  it('marca excepcion cuando separar_acompanante=true en import', () => {
    const guests = [
      createGuest({
        separarAcompanante: true,
        companionSeparationReason: 'Motivo Excel',
        companionSeparationOrigin: 'excel',
        companionSeparationAt: '2026-06-18T11:00:00.000Z',
      }),
      createGuest({
        id: 'g2',
        nombre: 'Luis Martinez',
        correo: 'luis@ejemplo.com',
      }),
    ];

    const groups = buildCompanionGroups(guests);

    expect(groups[0]?.keepTogether).toBe(false);
    expect(groups[0]?.exception).toMatchObject({
      reason: 'Motivo Excel',
      origin: 'excel',
    });
  });

  it('detecta incompatibilidades que impiden sentar juntos', () => {
    const guests = [
      createGuest({
        id: 'g1',
        restrictions: [
          {
            id: 'r1',
            guestId: 'g1',
            kind: 'incompatibilidad',
            targetHint: 'Luis Martinez',
            description: 'No sentar con Luis Martinez',
            origin: 'manual',
            createdAt: '2026-06-18T10:00:00.000Z',
          },
        ],
      }),
      createGuest({
        id: 'g2',
        nombre: 'Luis Martinez',
        correo: 'luis@ejemplo.com',
      }),
    ];

    const evaluation = evaluateCompanionGroup(guests, 'PAREJA_001');

    expect(evaluation).toMatchObject({
      keepTogether: true,
      canKeepTogether: false,
    });
    expect(evaluation.explanation).toContain('incompatibilidades');
    expect(evaluation.blockers).toHaveLength(1);
  });

  it('no exige juntos cuando hay excepcion explicita', () => {
    const guests = [
      createGuest({
        separarAcompanante: true,
        companionSeparationReason: 'Separacion acordada',
        companionSeparationOrigin: 'admin',
        companionSeparationAt: '2026-06-18T12:00:00.000Z',
      }),
      createGuest({
        id: 'g2',
        nombre: 'Luis Martinez',
        correo: 'luis@ejemplo.com',
      }),
    ];

    const evaluation = evaluateCompanionGroup(guests, 'PAREJA_001');

    expect(evaluation).toMatchObject({
      keepTogether: false,
      canKeepTogether: true,
      blockers: [],
    });
  });

  it('companionSeparationFromImport usa observaciones como motivo', () => {
    expect(
      companionSeparationFromImport(true, 'Separar por peticion familiar'),
    ).toMatchObject({
      companionSeparationReason: 'Separar por peticion familiar',
      companionSeparationOrigin: 'excel',
    });
  });

  it('companionSeparationFromImport limpia campos cuando no hay separacion', () => {
    expect(companionSeparationFromImport(false, 'observacion')).toEqual({
      companionSeparationReason: null,
      companionSeparationOrigin: null,
      companionSeparationAt: null,
    });
  });
});
