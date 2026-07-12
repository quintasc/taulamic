import {
  computeBalancedCountBounds,
  computeKMin,
} from './category-grouping';

describe('cp-sat-category-grouping (Big-M)', () => {
  it('documenta el rango Big-M para indicadores de categoría', () => {
    const capacity = 8;
    const count = 5;
    const isPresent = 1;

    expect(count).toBeLessThanOrEqual(capacity * isPresent);
    expect(count).toBeGreaterThanOrEqual(isPresent);
  });

  it('k_min y bounds L2 para 15 invitados en mesas de 8', () => {
    expect(computeKMin(15, 8)).toBe(2);
    expect(computeBalancedCountBounds(15, 2)).toEqual({ min: 7, max: 8 });
  });
});
