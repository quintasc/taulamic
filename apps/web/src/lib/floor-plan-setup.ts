export type RoomShape = 'rectangular' | 'round' | 'oval';

export type FloorPlanSetup = {
  shape: RoomShape;
  /** Rectangular y ovalada: ancho del salón (m). */
  widthM: number;
  /** Rectangular y ovalada: largo del salón (m). */
  lengthM: number;
  /** Redonda: radio (m). */
  radiusM: number;
  placedAccessories: string[];
};

const SETUP_KEY = 'taulamic:floorPlanSetup';

export const ROOM_SHAPE_OPTIONS: Array<{ id: RoomShape; label: string }> = [
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'round', label: 'Redonda' },
  { id: 'oval', label: 'Ovalada' },
];

export const FLOOR_PLAN_ACCESSORIES = [
  { id: 'mesa-presidencial', label: 'Mesa presidencial' },
  { id: 'pista-baile', label: 'Pista de baile' },
  { id: 'barra-bar', label: 'Barra bar' },
  { id: 'puerta', label: 'Puerta' },
  { id: 'servicio', label: 'Servicio' },
  { id: 'escenario', label: 'Escenario' },
  { id: 'entrada', label: 'Entrada principal' },
] as const;

/** Zona interior reservada a mesas (% del lienzo). Ajustada con `computeTableLayoutInsets`. */
export const TABLE_LAYOUT_ZONE = {
  topMin: 30,
  topMax: 66,
  leftMin: 26,
  leftMax: 74,
} as const;

export type TableLayoutInsets = {
  insetX: number;
  insetY: number;
  zone: {
    topMin: number;
    topMax: number;
    leftMin: number;
    leftMax: number;
  };
  clearance: number;
};

/** Márgenes del lienzo según densidad de mesas (evita desbordes hacia accesorios). */
export function computeTableLayoutInsets(
  tableCount: number,
  canvasRefPx = TABLE_LAYOUT_CANVAS_REF_PX,
): TableLayoutInsets {
  let insetX: number;
  let insetY: number;
  let clearance: number;

  if (tableCount <= 6) {
    insetX = 24;
    insetY = 26;
    clearance = 10;
  } else if (tableCount <= 12) {
    insetX = 24;
    insetY = 26;
    clearance = 11;
  } else if (tableCount <= 18) {
    insetX = 22;
    insetY = 24;
    clearance = 12;
  } else {
    insetX = 20;
    insetY = 22;
    clearance = 14;
  }

  const boost = canvasInsetBoost(canvasRefPx);
  insetX += boost;
  insetY += boost;
  clearance += boost > 0 ? 1 : 0;

  return {
    insetX,
    insetY,
    zone: {
      topMin: insetY,
      topMax: 100 - insetY,
      leftMin: insetX,
      leftMax: 100 - insetX,
    },
    clearance,
  };
}

const TABLE_MARKER_CELL_W_PX = { normal: 48, compact: 40 } as const;
const TABLE_MARKER_CELL_H_PX = { normal: 44, compact: 36 } as const;
const TABLE_GRID_GAP_PX = 2;

/** Tamaño de referencia del lienzo (px) para escala de mesas y accesorios. */
export const ROOM_CANVAS_CEILING_PX = 400;
export const ROOM_CANVAS_HANDLE_PADDING_PX = 28;
/** Margen en móvil sin marcador de redimensionar. */
export const ROOM_CANVAS_COMPACT_PADDING_PX = 8;
export const TABLE_LAYOUT_CANVAS_REF_PX = ROOM_CANVAS_CEILING_PX;

/** Ajusta el techo de escala del lienzo al ancho disponible del contenedor. */
export function resolveRoomCanvasMaxPx(
  setup: FloorPlanSetup,
  containerWidthPx: number,
  ceilingPx = ROOM_CANVAS_CEILING_PX,
): number {
  if (containerWidthPx <= 0) {
    return ceilingPx;
  }
  const budgetPx = Math.floor(Math.min(ceilingPx, containerWidthPx));
  const atCeiling = roomPixelSize(setup, ceilingPx);
  if (atCeiling.widthPx <= budgetPx) {
    return ceilingPx;
  }
  const scaledMaxPx = Math.floor((ceilingPx * budgetPx) / atCeiling.widthPx);
  return Math.max(160, scaledMaxPx);
}

function canvasInsetBoost(canvasRefPx: number): number {
  if (canvasRefPx < 300) {
    return 4;
  }
  if (canvasRefPx < 360) {
    return 2;
  }
  return 0;
}

export function computeTableGridColumns(tableCount: number): number {
  if (tableCount <= 1) {
    return 1;
  }
  if (tableCount <= 4) {
    return 2;
  }
  if (tableCount <= 9) {
    return 3;
  }
  if (tableCount <= 16) {
    return 4;
  }
  if (tableCount <= 25) {
    return 5;
  }
  return 6;
}

export function isCompactTableMarker(tableCount: number): boolean {
  return tableCount > 12;
}

