import type { Guest } from '../../guest-import/domain/guest';
import { buildPlacementUnits } from './placement-units';
import { buildSoftRulePlan } from './soft-rules';

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

function planFor(guests: Guest[], softRules: Parameters<typeof buildSoftRulePlan>[2]) {
  const guestById = new Map(guests.map((entry) => [entry.id, entry]));
  const units = buildPlacementUnits(guests);
  return {
    plan: buildSoftRulePlan(units, guestById, softRules, {
      maxTableCapacity: 8,
      tableCount: 2,
    }),
    units,
  };
}

describe('buildSoftRulePlan', () => {
  it('sin reglas activas: solo peso de asignacion', () => {
    const guests = [guest('g1', 'Ana'), guest('g2', 'Luis')];
    const { plan } = planFor(guests, []);

    expect(plan.pairTerms).toEqual([]);
    expect(plan.appliedRules).toEqual([]);
    expect(plan.assignmentWeight).toBe(1);
  });

  it('groupByCategory genera plan de reparto proporcional sin pares genericos', () => {
    const guests = [
      guest('g1', 'Ana', { categoriaIds: ['familia'] }),
      guest('g2', 'Luis', { categoriaIds: ['familia'] }),
      guest('g3', 'Carla', { categoriaIds: ['trabajo'] }),
    ];
    const { plan } = planFor(guests, ['groupByCategory']);

    expect(plan.appliedRules).toEqual(['groupByCategory']);
    expect(plan.pairTerms).toEqual([]);
    expect(plan.categoryGrouping?.plans).toHaveLength(1);
    expect(plan.categoryGrouping?.plans[0].categoryId).toBe('familia');
    expect(plan.categoryGrouping?.plans[0].guestCount).toBe(2);
  });

  it('keepFamiliesTogether usa afinidades declaradas por persona', () => {
    const guests = [
      guest('g1', 'Ana', { restrictions: [affinity('r1', 'Luis')] }),
      guest('g2', 'Luis'),
      guest('g3', 'Carla'),
    ];
    const { plan } = planFor(guests, ['keepFamiliesTogether']);

    expect(plan.pairTerms).toHaveLength(1);
  });

  it('singlesTable empareja solo a invitados sin pareja ni afinidad', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'p1' }),
      guest('g2', 'Luis', { acompananteKey: 'p1' }),
      guest('g3', 'Carla'),
      guest('g4', 'David'),
      guest('g5', 'Elena'),
    ];
    const { plan } = planFor(guests, ['singlesTable']);

    // 3 solteros: C(3,2) = 3 pares.
    expect(plan.pairTerms).toHaveLength(3);
  });

  it('reglas no evaluables (dura o sin datos) no aportan terminos', () => {
    const guests = [guest('g1', 'Ana'), guest('g2', 'Luis')];
    const { plan } = planFor(guests, [
      'separateKnownIncompatibles',
      'groupByAge',
      'alternateGender',
    ]);

    expect(plan.appliedRules).toEqual([]);
    expect(plan.pairTerms).toEqual([]);
  });

  it('prioridad lexicografica: la regla en posicion 1 domina a la 2', () => {
    const guests = [
      guest('g1', 'Ana', { categoriaIds: ['familia'] }),
      guest('g2', 'Luis', { categoriaIds: ['familia'] }),
      guest('g3', 'Carla', { restrictions: [affinity('r1', 'David')] }),
      guest('g4', 'David'),
    ];

    const { plan: categoryFirst } = planFor(guests, [
      'groupByCategory',
      'keepFamiliesTogether',
    ]);
    const { plan: familiesFirst } = planFor(guests, [
      'keepFamiliesTogether',
      'groupByCategory',
    ]);

    expect(categoryFirst.pairTerms).toHaveLength(1);
    expect(familiesFirst.pairTerms).toHaveLength(1);
    expect(categoryFirst.categoryGrouping?.lexWeight).toBeGreaterThan(
      categoryFirst.pairTerms[0].weight,
    );
    expect(familiesFirst.pairTerms[0].weight).toBeGreaterThan(
      familiesFirst.categoryGrouping?.lexWeight ?? 0,
    );
  });

  it('asignar siempre domina a todas las reglas blandas', () => {
    const guests = [
      guest('g1', 'Ana', { categoriaIds: ['familia'] }),
      guest('g2', 'Luis', { categoriaIds: ['familia'] }),
      guest('g3', 'Carla', { categoriaIds: ['familia'] }),
    ];
    const { plan } = planFor(guests, ['groupByCategory']);

    const softTotal = plan.categoryGrouping?.lexWeight ?? 0;
    expect(plan.assignmentWeight).toBeGreaterThan(softTotal);
  });
});
