import { BadRequestException } from '@nestjs/common';
import {
  assertValidDraftTableInput,
  resolveConfigurationOrigin,
} from './draft-table.validator';

describe('assertValidDraftTableInput', () => {
  it('acepta datos validos', () => {
    expect(
      assertValidDraftTableInput({
        label: 'Mesa 1',
        shape: 'redonda',
        estimatedCapacity: 10,
      }),
    ).toEqual({
      label: 'Mesa 1',
      shape: 'redonda',
      estimatedCapacity: 10,
    });
  });

  it('rechaza forma invalida', () => {
    expect(() =>
      assertValidDraftTableInput({
        label: 'Mesa 1',
        shape: 'triangular',
        estimatedCapacity: 8,
      }),
    ).toThrow(BadRequestException);
  });

  it('rechaza capacidad fuera de rango', () => {
    expect(() =>
      assertValidDraftTableInput({
        label: 'Mesa 1',
        shape: 'redonda',
        estimatedCapacity: 0,
      }),
    ).toThrow(BadRequestException);
  });
});

describe('resolveConfigurationOrigin', () => {
  it('marca imported_edited si hubo deteccion con mesas', () => {
    expect(resolveConfigurationOrigin(true)).toBe('imported_edited');
  });

  it('marca manual si no hubo mesas detectadas', () => {
    expect(resolveConfigurationOrigin(false)).toBe('manual');
  });
});