export function computeTableGridNaturalSize(tableCount: number): {
  columns: number;
  compact: boolean;
  width: number;
  height: number;
} {
  const columns = computeTableGridColumns(tableCount);
  const rows = Math.ceil(Math.max(tableCount, 1) / columns);
  const compact = isCompactTableMarker(tableCount);
  const cellW = compact ? TABLE_MARKER_CELL_W_PX.compact : TABLE_MARKER_CELL_W_PX.normal;
  const cellH = compact ? TABLE_MARKER_CELL_H_PX.compact : TABLE_MARKER_CELL_H_PX.normal;
  return {
    columns,
    compact,
    width: columns * cellW + (columns - 1) * TABLE_GRID_GAP_PX,
    height: rows * cellH + (rows - 1) * TABLE_GRID_GAP_PX,
  };
}

export type TableGridLayout = {
  columns: number;
  compact: boolean;
  scale: number;
  naturalWidth: number;
  naturalHeight: number;
  scaledWidth: number;
  scaledHeight: number;
};

/** Escala la rejilla al hueco disponible (px reales de la zona de mesas). */
export function computeTableGridLayout(
  tableCount: number,
  zoneWidthPx: number,
  zoneHeightPx: number,
): TableGridLayout {
  const natural = computeTableGridNaturalSize(tableCount);
  if (tableCount <= 0 || zoneWidthPx <= 0 || zoneHeightPx <= 0) {
    return {
      columns: natural.columns,
      compact: natural.compact,
      scale: 1,
      naturalWidth: natural.width,
      naturalHeight: natural.height,
      scaledWidth: natural.width,
      scaledHeight: natural.height,
    };
  }

  const scale = Math.min(
    1,
    zoneWidthPx / natural.width,
    zoneHeightPx / natural.height,
  );

  return {
    columns: natural.columns,
    compact: natural.compact,
    scale,
    naturalWidth: natural.width,
    naturalHeight: natural.height,
    scaledWidth: natural.width * scale,
    scaledHeight: natural.height * scale,
  };
}

/** @deprecated Usar `computeTableGridLayout` con dimensiones reales de la zona. */
export function computeTableGridScale(
  tableCount: number,
  canvasRefPx = TABLE_LAYOUT_CANVAS_REF_PX,
): number {
  const { insetX, insetY } = computeTableLayoutInsets(tableCount, canvasRefPx);
  const zoneWidthPx = ((100 - insetX * 2) / 100) * canvasRefPx;
  const zoneHeightPx = ((100 - insetY * 2) / 100) * canvasRefPx;
  return computeTableGridLayout(tableCount, zoneWidthPx, zoneHeightPx).scale;
}

/** Posición por defecto en bandas periféricas (%). */
export const ACCESSORY_LAYOUT: Record<
  string,
  { top: string; left: string }
> = {
  'mesa-presidencial': { top: '8%', left: '50%' },
  entrada: { top: '8%', left: '68%' },
  'pista-baile': { top: '92%', left: '50%' },
  escenario: { top: '92%', left: '26%' },
  'barra-bar': { top: '92%', left: '74%' },
  servicio: { top: '50%', left: '6%' },
  puerta: { top: '50%', left: '94%' },
};

/** Posiciones alternativas (primera libre respecto a mesas y otros accesorios). */
export const ACCESSORY_LAYOUT_CANDIDATES: Record<
  string,
  Array<{ top: string; left: string }>
> = {
  'mesa-presidencial': [
    { top: '8%', left: '50%' },
    { top: '8%', left: '40%' },
    { top: '8%', left: '60%' },
    { top: '6%', left: '24%' },
    { top: '6%', left: '76%' },
  ],
  entrada: [
    { top: '8%', left: '68%' },
    { top: '8%', left: '74%' },
    { top: '8%', left: '62%' },
    { top: '6%', left: '82%' },
    { top: '6%', left: '18%' },
  ],
  'pista-baile': [
    { top: '92%', left: '50%' },
    { top: '92%', left: '40%' },
    { top: '92%', left: '60%' },
    { top: '94%', left: '24%' },
    { top: '94%', left: '76%' },
  ],
  escenario: [
    { top: '92%', left: '26%' },
    { top: '92%', left: '20%' },
    { top: '92%', left: '32%' },
    { top: '94%', left: '12%' },
  ],
  'barra-bar': [
    { top: '92%', left: '74%' },
    { top: '92%', left: '80%' },
    { top: '92%', left: '68%' },
    { top: '94%', left: '88%' },
  ],
  servicio: [
    { top: '50%', left: '6%' },
    { top: '50%', left: '5%' },
    { top: '38%', left: '6%' },
    { top: '62%', left: '6%' },
    { top: '28%', left: '5%' },
    { top: '72%', left: '5%' },
  ],
  puerta: [
    { top: '50%', left: '94%' },
    { top: '50%', left: '95%' },
    { top: '38%', left: '94%' },
    { top: '62%', left: '94%' },
    { top: '28%', left: '95%' },
    { top: '72%', left: '95%' },
  ],
};

const PERIPHERAL_FALLBACK_CANDIDATES: Array<{ top: string; left: string }> = [
  { top: '8%', left: '38%' },
  { top: '8%', left: '62%' },
  { top: '8%', left: '76%' },
  { top: '92%', left: '38%' },
  { top: '92%', left: '62%' },
  { top: '50%', left: '5%' },
  { top: '50%', left: '95%' },
  { top: '38%', left: '6%' },
  { top: '62%', left: '94%' },
];

