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
  { id: 'mesa-novios', label: 'Mesa novios' },
  { id: 'pista-baile', label: 'Pista baile' },
  { id: 'barra-bar', label: 'Barra bar' },
  { id: 'puerta', label: 'Puerta' },
  { id: 'escenario', label: 'Escenario' },
  { id: 'entrada', label: 'Entrada' },
] as const;

export const DEFAULT_FLOOR_PLAN_SETUP: FloorPlanSetup = {
  shape: 'rectangular',
  widthM: 25,
  lengthM: 15,
  radiusM: 12,
  placedAccessories: [],
};

export const MIN_DIMENSION_M = 3;
export const MAX_DIMENSION_M = 200;

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

  return normalizeSetupForShape({
    shape,
    widthM,
    lengthM,
    radiusM,
    placedAccessories: parsed.placedAccessories ?? [],
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

/** Tamaño en px del lienzo según metros (máx. ~400px). */
export function roomPixelSize(setup: FloorPlanSetup, maxPx = 400): {
  widthPx: number;
  heightPx: number;
  metersPerPx: number;
} {
  if (setup.shape === 'round') {
    const diameterPx = roundDiameterPx(setup.radiusM, maxPx);
    const metersPerPx = (setup.radiusM * 2) / diameterPx;
    return { widthPx: diameterPx, heightPx: diameterPx, metersPerPx };
  }

  const aspect = setup.widthM / setup.lengthM;
  let widthPx: number;
  let heightPx: number;

  if (aspect >= 1) {
    widthPx = maxPx;
    heightPx = maxPx / aspect;
  } else {
    heightPx = maxPx;
    widthPx = maxPx * aspect;
  }

  const metersPerPx = setup.widthM / widthPx;
  return { widthPx, heightPx, metersPerPx };
}

export function patchFromPixelResize(
  setup: FloorPlanSetup,
  deltaWidthPx: number,
  deltaHeightPx: number,
  metersPerPx: number,
): Partial<FloorPlanSetup> {
  if (setup.shape === 'round') {
    const deltaRadius = ((deltaWidthPx + deltaHeightPx) / 2) * metersPerPx;
    return { radiusM: setup.radiusM + deltaRadius };
  }

  const deltaW = deltaWidthPx * metersPerPx;
  const deltaH = deltaHeightPx * metersPerPx;

  return {
    widthM: setup.widthM + deltaW,
    lengthM: setup.lengthM + deltaH,
  };
}
