import type { FloorPlanSetup, RoomShape } from '@/lib/floor-plan-setup';

/** m² por comensal sentado con circulación (orientativo, no normativa). */
const M2_PER_GUEST = 1.5;

export type RoomSizeRecommendation = {
  guestCount: number;
  minAreaM2: number;
  suggestedWidthM: number;
  suggestedLengthM: number;
  suggestedRadiusM?: number;
  shape: RoomShape;
  summary: string;
  detail: string;
};

function shapeLabel(shape: RoomShape): string {
  switch (shape) {
    case 'round':
      return 'redondo';
    case 'oval':
      return 'ovalado';
    default:
      return 'rectangular';
  }
}

function buildDetail(
  shape: RoomShape,
  minAreaM2: number,
  widthM: number,
  lengthM: number,
  radiusM: number,
): string {
  const label = shapeLabel(shape);

  if (shape === 'round') {
    const diameterM = Math.ceil(radiusM * 2);
    return `Diámetro de referencia (salón ${label}): ~${diameterM} m (radio ~${radiusM} m). Ajusta según el espacio real y elementos fijos.`;
  }

  if (shape === 'oval') {
    return `Dimensiones de referencia (salón ${label}): ~${widthM} × ${lengthM} m. Ajusta según el perímetro ovalado y elementos fijos.`;
  }

  return `Dimensiones de referencia (salón ${label}): ~${widthM} × ${lengthM} m. Ajusta según forma del salón y elementos fijos.`;
}

export function recommendRoomSize(
  guestCount: number,
  shape: RoomShape = 'rectangular',
): RoomSizeRecommendation | null {
  if (guestCount <= 0) {
    return null;
  }

  const minAreaM2 = Math.ceil(guestCount * M2_PER_GUEST);

  if (shape === 'round') {
    const suggestedRadiusM = Math.ceil(Math.sqrt(minAreaM2 / Math.PI));
    return {
      guestCount,
      minAreaM2,
      suggestedWidthM: suggestedRadiusM * 2,
      suggestedLengthM: suggestedRadiusM * 2,
      suggestedRadiusM,
      shape,
      summary: `Superficie mínima orientativa: ~${minAreaM2} m² para ${guestCount} invitados (salón ${shapeLabel(shape)})`,
      detail: buildDetail(
        shape,
        minAreaM2,
        suggestedRadiusM * 2,
        suggestedRadiusM * 2,
        suggestedRadiusM,
      ),
    };
  }

  const aspectRatio = shape === 'oval' ? 1.5 : 1.35;
  const suggestedLengthM = Math.ceil(Math.sqrt(minAreaM2 / aspectRatio));
  const suggestedWidthM = Math.ceil(suggestedLengthM * aspectRatio);

  return {
    guestCount,
    minAreaM2,
    suggestedWidthM,
    suggestedLengthM,
    shape,
    summary: `Superficie mínima orientativa: ~${minAreaM2} m² para ${guestCount} invitados (salón ${shapeLabel(shape)})`,
    detail: buildDetail(
      shape,
      minAreaM2,
      suggestedWidthM,
      suggestedLengthM,
      Math.ceil(suggestedWidthM / 2),
    ),
  };
}

function roomAreaM2(setup: FloorPlanSetup): number {
  if (setup.shape === 'round') {
    const r = setup.radiusM ?? 0;
    return Math.PI * r * r;
  }
  return (setup.widthM ?? 0) * (setup.lengthM ?? 0);
}

export function compareRoomToRecommendation(
  setup: FloorPlanSetup,
  guestCount: number,
): { adequate: boolean; currentAreaM2: number; recommendation: RoomSizeRecommendation } | null {
  const recommendation = recommendRoomSize(guestCount, setup.shape);
  if (!recommendation) {
    return null;
  }

  const currentAreaM2 = Math.round(roomAreaM2(setup));
  return {
    adequate: currentAreaM2 >= recommendation.minAreaM2,
    currentAreaM2,
    recommendation,
  };
}