/** Prioridad al repartir huecos (los primeros reservan su posición preferida). */
const ACCESSORY_PLACEMENT_PRIORITY = [
  'mesa-presidencial',
  'entrada',
  'pista-baile',
  'escenario',
  'barra-bar',
  'servicio',
  'puerta',
] as const;

const ACCESSORY_SLOT_MIN_SEPARATION_PCT = 14;
const ACCESSORY_SLOT_MIN_SEPARATION_LABELED_PCT = 22;

/** Huecos fijos en lienzo retrato (móvil): un accesorio por ranura, sin solaparse. */
export const PORTRAIT_FIXED_ACCESSORY_SLOTS: Array<{ top: string; left: string }> = [
  { top: '7%', left: '50%' },
  { top: '7%', left: '24%' },
  { top: '7%', left: '76%' },
  { top: '93%', left: '50%' },
  { top: '93%', left: '24%' },
  { top: '93%', left: '76%' },
  { top: '50%', left: '9%' },
  { top: '50%', left: '91%' },
];

const ELLIPSE_ACCESSORY_SLOT_COUNT = 8;
/** Radio relativo al centro (%) para iconos dentro de círculo/elipse. */
const ELLIPSE_ACCESSORY_RADIUS_PCT = 30;

/** Ranuras en el perímetro interior de círculo u óvalo (evita recorte por overflow). */
export function ellipseAccessorySlots(
  count = ELLIPSE_ACCESSORY_SLOT_COUNT,
  radiusPct = ELLIPSE_ACCESSORY_RADIUS_PCT,
): Array<{ top: string; left: string }> {
  const slots: Array<{ top: string; left: string }> = [];
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
    const left = 50 + radiusPct * Math.sin(angle);
    const top = 50 - radiusPct * Math.cos(angle);
    slots.push({
      top: `${top.toFixed(1)}%`,
      left: `${left.toFixed(1)}%`,
    });
  }
  return slots;
}

/** Ranuras fijas según forma del salón (móvil). */
export function fixedAccessorySlotsForShape(shape: RoomShape): Array<{ top: string; left: string }> {
  if (shape === 'round' || shape === 'oval') {
    return ellipseAccessorySlots();
  }
  return PORTRAIT_FIXED_ACCESSORY_SLOTS;
}

/** Huecos periféricos extra para lienzo alto (móvil retrato). */
const PORTRAIT_PERIPHERAL_CANDIDATES: Array<{ top: string; left: string }> = [
  { top: '6%', left: '18%' },
  { top: '6%', left: '36%' },
  { top: '6%', left: '50%' },
  { top: '6%', left: '64%' },
  { top: '6%', left: '82%' },
  { top: '94%', left: '18%' },
  { top: '94%', left: '36%' },
  { top: '94%', left: '50%' },
  { top: '94%', left: '64%' },
  { top: '94%', left: '82%' },
  { top: '22%', left: '5%' },
  { top: '50%', left: '4%' },
  { top: '78%', left: '5%' },
  { top: '22%', left: '96%' },
  { top: '50%', left: '96%' },
  { top: '78%', left: '96%' },
];

function parseLayoutPercent(value: string): number {
  return Number.parseFloat(value);
}

export function layoutInTableZone(layout: { top: string; left: string }): boolean {
  const top = parseLayoutPercent(layout.top);
  const left = parseLayoutPercent(layout.left);
  return (
    top > TABLE_LAYOUT_ZONE.topMin &&
    top < TABLE_LAYOUT_ZONE.topMax &&
    left > TABLE_LAYOUT_ZONE.leftMin &&
    left < TABLE_LAYOUT_ZONE.leftMax
  );
}

function isPeripheralSlot(layout: { top: string; left: string }): boolean {
  const top = parseLayoutPercent(layout.top);
  const left = parseLayoutPercent(layout.left);
  return top <= 12 || top >= 88 || left <= 12 || left >= 88;
}

function layoutTooCloseToTableZone(
  layout: { top: string; left: string },
  layoutInsets: TableLayoutInsets,
): boolean {
  if (isPeripheralSlot(layout)) {
    return false;
  }
  const top = parseLayoutPercent(layout.top);
  const left = parseLayoutPercent(layout.left);
  const pad = layoutInsets.clearance;
  const { topMin, topMax, leftMin, leftMax } = layoutInsets.zone;
  return (
    top >= topMin - pad &&
    top <= topMax + pad &&
    left >= leftMin - pad &&
    left <= leftMax + pad
  );
}

function accessorySlotsOverlap(
  a: { top: string; left: string },
  b: { top: string; left: string },
  minSeparationPct: number,
): boolean {
  const topDelta = Math.abs(parseLayoutPercent(a.top) - parseLayoutPercent(b.top));
  const leftDelta = Math.abs(
    parseLayoutPercent(a.left) - parseLayoutPercent(b.left),
  );
  return (
    topDelta < minSeparationPct &&
    leftDelta < minSeparationPct
  );
}

