import type { Guest } from '../../guest-import/domain/guest';
import type { EventTable } from '../../events/domain/event-config';
import {
  analyzeCategoryDistributions,
  buildCategoryGroupingPlans,
  computeBalancedCountBounds,
  computeKMin,
  categoryGroupingPenalty,
  isBalancedSplit,
  tableCategoryMixingPenalty,
  wouldCreateAvoidableCategoryOrphan,
} from './category-grouping';
import { buildPlacementUnits } from './placement-units';
import type { DistributionProposal } from './distribution.types';

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

describe('category-grouping (ADR-024)', () => {
  it('k_min para 9 invitados y mesas de 8 plazas es 2', () => {
    expect(computeKMin(9, 8)).toBe(2);
  });

  it('k_min para 15 invitados y mesas de 8 plazas es 2', () => {
    expect(computeKMin(15, 8)).toBe(2);
  });

  it('L2 con k=2 y N=15 exige conteos entre 7 y 8 por mesa', () => {
    expect(computeBalancedCountBounds(15, 2)).toEqual({ min: 7, max: 8 });
  });

  it('L2 con k=2 y N=9 exige conteos entre 4 y 5 por mesa', () => {
    expect(computeBalancedCountBounds(9, 2)).toEqual({ min: 4, max: 5 });
  });

  it('categoryGroupingPenalty prioriza menos mesas usadas', () => {
    const relaxed = [
      {
        categoryId: 'amigos novia',
        guestCount: 15,
        kUsed: 7,
        kMin: 2,
        countsByTable: new Map(),
        spread: 1,
        orphanCount: 0,
        relaxed: true,
      },
    ];
    const optimal = [
      {
        categoryId: 'amigos novia',
        guestCount: 15,
        kUsed: 2,
        kMin: 2,
        countsByTable: new Map(),
        spread: 1,
        orphanCount: 0,
        relaxed: false,
      },
    ];

    expect(categoryGroupingPenalty(optimal)).toBeLessThan(
      categoryGroupingPenalty(relaxed),
    );
  });

  it('penaliza mesas con categorias mezcladas', () => {
    expect(
      categoryGroupingPenalty(
        [
          {
            categoryId: 'amigos novia',
            guestCount: 15,
            kUsed: 2,
            kMin: 2,
            countsByTable: new Map(),
            spread: 1,
            orphanCount: 0,
            relaxed: false,
          },
        ],
        50_000,
      ),
    ).toBeGreaterThan(
      categoryGroupingPenalty(
        [
          {
            categoryId: 'amigos novia',
            guestCount: 15,
            kUsed: 2,
            kMin: 2,
            countsByTable: new Map(),
            spread: 1,
            orphanCount: 0,
            relaxed: false,
          },
        ],
        0,
      ),
    );
  });

  it('tableCategoryMixingPenalty castiga fuerte 3+ categorias en una mesa', () => {
    const guests = [
      guest('g1', 'A', { categoriaIds: ['c1'] }),
      guest('g2', 'B', { categoriaIds: ['c2'] }),
      guest('g3', 'C', { categoriaIds: ['c3'] }),
    ];
    const placements = [
      { guestId: 'g1', guestName: 'A', tableId: 't1', tableLabel: 'M1' },
      { guestId: 'g2', guestName: 'B', tableId: 't1', tableLabel: 'M1' },
      { guestId: 'g3', guestName: 'C', tableId: 't1', tableLabel: 'M1' },
    ];

    const triple = tableCategoryMixingPenalty(
      placements,
      guests,
      new Set(['c1', 'c2', 'c3']),
    );
    const pair = tableCategoryMixingPenalty(
      [placements[0], placements[1]],
      guests,
      new Set(['c1', 'c2', 'c3']),
    );

    expect(triple).toBeGreaterThan(pair);
  });

  it('reparto 5+4 es equilibrado; 8+1 no', () => {
    expect(isBalancedSplit([5, 4])).toBe(true);
    expect(isBalancedSplit([8, 1])).toBe(false);
  });

  it('buildCategoryGroupingPlans agrupa por categoria con N>=2', () => {
    const guests = Array.from({ length: 9 }, (_, index) =>
      guest(`g${index}`, `Invitado ${index}`, { categoriaIds: ['amigos'] }),
    );
    const guestById = new Map(guests.map((entry) => [entry.id, entry]));
    const units = buildPlacementUnits(guests);
    const plans = buildCategoryGroupingPlans(units, guestById, 8);

    expect(plans).toHaveLength(1);
    expect(plans[0].guestCount).toBe(9);
    expect(plans[0].kMin).toBe(2);
  });

  it('analyzeCategoryDistributions detecta huérfanos y desequilibrio', () => {
    const guests = Array.from({ length: 9 }, (_, index) =>
      guest(`g${index}`, `Invitado ${index}`, { categoriaIds: ['amigos'] }),
    );
    const placements = [
      ...Array.from({ length: 8 }, (_, index) => ({
        guestId: `g${index}`,
        guestName: `Invitado ${index}`,
        tableId: 't1',
        tableLabel: 'Mesa 1',
      })),
      {
        guestId: 'g8',
        guestName: 'Invitado 8',
        tableId: 't2',
        tableLabel: 'Mesa 2',
      },
    ];

    const [analysis] = analyzeCategoryDistributions(placements, guests, 8);
    expect(analysis.kUsed).toBe(2);
    expect(analysis.orphanCount).toBe(1);
    expect(analysis.spread).toBeGreaterThan(1);
  });

  it('wouldCreateAvoidableCategoryOrphan bloquea huérfano evitable', () => {
    const guests = [
      guest('g1', 'Ana', { categoriaIds: ['familia'] }),
      guest('g2', 'Luis', { categoriaIds: ['familia'] }),
      guest('g3', 'Carla'),
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
    const proposal: DistributionProposal = {
      id: 'dist_1',
      eventId: 'evt_1',
      motorVersion: 'v1-cpsat',
      status: 'draft',
      placements: [
        {
          guestId: 'g2',
          guestName: 'Luis',
          tableId: 't1',
          tableLabel: 'Mesa 1',
        },
      ],
      unassignedGuestIds: ['g1', 'g3'],
      hardRuleViolations: [],
      stats: {
        assignedCount: 1,
        unassignedCount: 2,
        tableCount: 2,
        totalCapacity: 8,
      },
      createdAt: '2026-07-08T00:00:00.000Z',
      confirmedAt: null,
    };

    expect(
      wouldCreateAvoidableCategoryOrphan(
        proposal,
        guests[0],
        't2',
        guests,
        tables,
      ),
    ).toBe(true);
  });
});
