/** Misma geometría que `TableShapePreview` (pantalla Mesas), con margen para etiquetas. */
export const TABLE_DIAGRAM = {
  width: 360,
  height: 340,
  /** viewBox ampliado para nombres fuera del perímetro sin recortes. */
  viewBox: '-72 -52 388 340',
  cx: 122,
  cy: 118,
  tableR: 58,
  seatOffset: 14,
  /** Distancia extra del centro de la silla al nombre (evita solaparse). */
  nameGap: 40,
  seatRadius: 11,
} as const;

export type DiagramSeatPosition = {
  index: number;
  label: string;
  seatX: number;
  seatY: number;
  nameX: number;
  nameY: number;
  textAnchor: 'start' | 'middle' | 'end';
};

function normalizeShape(shape: string): string {
  const value = shape.trim().toLowerCase();
  if (value === 'oval') {
    return 'ovalada';
  }
  return value;
}

function seatAndName(
  cx: number,
  cy: number,
  angle: number,
  distance: number,
  nameDistance: number,
): Pick<DiagramSeatPosition, 'seatX' | 'seatY' | 'nameX' | 'nameY' | 'textAnchor'> {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const seatX = cx + distance * cos;
  const seatY = cy + distance * sin;
  const nameX = cx + nameDistance * cos;
  const nameY = cy + nameDistance * sin;
  const textAnchor =
    cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
  return { seatX, seatY, nameX, nameY, textAnchor };
}

export function getDiagramSeatPositions(
  shape: string,
  capacity: number,
): DiagramSeatPosition[] {
  const normalized = normalizeShape(shape);
  const {
    cx,
    cy,
    tableR,
    seatOffset,
    nameGap,
  } = TABLE_DIAGRAM;
  const seatDistance = tableR + seatOffset;
  const nameDistance = seatDistance + nameGap;

  if (normalized === 'rectangular') {
    const top = Math.ceil(capacity / 2);
    const bot = capacity - top;
    const tableW = 156;
    const tableH = 108;
    const left = cx - tableW / 2;
    const positions: DiagramSeatPosition[] = [];

    for (let i = 0; i < top; i += 1) {
      const x =
        top === 1 ? cx : left + 22 + (tableW - 44) * (i / Math.max(top - 1, 1));
      positions.push({
        index: i,
        label: `S${i + 1}`,
        seatX: x,
        seatY: cy - tableH / 2 - seatOffset,
        nameX: x,
        nameY: cy - tableH / 2 - seatOffset - nameGap,
        textAnchor: 'middle',
      });
    }

    for (let i = 0; i < bot; i += 1) {
      const x =
        bot === 1 ? cx : left + 22 + (tableW - 44) * (i / Math.max(bot - 1, 1));
      const index = top + i;
      positions.push({
        index,
        label: `S${index + 1}`,
        seatX: x,
        seatY: cy + tableH / 2 + seatOffset,
        nameX: x,
        nameY: cy + tableH / 2 + seatOffset + nameGap,
        textAnchor: 'middle',
      });
    }

    return positions;
  }

  if (normalized === 'ovalada') {
    const rx = 86;
    const ry = 50;
    return Array.from({ length: capacity }, (_, index) => {
      const angle = (index / capacity) * Math.PI * 2 - Math.PI / 2;
      const dist = Math.hypot(rx * Math.cos(angle), ry * Math.sin(angle));
      const nx = (rx * Math.cos(angle)) / dist;
      const ny = (ry * Math.sin(angle)) / dist;
      const seatX = cx + (dist + seatOffset) * nx;
      const seatY = cy + (dist + seatOffset) * ny;
      const nameX = cx + (dist + seatOffset + nameGap) * nx;
      const nameY = cy + (dist + seatOffset + nameGap) * ny;
      const textAnchor =
        nx > 0.25 ? 'start' : nx < -0.25 ? 'end' : 'middle';
      return {
        index,
        label: `S${index + 1}`,
        seatX,
        seatY,
        nameX,
        nameY,
        textAnchor,
      };
    });
  }

  return Array.from({ length: capacity }, (_, index) => {
    const angle = (index / capacity) * Math.PI * 2 - Math.PI / 2;
    return {
      index,
      label: `S${index + 1}`,
      ...seatAndName(cx, cy, angle, seatDistance, nameDistance),
    };
  });
}

export function getDiagramNameLabelBox(
  seat: DiagramSeatPosition,
  width: number,
): {
  x: number;
  y: number;
  width: number;
  height: number;
  align: 'left' | 'center' | 'right';
} {
  const height = 16;
  if (seat.textAnchor === 'start') {
    return {
      x: seat.nameX + 5,
      y: seat.nameY - height / 2,
      width,
      height,
      align: 'left',
    };
  }
  if (seat.textAnchor === 'end') {
    return {
      x: seat.nameX - width - 5,
      y: seat.nameY - height / 2,
      width,
      height,
      align: 'right',
    };
  }
  return {
    x: seat.nameX - width / 2,
    y: seat.nameY - height / 2,
    width,
    height,
    align: 'center',
  };
}

export function diagramEdgePoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  inset: number,
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return from;
  }
  return {
    x: from.x + (dx / length) * inset,
    y: from.y + (dy / length) * inset,
  };
}
