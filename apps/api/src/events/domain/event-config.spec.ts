import { summarizeEventCapacity } from './event-config';

describe('summarizeEventCapacity', () => {
  it('agrega capacidad total y desglose por forma', () => {
    const summary = summarizeEventCapacity([
      {
        id: 't1',
        label: 'Mesa 1',
        shape: 'redonda',
        capacity: 8,
        createdAt: '2026-06-21T10:00:00.000Z',
        updatedAt: '2026-06-21T10:00:00.000Z',
      },
      {
        id: 't2',
        label: 'Mesa 2',
        shape: 'rectangular',
        capacity: 10,
        createdAt: '2026-06-21T10:00:00.000Z',
        updatedAt: '2026-06-21T10:00:00.000Z',
      },
      {
        id: 't3',
        label: 'Mesa 3',
        shape: 'redonda',
        capacity: 6,
        createdAt: '2026-06-21T10:00:00.000Z',
        updatedAt: '2026-06-21T10:00:00.000Z',
      },
    ]);

    expect(summary).toEqual({
      tableCount: 3,
      totalCapacity: 24,
      byShape: {
        redonda: { tableCount: 2, totalCapacity: 14 },
        rectangular: { tableCount: 1, totalCapacity: 10 },
      },
    });
  });
});
