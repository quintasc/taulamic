import { BadRequestException } from '@nestjs/common';
import type { GuestManualInput } from '../../guest-import/infrastructure/persistence/guest.repository.port';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{9,20}$/;

export function parseGuestManualInput(input: {
  nombre?: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
  categoryNames?: string[];
  observaciones?: string;
  acompananteKey?: string;
  separarAcompanante?: boolean | null;
  preferenciaControl?: string | null;
}): GuestManualInput {
  const nombre = input.nombre?.trim();
  if (!nombre) {
    throw new BadRequestException({
      code: 'INVALID_GUEST_NAME',
      message: 'El nombre del invitado es obligatorio.',
    });
  }

  if (nombre.length > 120) {
    throw new BadRequestException({
      code: 'INVALID_GUEST_NAME',
      message: 'El nombre supera el maximo de 120 caracteres.',
    });
  }

  const correo = input.correo?.trim().toLowerCase();
  if (!correo || !EMAIL_PATTERN.test(correo)) {
    throw new BadRequestException({
      code: 'INVALID_GUEST_EMAIL',
      message: 'El correo del invitado no es valido.',
    });
  }

  const telefono = input.telefono?.trim();
  if (!telefono || !PHONE_PATTERN.test(telefono)) {
    throw new BadRequestException({
      code: 'INVALID_GUEST_PHONE',
      message: 'El telefono del invitado no es valido.',
    });
  }

  if (
    input.preferenciaControl &&
    !['colaborativo', 'anfitrion_exclusivo'].includes(input.preferenciaControl)
  ) {
    throw new BadRequestException({
      code: 'INVALID_PREFERENCE_CONTROL',
      message: 'preferenciaControl debe ser colaborativo o anfitrion_exclusivo.',
    });
  }

  return {
    nombre,
    correo,
    telefono,
    direccion: input.direccion?.trim() ?? '',
    categoryNames: (input.categoryNames ?? []).map((name) => name.trim()).filter(Boolean),
    observaciones: input.observaciones?.trim() ?? '',
    acompananteKey: input.acompananteKey?.trim() ?? '',
    separarAcompanante: input.separarAcompanante ?? null,
    preferenciaControl:
      (input.preferenciaControl as GuestManualInput['preferenciaControl']) ?? null,
  };
}
