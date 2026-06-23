import type { FloorPlanSetup } from '@/lib/floor-plan-setup';

/** m² por comensal sentado con circulación (orientativo, no normativa). */
const M2_PER_GUEST = 1.5;

export type RoomSizeRecommendation = {
  guestCount: number;
  minAreaM2: number;
  suggestedWidthM: number;
  suggestedLengthM: number;
  summary: string;
  detail: string;
};

export function recommendRoomSize(guestCount: number): RoomSizeRecommendation | null {
  if (guestCount <= 0) {
    return null;
  }

  const minAreaM2 = Math.ceil(guestCount * M2_PER_GUEST);
  const aspectRatio = 1.35;
  const suggestedLengthM = Math.ceil(Math.sqrt(minAreaM2 / aspectRatio));
  const suggestedWidthM = Math.ceil(suggestedLengthM * aspectRatio);

  return {
    guestCount,
    minAreaM2,
    suggestedWidthM,
    suggestedLengthM,
    summary: `Superficie mínima orientativa: ~${minAreaM2} m² para ${guestCount} invitados`,
    detail: `Dimensiones de referencia (rectangular): ~${suggestedWidthM} × ${suggestedLengthM} m. Ajusta según forma del salón y elementos fijos.`,
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
  const recommendation = recommendRoomSize(guestCount);
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
