import { toPersistedLayoutTable } from './layout-version.mapper';

describe('toPersistedLayoutTable', () => {
  it('marca mesa detectada sin correccion', () => {
    const result = toPersistedLayoutTable({
      id: 't1',
      label: 'Mesa 1',
      shape: 'redonda',
      estimatedCapacity: 10,
      confidence: 0.9,
      origin: 'detected',
    });

    expect(result.audit).toEqual({
      wasAutoDetected: true,
      wasManuallyCorrected: false,
      detectionConfidence: 0.9,
    });
  });

  it('marca mesa detectada y corregida', () => {
    const result = toPersistedLayoutTable({
      id: 't1',
      label: 'Mesa principal',
      shape: 'redonda',
      estimatedCapacity: 12,
      confidence: 0.9,
      origin: 'detected_edited',
    });

    expect(result.audit).toEqual({
      wasAutoDetected: true,
      wasManuallyCorrected: true,
      detectionConfidence: 0.9,
    });
  });

  it('marca mesa creada manualmente', () => {
    const result = toPersistedLayoutTable({
      id: 't2',
      label: 'Mesa VIP',
      shape: 'imperial',
      estimatedCapacity: 14,
      origin: 'manual',
    });

    expect(result.audit).toEqual({
      wasAutoDetected: false,
      wasManuallyCorrected: true,
      detectionConfidence: undefined,
    });
  });
});