function layoutSlotBlocked(
  candidate: { top: string; left: string },
  occupied: Array<{ top: string; left: string }>,
  layoutInsets: TableLayoutInsets,
  minSeparationPct: number,
): boolean {
  if (!isPeripheralSlot(candidate)) {
    return true;
  }
  if (layoutTooCloseToTableZone(candidate, layoutInsets)) {
    return true;
  }
  return occupied.some((taken) =>
    accessorySlotsOverlap(candidate, taken, minSeparationPct),
  );
}

function accessoryLayoutCandidates(id: string): Array<{ top: string; left: string }> {
  const preferred =
    ACCESSORY_LAYOUT_CANDIDATES[id] ?? [
      ACCESSORY_LAYOUT[id] ?? { top: '12%', left: '50%' },
    ];
  const merged = [...preferred];
  for (const slot of PERIPHERAL_FALLBACK_CANDIDATES) {
    if (
      !merged.some(
        (item) => item.top === slot.top && item.left === slot.left,
      )
    ) {
      merged.push(slot);
    }
  }
  return merged;
}

export function parseDimensionInput(raw: string, fallback: number): number {
  const normalized = raw.trim().replace(',', '.');
  if (!normalized) {
    return fallback;
  }
  return clampDimension(Number.parseFloat(normalized), fallback);
}

/** Asigna posición por accesorio evitando solapamientos con mesas y entre sí. */
export function resolveAccessoryLayouts(
  placedIds: string[],
  tableCount = 0,
  canvasRefPx = TABLE_LAYOUT_CANVAS_REF_PX,
  options: {
    labeled?: boolean;
    portraitCanvas?: boolean;
    /** Móvil: ranuras fijas perimetrales (sin solapamiento). */
    portraitFixedSlots?: boolean;
    roomShape?: RoomShape;
  } = {},
): Record<string, { top: string; left: string }> {
  const ordered = [...placedIds].sort((a, b) => {
    const rank = (id: string) => {
      const index = ACCESSORY_PLACEMENT_PRIORITY.indexOf(
        id as (typeof ACCESSORY_PLACEMENT_PRIORITY)[number],
      );
      return index === -1 ? ACCESSORY_PLACEMENT_PRIORITY.length : index;
    };
    return rank(a) - rank(b);
  });

  if (options.portraitFixedSlots || options.roomShape === 'round' || options.roomShape === 'oval') {
    const slotPool = fixedAccessorySlotsForShape(options.roomShape ?? 'rectangular');
    const layouts: Record<string, { top: string; left: string }> = {};
    ordered.forEach((id, index) => {
      layouts[id] = slotPool[index] ?? slotPool[slotPool.length - 1];
    });
    return layouts;
  }

  const minSeparationPct = options.labeled
    ? ACCESSORY_SLOT_MIN_SEPARATION_LABELED_PCT
    : ACCESSORY_SLOT_MIN_SEPARATION_PCT;
  const layoutInsets = computeTableLayoutInsets(tableCount, canvasRefPx);
  const fallbackPool = options.portraitCanvas
    ? [...PORTRAIT_PERIPHERAL_CANDIDATES, ...PERIPHERAL_FALLBACK_CANDIDATES]
    : PERIPHERAL_FALLBACK_CANDIDATES;
  const occupied: Array<{ top: string; left: string }> = [];
  const layouts: Record<string, { top: string; left: string }> = {};

  for (const id of ordered) {
    const candidates = accessoryLayoutCandidates(id).filter(isPeripheralSlot);
    const slot =
      candidates.find(
        (candidate) =>
          !layoutSlotBlocked(candidate, occupied, layoutInsets, minSeparationPct),
      ) ??
      fallbackPool.find(
        (candidate) =>
          !layoutSlotBlocked(candidate, occupied, layoutInsets, minSeparationPct),
      ) ??
      candidates.find(
        (candidate) => !layoutTooCloseToTableZone(candidate, layoutInsets),
      ) ??
      candidates[0] ??
      fallbackPool[0];

    layouts[id] = slot;
    occupied.push(slot);
  }

  return layouts;
}

export const DEFAULT_FLOOR_PLAN_SETUP: FloorPlanSetup = {
  shape: 'rectangular',
  widthM: 25,
  lengthM: 15,
  radiusM: 12,
  placedAccessories: [],
};

export const MIN_DIMENSION_M = 3;
export const MAX_DIMENSION_M = 200;
export const DIMENSION_STEP_M = 1;

export type RoomFitMeterLimits = {
  minWidthM: number;
  maxWidthM: number;
  minLengthM: number;
  maxLengthM: number;
  minRadiusM: number;
  maxRadiusM: number;
};

export type RoomCanvasBounds = {
  maxWidthPx: number;
  maxHeightPx: number;
};

function roomFitAvailPx(
  bounds: RoomCanvasBounds,
  edgePaddingPx: number,
): { availW: number; availH: number } {
  const pad = edgePaddingPx;
  return {
    availW: Math.max(96, bounds.maxWidthPx - pad * 2),
    availH: Math.max(128, bounds.maxHeightPx - pad * 2),
  };
}

