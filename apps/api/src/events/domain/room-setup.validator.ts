import { BadRequestException, ConflictException } from '@nestjs/common';
import type { EventConfig } from './event-config';
import {
  MAX_ROOM_DIMENSION_M,
  MIN_ROOM_DIMENSION_M,
  type RoomSetup,
  type RoomShape,
} from './room-setup';

export type RoomSetupInput = {
  shape?: string;
  widthM?: number;
  lengthM?: number;
  radiusM?: number;
  placedAccessories?: string[];
};

function assertDimension(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isFinite(value)) {
    throw new BadRequestException({
      code: 'INVALID_ROOM_DIMENSION',
      message: `El campo ${field} es obligatorio y debe ser numerico.`,
      details: { field },
    });
  }

  if (value < MIN_ROOM_DIMENSION_M || value > MAX_ROOM_DIMENSION_M) {
    throw new BadRequestException({
      code: 'INVALID_ROOM_DIMENSION',
      message: `${field} debe estar entre ${MIN_ROOM_DIMENSION_M} y ${MAX_ROOM_DIMENSION_M} metros.`,
      details: { field, value },
    });
  }

  return value;
}

function parseShape(shape: string | undefined): RoomShape {
  if (shape === 'rectangular' || shape === 'round' || shape === 'oval') {
    return shape;
  }

  throw new BadRequestException({
    code: 'INVALID_ROOM_SHAPE',
    message: 'La forma del salon debe ser rectangular, round u oval.',
    details: { shape },
  });
}

export function assertRoomSetupEditable(event: EventConfig): void {
  if (event.status === 'plan_approved') {
    throw new ConflictException({
      code: 'EVENT_PLAN_APPROVED',
      message:
        'No se puede modificar el plano del salon tras aprobar el plan final del evento.',
    });
  }
}

export function parseRoomSetupInput(input: RoomSetupInput): Omit<RoomSetup, 'updatedAt'> {
  const shape = parseShape(input.shape);
  const placedAccessories = Array.isArray(input.placedAccessories)
    ? input.placedAccessories.filter((item) => typeof item === 'string')
    : [];

  if (shape === 'round') {
    return {
      shape,
      widthM: assertDimension(input.widthM ?? input.radiusM, 'radiusM'),
      lengthM: assertDimension(input.lengthM ?? input.radiusM, 'radiusM'),
      radiusM: assertDimension(input.radiusM ?? input.widthM, 'radiusM'),
      placedAccessories,
    };
  }

  return {
    shape,
    widthM: assertDimension(input.widthM, 'widthM'),
    lengthM: assertDimension(input.lengthM, 'lengthM'),
    radiusM: assertDimension(input.radiusM ?? 12, 'radiusM'),
    placedAccessories,
  };
}
