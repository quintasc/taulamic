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
    { top: '8%', left: '44%' },
    { top: '8%', left: '56%' },
  ],
  entrada: [
    { top: '8%', left: '68%' },
    { top: '8%', left: '74%' },
    { top: '8%', left: '62%' },
  ],
  'pista-baile': [
    { top: '92%', left: '50%' },
    { top: '92%', left: '44%' },
    { top: '92%', left: '56%' },
  ],
  escenario: [
    { top: '92%', left: '26%' },
    { top: '92%', left: '20%' },
    { top: '92%', left: '32%' },
  ],
  'barra-bar': [
    { top: '92%', left: '74%' },
    { top: '92%', left: '80%' },
    { top: '92%', left: '68%' },
  ],
  servicio: [
    { top: '50%', left: '6%' },
    { top: '50%', left: '5%' },
    { top: '38%', left: '6%' },
    { top: '62%', left: '6%' },
  ],
  puerta: [
    { top: '50%', left: '94%' },
    { top: '50%', left: '95%' },
    { top: '38%', left: '94%' },
    { top: '62%', left: '94%' },
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
): boolean {
  const topDelta = Math.abs(parseLayoutPercent(a.top) - parseLayoutPercent(b.top));
  const leftDelta = Math.abs(
    parseLayoutPercent(a.left) - parseLayoutPercent(b.left),
  );
  return (
    topDelta < ACCESSORY_SLOT_MIN_SEPARATION_PCT &&
    leftDelta < ACCESSORY_SLOT_MIN_SEPARATION_PCT
  );
}

function layoutSlotBlocked(
  candidate: { top: string; left: string },
  occupied: Array<{ top: string; left: string }>,
  layoutInsets: TableLayoutInsets,
): boolean {
  if (!isPeripheralSlot(candidate)) {
    return true;
  }
  if (layoutTooCloseToTableZone(candidate, layoutInsets)) {
    return true;
  }
  return occupied.some((taken) => accessorySlotsOverlap(candidate, taken));
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

/** Asigna posición por accesorio evitando solapamientos con mesas y entre sí. */
export function resolveAccessoryLayouts(
  placedIds: string[],
  tableCount = 0,
  canvasRefPx = TABLE_LAYOUT_CANVAS_REF_PX,
): Record<string, { top: string; left: string }> {
  const layoutInsets = computeTableLayoutInsets(tableCount, canvasRefPx);
  const ordered = [...placedIds].sort((a, b) => {
    const rank = (id: string) => {
      const index = ACCESSORY_PLACEMENT_PRIORITY.indexOf(
        id as (typeof ACCESSORY_PLACEMENT_PRIORITY)[number],
      );
      return index === -1 ? ACCESSORY_PLACEMENT_PRIORITY.length : index;
    };
    return rank(a) - rank(b);
  });

  const occupied: Array<{ top: string; left: string }> = [];
  const layouts: Record<string, { top: string; left: string }> = {};

  for (const id of ordered) {
    const candidates = accessoryLayoutCandidates(id).filter(isPeripheralSlot);
    const slot =
      candidates.find(
        (candidate) => !layoutSlotBlocked(candidate, occupied, layoutInsets),
      ) ??
      PERIPHERAL_FALLBACK_CANDIDATES.find(
        (candidate) => !layoutSlotBlocked(candidate, occupied, layoutInsets),
      ) ??
      candidates.find(
        (candidate) => !layoutTooCloseToTableZone(candidate, layoutInsets),
      ) ??
      candidates[0] ??
      PERIPHERAL_FALLBACK_CANDIDATES[0];

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

export function clampDimension(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  const clamped = Math.min(MAX_DIMENSION_M, Math.max(MIN_DIMENSION_M, value));
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
