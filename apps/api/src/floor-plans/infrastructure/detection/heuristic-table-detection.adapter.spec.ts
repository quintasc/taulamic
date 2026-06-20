import { HeuristicTableDetectionAdapter } from './heuristic-table-detection.adapter';

describe('HeuristicTableDetectionAdapter', () => {
  const adapter = new HeuristicTableDetectionAdapter();

  it('detecta mesas con forma y capacidad en texto embebido', () => {
    const buffer = Buffer.from(
      '%PDF-1.4\nMesa 1 redonda 10 pax\nMesa 2 rectangular 8 personas\n',
    );

    const result = adapter.detect({
      buffer,
      mimeType: 'application/pdf',
      originalName: 'salon.pdf',
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      label: 'Mesa 1',
      hasExplicitShape: true,
      hasExplicitCapacity: true,
      estimatedCapacity: 10,
    });
    expect(result[1]).toMatchObject({
      label: 'Mesa 2',
      hasExplicitShape: true,
      hasExplicitCapacity: true,
      estimatedCapacity: 8,
    });
  });

  it('devuelve lista vacia si no hay patrones de mesa', () => {
    const result = adapter.detect({
      buffer: Buffer.from('%PDF-1.4\nplano sin etiquetas\n'),
      mimeType: 'application/pdf',
      originalName: 'vacio.pdf',
    });

    expect(result).toEqual([]);
  });
});
