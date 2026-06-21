import { BadRequestException } from '@nestjs/common';
import { TableShape } from './table-shape';
import {
  ProximityKind,
  SeatProximity,
  SeatRef,
  TableSeatTopology,
} from './seat-proximity';

const MIN_CAPACITY_BY_SHAPE: Record<TableShape, number> = {
  redonda: 2,
  rectangular: 2,
  ovalada: 2,
  imperial: 6,
};

const MAX_CAPACITY = 50;

function circularDistance(a: number, b: number, capacity: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, capacity - diff);
}

function addSymmetricPair(
  pairs: SeatProximity[],
  from: number,
  to: number,
  kind: ProximityKind,
): void {
  if (from === to) {
    return;
  }

  const [left, right] = from < to ? [from, to] : [to, from];
  const exists = pairs.some(
    (entry) => entry.from === left && entry.to === right && entry.kind === kind,
  );

  if (!exists) {
    pairs.push({ from: left, to: right, kind });
  }
}

function buildSeatLabels(capacity: number): SeatRef[] {
  return Array.from({ length: capacity }, (_, index) => ({
    index,
    label: `S${index + 1}`,
  }));
}

function buildCircularTopology(
  shape: TableShape,
  capacity: number,
): TableSeatTopology {
  const proximities: SeatProximity[] = [];

  for (let from = 0; from < capacity; from += 1) {
    for (let to = from + 1; to < capacity; to += 1) {
      const distance = circularDistance(from, to, capacity);

      if (distance === 1) {
        addSymmetricPair(proximities, from, to, 'adyacente');
        continue;
      }

      if (capacity % 2 === 0 && distance === capacity / 2) {
        addSymmetricPair(proximities, from, to, 'enfrente');
        continue;
      }

      if (distance === 2) {
        addSymmetricPair(proximities, from, to, 'mismo_lateral');
      }
    }
  }

  return {
    shape,
    capacity,
    seats: buildSeatLabels(capacity),
    proximities,
  };
}

function splitRectangularSides(capacity: number): {
  sideA: number;
  sideB: number;
} {
  const sideA = Math.ceil(capacity / 2);
  const sideB = capacity - sideA;
  return { sideA, sideB };
}

function isOnSideA(index: number, sideA: number): boolean {
  return index < sideA;
}

function buildRectangularTopology(capacity: number): TableSeatTopology {
  const { sideA } = splitRectangularSides(capacity);
  const proximities: SeatProximity[] = [];

  for (let from = 0; from < capacity; from += 1) {
    for (let to = from + 1; to < capacity; to += 1) {
      const sameSide =
        isOnSideA(from, sideA) === isOnSideA(to, sideA);
      const sideDistance = Math.abs(from - to);

      if (sameSide) {
        if (sideDistance === 1) {
          addSymmetricPair(proximities, from, to, 'adyacente');
        } else if (sideDistance >= 2) {
          addSymmetricPair(proximities, from, to, 'mismo_lateral');
        }
        continue;
      }

      const facingIndex = isOnSideA(from, sideA) ? from + sideA : to + sideA;
      if (facingIndex === to || facingIndex === from) {
        addSymmetricPair(proximities, from, to, 'enfrente');
      }
    }
  }

  return {
    shape: 'rectangular',
    capacity,
    seats: buildSeatLabels(capacity),
    proximities,
  };
}

function splitImperialSegments(capacity: number): {
  leftLeg: number;
  bottom: number;
  rightLeg: number;
} {
  const bottom = Math.max(2, Math.min(4, capacity - 4));
  const remaining = capacity - bottom;
  const leftLeg = Math.ceil(remaining / 2);
  const rightLeg = remaining - leftLeg;
  return { leftLeg, bottom, rightLeg };
}

function imperialSegmentOf(
  index: number,
  segments: { leftLeg: number; bottom: number; rightLeg: number },
): 'left' | 'bottom' | 'right' {
  if (index < segments.leftLeg) {
    return 'left';
  }

  if (index < segments.leftLeg + segments.bottom) {
    return 'bottom';
  }

  return 'right';
}

function buildImperialTopology(capacity: number): TableSeatTopology {
  const segments = splitImperialSegments(capacity);
  const proximities: SeatProximity[] = [];
  const rightLegStart = segments.leftLeg + segments.bottom;

  for (let from = 0; from < capacity; from += 1) {
    for (let to = from + 1; to < capacity; to += 1) {
      const fromSegment = imperialSegmentOf(from, segments);
      const toSegment = imperialSegmentOf(to, segments);

      if (fromSegment === toSegment) {
        if (Math.abs(from - to) === 1) {
          addSymmetricPair(proximities, from, to, 'adyacente');
        } else {
          addSymmetricPair(proximities, from, to, 'mismo_lateral');
        }
        continue;
      }

      if (fromSegment === 'left' && toSegment === 'right') {
        const leftOffset = from;
        const rightOffset = to - rightLegStart;
        const mirroredRight = segments.rightLeg - 1 - rightOffset;
        if (leftOffset === mirroredRight) {
          addSymmetricPair(proximities, from, to, 'enfrente');
        }
      }
    }
  }

  return {
    shape: 'imperial',
    capacity,
    seats: buildSeatLabels(capacity),
    proximities,
  };
}

export function assertValidTopologyCapacity(
  shape: TableShape,
  capacity: number,
): void {
  const minCapacity = MIN_CAPACITY_BY_SHAPE[shape];

  if (
    !Number.isInteger(capacity) ||
    capacity < minCapacity ||
    capacity > MAX_CAPACITY
  ) {
    throw new BadRequestException({
      code: 'INVALID_TOPOLOGY_CAPACITY',
      message: `La capacidad para forma ${shape} debe ser un entero entre ${minCapacity} y ${MAX_CAPACITY}.`,
      details: { shape, capacity },
    });
  }
}

export function buildSeatTopology(
  shape: TableShape,
  capacity: number,
): TableSeatTopology {
  assertValidTopologyCapacity(shape, capacity);

  switch (shape) {
    case 'redonda':
    case 'ovalada':
      return buildCircularTopology(shape, capacity);
    case 'rectangular':
      return buildRectangularTopology(capacity);
    case 'imperial':
      return buildImperialTopology(capacity);
    default:
      throw new BadRequestException({
        code: 'INVALID_TABLE_SHAPE',
        message: 'Forma de mesa no soportada.',
        details: { shape },
      });
  }
}
