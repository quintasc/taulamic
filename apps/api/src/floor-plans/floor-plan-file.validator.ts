import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';
import {
  FLOOR_PLAN_ALLOWED_EXTENSIONS,
  FLOOR_PLAN_ALLOWED_MIME_TYPES,
  isAllowedFloorPlanExtension,
  isAllowedFloorPlanMimeType,
} from './floor-plan-upload.constants';

export type FloorPlanUploadFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export function assertValidFloorPlanFile(
  file: FloorPlanUploadFile | undefined,
  maxBytes: number,
): void {
  if (!file) {
    throw new BadRequestException({
      code: 'FILE_REQUIRED',
      message: 'Debes seleccionar un archivo de plano.',
    });
  }

  const extension = extname(file.originalname).toLowerCase();
  if (!isAllowedFloorPlanExtension(extension)) {
    throw new BadRequestException({
      code: 'INVALID_FILE_TYPE',
      message: 'Formato no soportado. Usa JPG, PNG o PDF.',
      details: {
        extension,
        allowedExtensions: [...FLOOR_PLAN_ALLOWED_EXTENSIONS],
      },
    });
  }

  if (!isAllowedFloorPlanMimeType(file.mimetype)) {
    throw new BadRequestException({
      code: 'INVALID_FILE_TYPE',
      message: 'Formato no soportado. Usa JPG, PNG o PDF.',
      details: {
        mimeType: file.mimetype,
        allowedMimeTypes: [...FLOOR_PLAN_ALLOWED_MIME_TYPES],
      },
    });
  }

  if (file.size > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
    throw new BadRequestException({
      code: 'FILE_TOO_LARGE',
      message: `El archivo supera el tamano maximo permitido (${maxMb} MB).`,
      details: {
        sizeBytes: file.size,
        maxBytes,
      },
    });
  }
}
