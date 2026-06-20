import { normalizeTableShape } from './table-shape.normalizer';

describe('normalizeTableShape', () => {
  it('normaliza redonda', () => {
    expect(normalizeTableShape('mesa redonda')).toEqual({
      shape: 'redonda',
      matched: true,
    });
  });

  it('normaliza rectangular', () => {
    expect(normalizeTableShape('rectangular')).toEqual({
      shape: 'rectangular',
      matched: true,
    });
  });

  it('normaliza imperial', () => {
    expect(normalizeTableShape('imperial')).toEqual({
      shape: 'imperial',
      matched: true,
    });
  });

  it('normaliza ovalada', () => {
    expect(normalizeTableShape('oval')).toEqual({
      shape: 'ovalada',
      matched: true,
    });
  });

  it('usa rectangular por defecto si no hay coincidencia', () => {
    expect(normalizeTableShape('forma rara')).toEqual({
      shape: 'rectangular',
      matched: false,
    });
  });
});