/** Máximos en metros para que el salón quepa en el lienzo sin reducir escala. */
export function computeRoomFitMeterLimits(
  setup: FloorPlanSetup,
  bounds: RoomCanvasBounds,
  options: Pick<RoomCanvasFitOptions, 'portraitLayout' | 'edgePaddingPx'> = {},
): RoomFitMeterLimits {
  const { availW, availH } = roomFitAvailPx(
    bounds,
    options.edgePaddingPx ?? ROOM_CANVAS_HANDLE_PADDING_PX,
  );

  const base = {
    minWidthM: MIN_DIMENSION_M,
    minLengthM: MIN_DIMENSION_M,
    minRadiusM: MIN_DIMENSION_M,
    maxRadiusM: MAX_DIMENSION_M,
  };

  if (setup.shape === 'round') {
    return {
      ...base,
      maxWidthM: MAX_DIMENSION_M,
      maxLengthM: MAX_DIMENSION_M,
      maxRadiusM: MAX_DIMENSION_M,
    };
  }

  const portraitDisplay = Boolean(
    options.portraitLayout &&
      setup.shape !== 'oval' &&
      setup.widthM > setup.lengthM,
  );

  const alongX = Math.max(
    MIN_DIMENSION_M,
    portraitDisplay ? setup.lengthM : setup.widthM,
  );
  const alongY = Math.max(
    MIN_DIMENSION_M,
    portraitDisplay ? setup.widthM : setup.lengthM,
  );

  const maxAlongY = Math.min(
    MAX_DIMENSION_M,
    clampDimension((availH * alongX) / availW, MAX_DIMENSION_M),
  );
  const maxAlongX = Math.min(
    MAX_DIMENSION_M,
    clampDimension((availW * alongY) / availH, MAX_DIMENSION_M),
  );

  if (portraitDisplay) {
    return {
      ...base,
      maxWidthM: maxAlongY,
      maxLengthM: maxAlongX,
    };
  }

  return {
    ...base,
    maxWidthM: maxAlongX,
    maxLengthM: maxAlongY,
  };
}

export function clampSetupToFitLimits(
  setup: FloorPlanSetup,
  bounds: RoomCanvasBounds,
  options: Pick<RoomCanvasFitOptions, 'portraitLayout' | 'edgePaddingPx'> = {},
): FloorPlanSetup {
  const normalized = normalizeSetupForShape(setup);
  const limits = computeRoomFitMeterLimits(normalized, bounds, options);
  return {
    ...normalized,
    widthM: clampDimension(
      normalized.widthM,
      normalized.widthM,
      limits.minWidthM,
      limits.maxWidthM,
    ),
    lengthM: clampDimension(
      normalized.lengthM,
      normalized.lengthM,
      limits.minLengthM,
      limits.maxLengthM,
    ),
    radiusM: clampDimension(
      normalized.radiusM,
      normalized.radiusM,
      limits.minRadiusM,
      limits.maxRadiusM,
    ),
  };
}

export function setupFromRecommendation(
  shape: RoomShape,
  rec: {
    suggestedWidthM: number;
    suggestedLengthM: number;
    suggestedRadiusM?: number;
  },
  placedAccessories: string[] = [],
): FloorPlanSetup {
  return normalizeSetupForShape({
    shape,
    widthM: rec.suggestedWidthM,
    lengthM: rec.suggestedLengthM,
    radiusM: rec.suggestedRadiusM ?? DEFAULT_FLOOR_PLAN_SETUP.radiusM,
    placedAccessories,
  });
}

export function formatDimensionLimitsLabel(): string {
  return `Cada medida admite entre ${MIN_DIMENSION_M} m y ${MAX_DIMENSION_M} m.`;
}

export function isRoomAtMaxWidth(setup: FloorPlanSetup): boolean {
  if (setup.shape === 'round') {
    return setup.radiusM >= MAX_DIMENSION_M;
  }
  return setup.widthM >= MAX_DIMENSION_M;
}

export function isRoomAtMaxLength(setup: FloorPlanSetup): boolean {
  if (setup.shape === 'round') {
    return setup.radiusM >= MAX_DIMENSION_M;
  }
  return setup.lengthM >= MAX_DIMENSION_M;
}

function applyResizeOverflowAtMax(
  widthM: number,
  lengthM: number,
  deltaW: number,
  deltaH: number,
): { widthM: number; lengthM: number } {
  let w = widthM + deltaW;
  let l = lengthM + deltaH;

  if (widthM >= MAX_DIMENSION_M && deltaW > 0) {
    w = MAX_DIMENSION_M;
    l -= deltaW;
  } else if (w > MAX_DIMENSION_M) {
    const overflow = w - MAX_DIMENSION_M;
    w = MAX_DIMENSION_M;
    l -= overflow;
  }

  if (lengthM >= MAX_DIMENSION_M && deltaH > 0) {
    l = MAX_DIMENSION_M;
    w -= deltaH;
  } else if (l > MAX_DIMENSION_M) {
    const overflow = l - MAX_DIMENSION_M;
    l = MAX_DIMENSION_M;
    w -= overflow;
  }

  return {
    widthM: clampDimension(w, widthM),
    lengthM: clampDimension(l, lengthM),
  };
}

