import { NotFoundException } from '@nestjs/common';
import { DetectTablesUseCase } from './detect-tables.use-case';
import type { TableDetectionPort } from '../infrastructure/detection/table-detection.port';
import type { FloorPlanStorageRepository } from '../infrastructure/floor-plan-storage.repository';

describe('DetectTablesUseCase', () => {
  const uploadedFile = {
    buffer: Buffer.from('%PDF-1.4\nMesa 1 redonda 10 pax\n'),
    mimeType: 'application/pdf',
    originalName: 'salon.pdf',
  };

  let storage: jest.Mocked<
    Pick<FloorPlanStorageRepository, 'findUploadedFile' | 'saveDetectionResult'>
  >;
  let detectionPort: jest.Mocked<TableDetectionPort>;
  let useCase: DetectTablesUseCase;

  beforeEach(() => {
    storage = {
      findUploadedFile: jest.fn(),
      saveDetectionResult: jest.fn(),
    };
    detectionPort = {
      detect: jest.fn(),
    };
    useCase = new DetectTablesUseCase(
      storage as unknown as FloorPlanStorageRepository,
      detectionPort,
    );
  });

  it('lanza 404 si el plano no existe', async () => {
    storage.findUploadedFile.mockResolvedValue(null);

    await expect(useCase.execute('evt_123', 'fp_1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('marca deteccion parcial cuando la confianza es baja', async () => {
    storage.findUploadedFile.mockResolvedValue(uploadedFile);
    detectionPort.detect.mockResolvedValue([
      {
        label: 'Mesa 1',
        hasExplicitShape: false,
        hasExplicitCapacity: false,
      },
    ]);

    const result = await useCase.execute('evt_123', 'fp_1');

    expect(result.status).toBe('partial');
    expect(result.tables).toHaveLength(1);
    expect(result.message).toContain('parcial');
    expect(result.manualFallbackAvailable).toBe(true);
  });

  it('devuelve failed con fallback manual cuando hay timeout', async () => {
    storage.findUploadedFile.mockResolvedValue(uploadedFile);
    process.env.FLOOR_PLAN_DETECTION_TIMEOUT_MS = '20';
    detectionPort.detect.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve([
                {
                  label: 'Mesa 1',
                  rawShape: 'redonda',
                  estimatedCapacity: 10,
                  hasExplicitShape: true,
                  hasExplicitCapacity: true,
                },
              ]),
            100,
          );
        }),
    );

    const result = await useCase.execute('evt_123', 'fp_1');

    expect(result.status).toBe('failed');
    expect(result.tables).toEqual([]);
    expect(result.manualFallbackAvailable).toBe(true);
    expect(result.message).toContain('tiempo maximo');
  });

  afterEach(() => {
    delete process.env.FLOOR_PLAN_DETECTION_TIMEOUT_MS;
  });
});
