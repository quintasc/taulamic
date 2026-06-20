import { BadRequestException } from '@nestjs/common';
import { LayoutConfigurationOrigin } from './table-origin';
import { isTableShape } from './table-shape';

export type DraftTableInput = {
  label?: string;
  shape?: string;
  estimatedCapacity?: number;
};

const MIN_CAPACITY = 1;
const MAX_CAPACITY = 50;
const MAX_LABEL_LENGTH = 100;

export function assertValidDraftTableInput(input: DraftTableInput): {
  label: string;
  shape: string;
  estimatedCapacity: number;
} {
  const label = input.label?.trim();
  if (!label) {
    throw new BadRequestException({
      code: 'INVALID_TABLE_LABEL',
      message: 'El nombre de la mesa es obligatorio.',
    });
  }

  if (label.length > MAX_LABEL_LENGTH) {
    throw new BadRequestException({
      code: 'INVALID_TABLE_LABEL',
      message: `El nombre de la mesa no puede superar ${MAX_LABEL_LENGTH} caracteres.`,
    });
  }

  if (!input.shape || !isTableShape(input.shape)) {
    throw new BadRequestException({
      code: 'INVALID_TABLE_SHAPE',
      message: 'Forma de mesa no soportada.',
      details: { shape: input.shape },
    });
  }

  if (
    input.estimatedCapacity === undefined ||
    !Number.isInteger(input.estimatedCapacity) ||
    input.estimatedCapacity < MIN_CAPACITY ||
    input.estimatedCapacity > MAX_CAPACITY
  ) {
    throw new BadRequestException({
      code: 'INVALID_TABLE_CAPACITY',
      message: `La capacidad debe ser un entero entre ${MIN_CAPACITY} y ${MAX_CAPACITY}.`,
      details: { estimatedCapacity: input.estimatedCapacity },
    });
  }

  return {
    label,
    shape: input.shape,
    estimatedCapacity: input.estimatedCapacity,
  };
}

export function resolveConfigurationOrigin(
  detectionHadTables: boolean,
): LayoutConfigurationOrigin {
  return detectionHadTables ? 'imported_edited' : 'manual';
}