export function formatRoomShapeLabel(shape: RoomShape): string {
  return ROOM_SHAPE_OPTIONS.find((option) => option.id === shape)?.label ?? shape;
}

export function formatRoomDimensions(setup: FloorPlanSetup): string {
  switch (setup.shape) {
    case 'round':
      return `Radio ${setup.radiusM} m · ${formatRoomShapeLabel(setup.shape)}`;
    case 'oval':
      return `${setup.widthM} m × ${setup.lengthM} m · ${formatRoomShapeLabel(setup.shape)}`;
    default:
      return `${setup.widthM} m × ${setup.lengthM} m · ${formatRoomShapeLabel(setup.shape)}`;
  }
}

function migrateLegacySetup(parsed: Partial<FloorPlanSetup & { shape?: string }>): FloorPlanSetup {
  let shape = parsed.shape as RoomShape | 'square' | undefined;
  if (shape === 'square') {
    shape = 'rectangular';
  }
  if (shape !== 'rectangular' && shape !== 'round' && shape !== 'oval') {
    shape = DEFAULT_FLOOR_PLAN_SETUP.shape;
  }

  const widthM = parsed.widthM ?? DEFAULT_FLOOR_PLAN_SETUP.widthM;
  const lengthM = parsed.lengthM ?? DEFAULT_FLOOR_PLAN_SETUP.lengthM;
  const radiusM =
    parsed.radiusM ??
    (shape === 'round'
      ? Math.round(Math.max(widthM, lengthM) / 2)
      : DEFAULT_FLOOR_PLAN_SETUP.radiusM);

  const placedAccessories = (parsed.placedAccessories ?? []).map((id) =>
    id === 'mesa-novios' ? 'mesa-presidencial' : id,
  );

  return normalizeSetupForShape({
    shape,
    widthM,
    lengthM,
    radiusM,
    placedAccessories,
  });
}

export function loadFloorPlanSetup(eventId: string): FloorPlanSetup {
  if (typeof window === 'undefined') {
    return DEFAULT_FLOOR_PLAN_SETUP;
  }
  const raw = localStorage.getItem(`${SETUP_KEY}:${eventId}`);
  if (!raw) {
    return DEFAULT_FLOOR_PLAN_SETUP;
  }
  try {
    return migrateLegacySetup(JSON.parse(raw) as Partial<FloorPlanSetup>);
  } catch {
    return DEFAULT_FLOOR_PLAN_SETUP;
  }
}

/** `true` si el organizador guardó forma/medidas en este dispositivo (Fase A). */
export function hasFloorPlanSetupSaved(eventId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(`${SETUP_KEY}:${eventId}`) !== null;
}

export function saveFloorPlanSetup(eventId: string, setup: FloorPlanSetup) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(`${SETUP_KEY}:${eventId}`, JSON.stringify(setup));
}

export function clampDimension(
  value: number,
  fallback: number,
  min = MIN_DIMENSION_M,
  max = MAX_DIMENSION_M,
): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  const clamped = Math.min(max, Math.max(min, value));
  return Math.round(clamped * 10) / 10;
}

export function normalizeSetupForShape(setup: FloorPlanSetup): FloorPlanSetup {
  const widthM = clampDimension(setup.widthM, DEFAULT_FLOOR_PLAN_SETUP.widthM);
  const lengthM = clampDimension(setup.lengthM, DEFAULT_FLOOR_PLAN_SETUP.lengthM);
  const radiusM = clampDimension(setup.radiusM, DEFAULT_FLOOR_PLAN_SETUP.radiusM);

  return { ...setup, widthM, lengthM, radiusM };
}

export function applyShapeChange(
  current: FloorPlanSetup,
  shape: RoomShape,
): FloorPlanSetup {
  if (shape === current.shape) {
    return current;
  }

  if (shape === 'round') {
    const radiusM = clampDimension(
      Math.max(current.widthM, current.lengthM) / 2,
      current.radiusM,
    );
    return normalizeSetupForShape({ ...current, shape, radiusM });
  }

  if (current.shape === 'round') {
    return normalizeSetupForShape({
      ...current,
      shape,
      widthM: current.radiusM * 2,
      lengthM: Math.round(current.radiusM * 1.6),
    });
  }

  return normalizeSetupForShape({ ...current, shape });
}

/** Diámetro en px para salón redondo según radio (m). */
function roundDiameterPx(radiusM: number, maxPx = 400): number {
  const minDiameterPx = 120;
  const maxDiameterPx = maxPx;
  const clampedRadius = clampDimension(radiusM, DEFAULT_FLOOR_PLAN_SETUP.radiusM);
  const span = MAX_DIMENSION_M - MIN_DIMENSION_M;
  const t = span > 0 ? (clampedRadius - MIN_DIMENSION_M) / span : 0;
  return minDiameterPx + t * (maxDiameterPx - minDiameterPx);
}

/** Referencia de escala (m) para el lienzo; media de ejes. */
export function roomDisplayRefSideM(setup: FloorPlanSetup): number {
  return (setup.widthM + setup.lengthM) / 2;
}

