export type SeatProximityKind = 'adyacente' | 'enfrente' | 'mismo_lateral';

export type SeatProximity = {
  from: number;
  to: number;
  kind: SeatProximityKind;
};

function circularDistance(a: number, b: number, capacity: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, capacity - diff);
}

function addSymmetricPair(
  pairs: SeatProximity[],
  from: number,
  to: number,
  kind: SeatProximityKind,
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

function buildCircularProximities(capacity: number): SeatProximity[] {
  const proximities: SeatProximity[] = [];
  for (let from = 0; from < capacity; from += 1) {
    for (let to = from + 1; to < capacity; to += 1) {
      const distance = circularDistance(from, to, capacity);
      if (distance === 1) {
        addSymmetricPair(proximities, from, to, 'adyacente');
      } else if (capacity % 2 === 0 && distance === capacity / 2) {
        addSymmetricPair(proximities, from, to, 'enfrente');
      } else if (distance === 2) {
        addSymmetricPair(proximities, from, to, 'mismo_lateral');
      }
    }
  }
  return proximities;
}

function splitRectangularSides(capacity: number): { sideA: number; sideB: number } {
  const sideA = Math.ceil(capacity / 2);
  return { sideA, sideB: capacity - sideA };
}

function isOnSideA(index: number, sideA: number): boolean {
  return index < sideA;
}

function buildRectangularProximities(capacity: number): SeatProximity[] {
  const { sideA } = splitRectangularSides(capacity);
  const proximities: SeatProximity[] = [];

  for (let from = 0; from < capacity; from += 1) {
    for (let to = from + 1; to < capacity; to += 1) {
      const sameSide = isOnSideA(from, sideA) === isOnSideA(to, sideA);
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

  return proximities;
}

function splitImperialSegments(capacity: number): {
  leftLeg: number;
  bottom: number;
  rightLeg: number;
} {
  const bottom = Math.max(2, Math.min(4, capacity - 4));
  const remaining = capacity - bottom;
  const leftLeg = Math.ceil(remaining / 2);
  return { leftLeg, bottom, rightLeg: remaining - leftLeg };
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

function buildImperialProximities(capacity: number): SeatProximity[] {
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

  return proximities;
}

export function normalizeTableShape(shape: string): string {
  const normalized = shape.trim().toLowerCase();
  if (normalized === 'oval') {
    return 'ovalada';
  }
  return normalized;
}

export function buildSeatProximities(
  shape: string,
  capacity: number,
): SeatProximity[] {
  if (capacity < 2) {
    return [];
  }

  const normalized = normalizeTableShape(shape);
  if (normalized === 'redonda' || normalized === 'ovalada') {
    return buildCircularProximities(capacity);
  }
  if (normalized === 'rectangular') {
    return buildRectangularProximities(capacity);
  }
  if (normalized === 'imperial') {
    return buildImperialProximities(capacity);
  }
  return buildCircularProximities(capacity);
}

export function parseChairIndex(chairId: string): number | null {
  if (!chairId.startsWith('S')) {
    return null;
  }
  const index = Number.parseInt(chairId.slice(1), 10);
  if (!Number.isFinite(index) || index < 1) {
    return null;
  }
  return index - 1;
}

export function areChairsAdjacent(
  chairA: string,
  chairB: string,
  shape: string,
  capacity: number,
): boolean {
  const indexA = parseChairIndex(chairA);
  const indexB = parseChairIndex(chairB);
  if (indexA === null || indexB === null) {
    return false;
  }

  const proximities = buildSeatProximities(shape, capacity);
  return proximities.some(
    (proximity) =>
      proximity.kind === 'adyacente' &&
      ((proximity.from === indexA && proximity.to === indexB) ||
        (proximity.from === indexB && proximity.to === indexA)),
  );
}
