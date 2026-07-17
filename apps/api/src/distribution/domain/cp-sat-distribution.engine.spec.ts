import {
  buildCategoryGroupingAttempts,
  resolveEngineProfile,
  resolveCategoryRefinementReserveMs,
  resolveCpSatTimeBudgetMs,
} from './cp-sat-distribution.engine';

describe('resolveCpSatTimeBudgetMs', () => {
  const baseInput = {
    eventId: 'evt_1',
    proposalId: 'dist_1',
    tables: [],
    guests: [],
    createdAt: '2026-07-08T00:00:00.000Z',
  };

  it('respeta timeBudgetMs explicito del input', () => {
    expect(
      resolveCpSatTimeBudgetMs({ ...baseInput, timeBudgetMs: 12_345 }, 500, 20),
    ).toBe(12_345);
  });

  it('usa presupuesto corto sin reglas blandas', () => {
    expect(resolveCpSatTimeBudgetMs(baseInput, 0, 20)).toBe(3_000);
  });

  it('amplia el presupuesto con agrupacion por categoria', () => {
    expect(resolveCpSatTimeBudgetMs(baseInput, 0, 10, 8)).toBe(30_000);
  });

  it('amplia el presupuesto con muchos pares de categoria x mesas', () => {
    expect(resolveCpSatTimeBudgetMs(baseInput, 607, 20)).toBe(30_000);
  });

  it('define escalada ADR-024 con L1 duro tras intento blando', () => {
    const attempts = buildCategoryGroupingAttempts({
      plans: [
        {
          categoryId: 'amigos novia',
          guestCount: 15,
          kMin: 2,
          unitContributions: [],
        },
      ],
      lexWeight: 1,
    });

    expect(attempts).toHaveLength(3);
    expect(attempts[0]).toMatchObject({
      hardCategoryL1: false,
      hardCategoryL2: false,
      hardCategoryL3: true,
    });
    expect(attempts[1]).toMatchObject({
      hardCategoryL1: true,
      hardCategoryL2: false,
      hardCategoryL3: true,
      stripPairTerms: true,
    });
    expect(attempts[2]).toMatchObject({
      hardCategoryL1: true,
      hardCategoryL2: false,
      hardCategoryL3: true,
    });
  });

  it('activa perfil category_dominant con alta presión de categorías', () => {
    expect(
      resolveEngineProfile({
        guestCount: 84,
        tableCount: 14,
        pairTermCount: 10,
        categoryPlanCount: 9,
        explicitHardRelationCount: 2,
      }),
    ).toBe('category_dominant');
  });

  it('activa perfil affinity_dominant con alta densidad relacional', () => {
    expect(
      resolveEngineProfile({
        guestCount: 80,
        tableCount: 10,
        pairTermCount: 180,
        categoryPlanCount: 2,
        explicitHardRelationCount: 40,
      }),
    ).toBe('affinity_dominant');
  });

  it('category_dominant mantiene escalada y añade un intento L2 duro final', () => {
    const attempts = buildCategoryGroupingAttempts(
      {
        plans: [
          {
            categoryId: 'amigos novia',
            guestCount: 15,
            kMin: 2,
            unitContributions: [],
          },
        ],
        lexWeight: 1,
      },
      'category_dominant',
    );

    expect(attempts).toHaveLength(4);
    expect(attempts[1]).toMatchObject({
      hardCategoryL1: true,
      hardCategoryL2: false,
      stripPairTerms: true,
    });
    expect(attempts[3]).toMatchObject({
      hardCategoryL1: true,
      hardCategoryL2: true,
      stripPairTerms: true,
    });
  });

  it('reserva tiempo para intentos L1 duro por categoria', () => {
    expect(resolveCategoryRefinementReserveMs(6)).toBe(16_000);
    expect(resolveCategoryRefinementReserveMs(1)).toBe(16_000);
  });
});