/** Tamaño en px del lienzo con escala uniforme (mismo m/px en ancho y largo). */
export function roomPixelSize(
  setup: FloorPlanSetup,
  maxPx = 400,
  /** Congelar en pointerdown para que solo cambie el eje arrastrado. */
  refSideM?: number,
): {
  widthPx: number;
  heightPx: number;
  metersPerPx: number;
} {
  if (setup.shape === 'round') {
    const diameterPx = roundDiameterPx(setup.radiusM, maxPx);
    const metersPerPx = (setup.radiusM * 2) / diameterPx;
    return { widthPx: diameterPx, heightPx: diameterPx, metersPerPx };
  }

  const refM = refSideM ?? roomDisplayRefSideM(setup);
  const pxPerMeter = maxPx / refM;
  const widthPx = setup.widthM * pxPerMeter;
  const heightPx = setup.lengthM * pxPerMeter;

  const metersPerPx = setup.widthM / widthPx;
  return { widthPx, heightPx, metersPerPx };
}

export type RoomCanvasFitOptions = {
  /** Eje largo del salón en vertical (móvil). */
  portraitLayout?: boolean;
  /** @deprecated Usar `frozenPxPerMeter`. */
  refSideM?: number;
  /** Escala fija (px/m) durante arrastre; congela al iniciar el gesto. */
  frozenPxPerMeter?: number;
  /** Margen interior al calcular escala (menor en móvil sin marcador). */
  edgePaddingPx?: number;
};

function roomCanvasDimAlongAxes(
  setup: FloorPlanSetup,
  portraitLayout: boolean,
): { alongX: number; alongY: number } {
  if (setup.shape === 'round') {
    const d = setup.radiusM * 2;
    return { alongX: d, alongY: d };
  }
  if (
    portraitLayout &&
    setup.shape !== 'oval' &&
    setup.widthM > setup.lengthM
  ) {
    return { alongX: setup.lengthM, alongY: setup.widthM };
  }
  return { alongX: setup.widthM, alongY: setup.lengthM };
}

/**
 * Escala el salón para caber en el rectángulo disponible (ancho y alto),
 * con margen para el marcador de redimensionado.
 */
export function roomPixelSizeFit(
  setup: FloorPlanSetup,
  bounds: { maxWidthPx: number; maxHeightPx: number },
  options: RoomCanvasFitOptions = {},
): {
  widthPx: number;
  heightPx: number;
  metersPerPx: number;
  portraitDisplay: boolean;
} {
  const pad = options.edgePaddingPx ?? ROOM_CANVAS_HANDLE_PADDING_PX;
  const availW = Math.max(96, bounds.maxWidthPx - pad * 2);
  const availH = Math.max(128, bounds.maxHeightPx - pad * 2);

  if (setup.shape === 'round') {
    if (options.frozenPxPerMeter !== undefined) {
      const diameterPx = Math.max(
        120,
        Math.round(setup.radiusM * 2 * options.frozenPxPerMeter),
      );
      return {
        widthPx: diameterPx,
        heightPx: diameterPx,
        metersPerPx: (setup.radiusM * 2) / diameterPx,
        portraitDisplay: false,
      };
    }
    const budget = Math.min(availW, availH);
    const diameterPx = Math.max(
      120,
      Math.min(budget, roundDiameterPx(setup.radiusM, budget)),
    );
    return {
      widthPx: diameterPx,
      heightPx: diameterPx,
      metersPerPx: (setup.radiusM * 2) / diameterPx,
      portraitDisplay: false,
    };
  }

  let portraitDisplay = false;
  let { alongX, alongY } = roomCanvasDimAlongAxes(
    setup,
    options.portraitLayout ?? false,
  );
  if (
    options.portraitLayout &&
    setup.shape !== 'oval' &&
    setup.widthM > setup.lengthM
  ) {
    portraitDisplay = true;
  }

  if (options.frozenPxPerMeter !== undefined) {
    const ppm = options.frozenPxPerMeter;
    const widthPx = Math.max(96, Math.round(alongX * ppm));
    const heightPx = Math.max(128, Math.round(alongY * ppm));
    return {
      widthPx,
      heightPx,
      metersPerPx: alongX / widthPx,
      portraitDisplay,
    };
  }

  // Ancho primero: llena el ancho disponible; solo reduce escala si el alto desborda.
  let pxPerMeter = availW / alongX;
  let widthPx = Math.max(96, Math.round(alongX * pxPerMeter));
  let heightPx = Math.max(128, Math.round(alongY * pxPerMeter));
  if (heightPx > availH) {
    pxPerMeter = availH / alongY;
    widthPx = Math.max(96, Math.round(alongX * pxPerMeter));
    heightPx = Math.max(128, Math.round(alongY * pxPerMeter));
  }

  return {
    widthPx,
    heightPx,
    metersPerPx: alongX / widthPx,
    portraitDisplay,
  };
}

/** Umbral: por debajo se considera arrastre solo horizontal o solo vertical. */
const RESIZE_AXIS_RATIO = 0.35;
export const RESIZE_DRAG_THRESHOLD_PX = 4;

export type RoomResizeAxis = 'horizontal' | 'vertical' | 'diagonal';

