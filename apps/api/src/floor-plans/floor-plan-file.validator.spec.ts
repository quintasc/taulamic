import { BadRequestException } from '@nestjs/common';
import { assertValidFloorPlanFile } from './floor-plan-file.validator';

const baseFile = {
  originalname: 'plano.pdf',
  mimetype: 'application/pdf',
  size: 1024,
  buffer: Buffer.from('pdf'),
};

describe('assertValidFloorPlanFile', () => {
  it('acepta PDF valido', () => {
    expect(() => assertValidFloorPlanFile(baseFile, 10_000)).not.toThrow();
  });

  it('rechaza archivo ausente', () => {
    expect(() => assertValidFloorPlanFile(undefined, 10_000)).toThrow(
      BadRequestException,
    );
  });

  it('rechaza extension no soportada', () => {
    expect(() =>
      assertValidFloorPlanFile(
        { ...baseFile, originalname: 'plano.gif', mimetype: 'image/gif' },
        10_000,
      ),
    ).toThrow(BadRequestException);
  });

  it('rechaza tamano excedido', () => {
    expect(() =>
      assertValidFloorPlanFile({ ...baseFile, size: 20_000 }, 10_000),
    ).toThrow(BadRequestException);
  });
});
