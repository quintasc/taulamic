import { BadRequestException } from '@nestjs/common';
import { extname } from 'node:path';
import {
  getGuestImportMaxBytes,
  isAllowedGuestImportExtension,
  isAllowedGuestImportMimeType,
} from '../guest-import.constants';

export type GuestImportUploadFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export function assertValidGuestImportFile(
  file: GuestImportUploadFile | undefined,
): void {
  if (!file) {
    throw new BadRequestException({
      code: 'FILE_REQUIRED',
      message: 'Debes seleccionar un archivo Excel.',
    });
  }

  const extension = extname(file.originalname).toLowerCase();
  if (!isAllowedGuestImportExtension(extension)) {
    throw new BadRequestException({
      code: 'INVALID_FILE_TYPE',
      message: 'Formato no soportado. Usa un archivo .xlsx.',
      details: { extension },
    });
  }

  if (!isAllowedGuestImportMimeType(file.mimetype)) {
    throw new BadRequestException({
      code: 'INVALID_FILE_TYPE',
      message: 'Formato no soportado. Usa un archivo .xlsx.',
      details: { mimeType: file.mimetype },
    });
  }

  const maxBytes = getGuestImportMaxBytes();
  if (file.size > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
    throw new BadRequestException({
      code: 'FILE_TOO_LARGE',
      message: `El archivo supera el tamano maximo permitido (${maxMb} MB).`,
      details: { sizeBytes: file.size, maxBytes },
    });
  }
}
