import { buildSeatTopology, assertValidTopologyCapacity } from './build-seat-topology';

describe('buildSeatTopology', () => {
  it('genera asientos etiquetados y adyacencias en mesa redonda', () => {
    const topology = buildSeatTopology('redonda', 4);

    expect(topology.seats).toHaveLength(4);
    expect(topology.proximities).toEqual(
      expect.arrayContaining([
        { from: 0, to: 1, kind: 'adyacente' },
        { from: 0, to: 2, kind: 'enfrente' },
        { from: 0, to: 3, kind: 'adyacente' },
      ]),
    );
  });

  it('representa enfrente entre lados en mesa rectangular', () => {
    const topology = buildSeatTopology('rectangular', 6);

    expect(topology.proximities).toEqual(
      expect.arrayContaining([
        { from: 0, to: 1, kind: 'adyacente' },
        { from: 0, to: 3, kind: 'enfrente' },
        { from: 0, to: 2, kind: 'mismo_lateral' },
      ]),
    );
  });

  it('recalcula proximidades al cambiar forma con la misma capacidad', () => {
    const rectangular = buildSeatTopology('rectangular', 8);
    const redonda = buildSeatTopology('redonda', 8);

    expect(rectangular.shape).toBe('rectangular');
    expect(redonda.shape).toBe('redonda');
    expect(rectangular.proximities).not.toEqual(redonda.proximities);
  });

  it('rechaza capacidad insuficiente para imperial', () => {
    expect(() => buildSeatTopology('imperial', 4)).toThrow();
    expect(() => assertValidTopologyCapacity('imperial', 6)).not.toThrow();
  });
});
