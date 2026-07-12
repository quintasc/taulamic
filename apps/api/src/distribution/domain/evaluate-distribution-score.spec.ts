import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import type { GuestPlacement } from './distribution.types';
import { evaluateDistributionScore, evaluateTableAffinityByTable } from './evaluate-distribution-score';

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

function table(id: string, capacity: number): EventTable {
  return {
    id,
    label: 'Mesa 1',
    shape: 'redonda',
    capacity,
    createdAt: '2026-07-07T10:00:00.000Z',
    updatedAt: '2026-07-07T10:00:00.000Z',
  };
}

function placement(
  guestId: string,
  guestName: string,
  tableId: string,
  seatIndex?: number,
): GuestPlacement {
  return {
    guestId,
    guestName,
    tableId,
    tableLabel: 'Mesa 1',
    seatIndex,
    seatLabel: seatIndex !== undefined ? `S${seatIndex + 1}` : undefined,
  };
}

describe('evaluateDistributionScore', () => {
  it('100% cuando todos asignados y pareja en asientos adyacentes', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'p1' }),
      guest('g2', 'Luis', { acompananteKey: 'p1' }),
    ];
    const placements = [
      placement('g1', 'Ana', 't1', 6),
      placement('g2', 'Luis', 't1', 5),
    ];

    const score = evaluateDistributionScore({
      placements,
      guests,
      tables: [table('t1', 8)],
      softRules: ['keepFamiliesTogether'],
    });

    expect(score.criteria.find((item) => item.key === 'assignment')?.percent).toBe(
      100,
    );
    expect(
      score.criteria.find((item) => item.key === 'tableAffinity')?.percent,
    ).toBe(100);
    expect(score.globalPercent).toBeGreaterThan(90);
  });

  it('penaliza reparto desequilibrado de categoría', () => {
    const guests = [
      guest('g1', 'Ana', { categoriaIds: ['familia'] }),
      guest('g2', 'Luis', { categoriaIds: ['familia'] }),
    ];
    const placements = [
      placement('g1', 'Ana', 't1'),
      placement('g2', 'Luis', 't2'),
    ];

    const score = evaluateDistributionScore({
      placements,
      guests,
      tables: [table('t1', 4), { ...table('t2', 4), id: 't2', label: 'Mesa 2' }],
      softRules: ['groupByCategory'],
    });

    const category = score.criteria.find((item) => item.key === 'groupByCategory');
    expect(category?.percent).toBeLessThan(100);
    expect(category?.detail).toContain('huérfano');
  });

  it('agrupar por categoria: reparto equilibrado puntua al máximo', () => {
    const guests = Array.from({ length: 10 }, (_, index) =>
      guest(`g${index}`, `Invitado ${index}`, { categoriaIds: ['familia'] }),
    );
    const placements = [
      ...Array.from({ length: 5 }, (_, index) =>
        placement(`g${index}`, `Invitado ${index}`, 't1'),
      ),
      ...Array.from({ length: 5 }, (_, index) =>
        placement(`g${index + 5}`, `Invitado ${index + 5}`, 't2'),
      ),
    ];

    const score = evaluateDistributionScore({
      placements,
      guests,
      tables: [table('t1', 8), { ...table('t2', 8), id: 't2', label: 'Mesa 2' }],
      softRules: ['groupByCategory'],
    });

    const category = score.criteria.find((item) => item.key === 'groupByCategory');
    expect(category?.percent).toBe(100);
    expect(category?.detail).toContain('0 huérfanos');
    expect(category?.detail).toContain('equilibrado');
  });

  it('afinidad por mesa: penaliza pareja separada en mesas distintas', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'p1' }),
      guest('g2', 'Luis', { acompananteKey: 'p1' }),
    ];
    const placements = [
      placement('g1', 'Ana', 't1'),
      placement('g2', 'Luis', 't2'),
    ];
    const tables = [
      table('t1', 4),
      { ...table('t2', 4), id: 't2', label: 'Mesa 2' },
    ];

    const score = evaluateDistributionScore({
      placements,
      guests,
      tables,
      softRules: [],
    });

    const affinity = score.criteria.find((item) => item.key === 'tableAffinity');
    expect(affinity?.percent).toBe(0);
    expect(affinity?.detail).toContain('0 de 2 invitados');

    const byTable = evaluateTableAffinityByTable(placements, guests, tables, []);
    // El score por mesa es local y añade ocupación para evitar 100% con mesa vacía.
    expect(byTable.find((item) => item.tableId === 't1')?.percent).toBe(25);
    expect(byTable.find((item) => item.tableId === 't2')?.percent).toBe(25);
  });

  it('compatibilidad por mesa replica reglas globales (categoria + vinculos)', () => {
    const guests = [
      guest('g1', 'Ana', { categoriaIds: ['familia'], acompananteKey: 'p1' }),
      guest('g2', 'Luis', { categoriaIds: ['familia'], acompananteKey: 'p1' }),
      guest('g3', 'Eva', { categoriaIds: ['amigos'] }),
      guest('g4', 'Pablo', { categoriaIds: ['amigos'] }),
    ];
    const placements = [
      placement('g1', 'Ana', 't1'),
      placement('g2', 'Luis', 't1'),
      placement('g3', 'Eva', 't2'),
      placement('g4', 'Pablo', 't2'),
    ];
    const tables = [
      table('t1', 8),
      { ...table('t2', 8), id: 't2', label: 'Mesa 2' },
    ];
    const softRules = ['groupByCategory'] as const;

    const globalScore = evaluateDistributionScore({
      placements,
      guests,
      tables,
      softRules: [...softRules],
    });
    expect(globalScore.criteria.map((item) => item.key)).toEqual(
      expect.arrayContaining(['groupByCategory', 'tableAffinity']),
    );

    const byTable = evaluateTableAffinityByTable(
      placements,
      guests,
      tables,
      [...softRules],
    );
    const mesa1 = byTable.find((item) => item.tableId === 't1');
    const mesa2 = byTable.find((item) => item.tableId === 't2');

    expect(mesa1?.percent).toBe(53.3);
    expect(mesa1?.detail).toContain('Agrupar por categoría');
    expect(mesa1?.detail).toContain('Afinidad por mesa');
    expect(mesa1?.detail).toContain('Ocupación de la mesa');
    expect(mesa1?.detail).toContain('Proximidad en la silla');
    expect(mesa2?.percent).toBe(50);

    const mesa1Scoped = evaluateDistributionScore({
      placements,
      guests,
      tables: [tables[0]],
      softRules: [...softRules],
      scopeTableId: 't1',
    });
    expect(mesa1Scoped.globalPercent).toBe(mesa1?.percent);
    expect(mesa1Scoped.criteria.map((item) => item.key)).not.toContain(
      'assignment',
    );
  });

  it('afinidad por mesa: incluye afinidades declaradas entre personas', () => {
    const guests = [
      guest('g1', 'Ana', {
        restrictions: [
          {
            id: 'r1',
            kind: 'afinidad',
            targetHint: 'Luis',
            description: '',
            origin: 'manual',
            suggestionId: null,
            createdAt: '2026-07-07T10:00:00.000Z',
          },
        ],
      }),
      guest('g2', 'Luis'),
    ];
    const placements = [
      placement('g1', 'Ana', 't1'),
      placement('g2', 'Luis', 't1'),
    ];

    const score = evaluateDistributionScore({
      placements,
      guests,
      tables: [table('t1', 8)],
      softRules: [],
    });

    const affinity = score.criteria.find((item) => item.key === 'tableAffinity');
    expect(affinity?.percent).toBe(100);
    expect(affinity?.earnedPoints).toBe(2);

    const byTable = evaluateTableAffinityByTable(
      placements,
      guests,
      [table('t1', 8)],
      [],
    );
    expect(byTable[0]?.percent).toBe(41.7);
    expect(byTable[0]?.detail).toContain('Afinidad por mesa');
    expect(byTable[0]?.detail).toContain('Ocupación de la mesa');
    expect(byTable[0]?.detail).toContain('Proximidad en la silla');
  });

  it('compatibilidad por mesa: ocupa y pondera vínculos + asientos', () => {
    const guests = [
      guest('g1', 'Ana', { acompananteKey: 'p1' }),
      guest('g2', 'Luis', { acompananteKey: 'p1' }),
    ];
    const placements = [
      placement('g1', 'Ana', 't1', 6),
      placement('g2', 'Luis', 't1', 5),
    ];

    const byTable = evaluateTableAffinityByTable(
      placements,
      guests,
      [table('t1', 8)],
      [],
    );
    expect(byTable[0]?.percent).toBe(58.3);
    expect(byTable[0]?.detail).toContain('Ocupación de la mesa');
  });

  it('sin reglas blandas activas solo evalua asignacion y proximidad si aplica', () => {
    const guests = [guest('g1', 'Ana'), guest('g2', 'Luis')];
    const placements = [
      placement('g1', 'Ana', 't1'),
      placement('g2', 'Luis', 't1'),
    ];

    const score = evaluateDistributionScore({
      placements,
      guests,
      tables: [table('t1', 8)],
      softRules: [],
    });

    expect(score.criteria.map((item) => item.key)).toEqual(['assignment']);
    expect(score.globalPercent).toBe(100);
  });
});