export function resolveRoomResizeAxis(
  totalDxPx: number,
  totalDyPx: number,
): RoomResizeAxis {
  const absDx = Math.abs(totalDxPx);
  const absDy = Math.abs(totalDyPx);

  if (
    absDx >= RESIZE_DRAG_THRESHOLD_PX &&
    absDy >= RESIZE_DRAG_THRESHOLD_PX &&
    absDx >= absDy * RESIZE_AXIS_RATIO &&
    absDy >= absDx * RESIZE_AXIS_RATIO
  ) {
    return 'diagonal';
  }

  if (absDx < absDy * RESIZE_AXIS_RATIO) {
    return 'vertical';
  }
  if (absDy < absDx * RESIZE_AXIS_RATIO) {
    return 'horizontal';
  }
  return 'diagonal';
}

/** Redimensiona desde el tamaño inicial del gesto (evita deriva entre frames). */
export function patchFromDragResize(
  startSetup: FloorPlanSetup,
  startWidthPx: number,
  startHeightPx: number,
  totalDxPx: number,
  totalDyPx: number,
  axis: RoomResizeAxis,
  portraitDisplay = false,
): Partial<FloorPlanSetup> {
  if (startSetup.shape === 'round') {
    const metersPerPx = (startSetup.radiusM * 2) / startWidthPx;
    const deltaRadius = ((totalDxPx + totalDyPx) / 2) * metersPerPx * 0.5;
    return {
      radiusM: clampDimension(
        startSetup.radiusM + deltaRadius,
        startSetup.radiusM,
      ),
    };
  }

  if (startWidthPx <= 0 || startHeightPx <= 0) {
    return {};
  }

  if (portraitDisplay) {
    const metersPerPxX = startSetup.lengthM / startWidthPx;
    const metersPerPxY = startSetup.widthM / startHeightPx;

    if (axis === 'horizontal') {
      return {
        lengthM: clampDimension(
          startSetup.lengthM + totalDxPx * metersPerPxX,
          startSetup.lengthM,
        ),
      };
    }

    if (axis === 'vertical') {
      return {
        widthM: clampDimension(
          startSetup.widthM + totalDyPx * metersPerPxY,
          startSetup.widthM,
        ),
      };
    }

    return {
      lengthM: clampDimension(
        startSetup.lengthM + totalDxPx * metersPerPxX,
        startSetup.lengthM,
      ),
      widthM: clampDimension(
        startSetup.widthM + totalDyPx * metersPerPxY,
        startSetup.widthM,
      ),
    };
  }

  const metersPerPxX = startSetup.widthM / startWidthPx;
  const metersPerPxY = startSetup.lengthM / startHeightPx;

  if (axis === 'horizontal') {
    const { widthM, lengthM } = applyResizeOverflowAtMax(
      startSetup.widthM,
      startSetup.lengthM,
      totalDxPx * metersPerPxX,
      0,
    );
    return { widthM, lengthM };
  }

  if (axis === 'vertical') {
    const { widthM, lengthM } = applyResizeOverflowAtMax(
      startSetup.widthM,
      startSetup.lengthM,
      0,
      totalDyPx * metersPerPxY,
    );
    return { widthM, lengthM };
  }

  const { widthM, lengthM } = applyResizeOverflowAtMax(
    startSetup.widthM,
    startSetup.lengthM,
    totalDxPx * metersPerPxX,
    totalDyPx * metersPerPxY,
  );
  return { widthM, lengthM };
}

export function patchFromPixelResize(
  setup: FloorPlanSetup,
  deltaWidthPx: number,
  deltaHeightPx: number,
  widthPx: number,
  heightPx: number,
): Partial<FloorPlanSetup> {
  if (setup.shape === 'round') {
    const metersPerPx = (setup.radiusM * 2) / widthPx;
    const deltaDiameter = ((deltaWidthPx + deltaHeightPx) / 2) * metersPerPx;
    return {
      radiusM: clampDimension(setup.radiusM + deltaDiameter / 2, setup.radiusM),
    };
  }

  if (widthPx <= 0 || heightPx <= 0) {
    return {};
  }

  const metersPerPxX = setup.widthM / widthPx;
  const metersPerPxY = setup.lengthM / heightPx;
  const absDx = Math.abs(deltaWidthPx);
  const absDy = Math.abs(deltaHeightPx);

  if (absDx < absDy * RESIZE_AXIS_RATIO) {
    const { widthM, lengthM } = applyResizeOverflowAtMax(
      setup.widthM,
      setup.lengthM,
      0,
      deltaHeightPx * metersPerPxY,
    );
    return { widthM, lengthM };
  }

  if (absDy < absDx * RESIZE_AXIS_RATIO) {
    const { widthM, lengthM } = applyResizeOverflowAtMax(
      setup.widthM,
      setup.lengthM,
      deltaWidthPx * metersPerPxX,
      0,
    );
    return { widthM, lengthM };
  }

  const { widthM, lengthM } = applyResizeOverflowAtMax(
    setup.widthM,
    setup.lengthM,
    deltaWidthPx * metersPerPxX,
    deltaHeightPx * metersPerPxY,
  );
  return { widthM, lengthM };
}
