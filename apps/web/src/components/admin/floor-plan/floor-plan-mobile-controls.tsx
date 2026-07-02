'use client';

import { FloorAccessoryIcon, getFloorAccessoryDisplaySize } from '@/components/admin/floor-plan/floor-accessory-icon';
import { RoomDimensionFields } from '@/components/admin/floor-plan/room-dimension-fields';
import { IconClose, IconRefresh } from '@/components/icons';
import { MobileHorizontalScroll } from '@/components/ui';
import {
  FLOOR_PLAN_ACCESSORIES,
  ROOM_SHAPE_OPTIONS,
  formatRoomDimensions,
  type FloorPlanSetup,
  type RoomFitMeterLimits,
  type RoomShape,
} from '@/lib/floor-plan-setup';
import type { RoomSizeRecommendation } from '@/lib/room-size-recommendation';

const MOBILE_SHAPE_LABELS: Record<RoomShape, string> = {
  rectangular: 'Rectang.',
  round: 'Redond.',
  oval: 'Oval.',
};

export function FloorPlanRecommendationStrip({
  recommendedAreaM2,
  currentAreaM2,
  adequate,
}: {
  recommendedAreaM2: number;
  currentAreaM2: number;
  adequate: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs ${
        adequate
          ? 'border-success-500/30 bg-success-500/10 text-success-800'
          : 'border-warning-500/35 bg-warning-500/10 text-warning-900'
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          adequate ? 'bg-success-500/20' : 'bg-warning-500/20'
        }`}
        aria-hidden
      >
        i
      </span>
      <p className="min-w-0 leading-snug">
        <span className="font-medium">~{recommendedAreaM2} m² recomendado</span>
        <span className="mx-1.5 text-neutral-400">·</span>
        <span>~{currentAreaM2} m² actual</span>
      </p>
    </div>
  );
}

export function AccessoryChip({
  accessoryId,
  label,
  active,
  onClick,
}: {
  accessoryId: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const shortLabel = label.split(' ').slice(0, 2).join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition ${
        active
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-neutral-200 bg-neutral-0'
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          active ? 'bg-primary-500/15 text-primary-600' : 'bg-wf-2 text-neutral-600'
        }`}
      >
        <FloorAccessoryIcon
          id={accessoryId}
          size={getFloorAccessoryDisplaySize(accessoryId, 'card') * 0.85}
        />
      </span>
      <span className="line-clamp-2 text-[10px] font-medium leading-tight text-neutral-700">
        {shortLabel}
      </span>
    </button>
  );
}

export function FloorPlanMobileControls({
  setup,
  limits,
  recommendation,
  onShapeChange,
  onUpdateSetup,
  onToggleAccessory,
  onApplyRecommendedSize,
  onClearAccessories,
}: {
  setup: FloorPlanSetup;
  limits: RoomFitMeterLimits;
  recommendation: RoomSizeRecommendation | null;
  onShapeChange: (shape: RoomShape) => void;
  onUpdateSetup: (patch: Partial<FloorPlanSetup>) => void;
  onToggleAccessory: (id: string) => void;
  onApplyRecommendedSize: () => void;
  onClearAccessories: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-700">Forma</p>
        <div className="flex flex-wrap gap-2">
          {ROOM_SHAPE_OPTIONS.map((option) => {
            const active = setup.shape === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? 'border-primary-500 bg-primary-500/10 text-primary-600'
                    : 'border-neutral-200 bg-neutral-0 text-neutral-700'
                }`}
                onClick={() => onShapeChange(option.id)}
              >
                {MOBILE_SHAPE_LABELS[option.id]}
              </button>
            );
          })}
        </div>
      </div>

      <RoomDimensionFields
        setup={setup}
        limits={limits}
        onUpdate={onUpdateSetup}
        idPrefix="room-mobile"
      />

      <p className="text-[11px] leading-snug text-neutral-500">
        Medidas orientativas según invitados aproximados; puedes afinarlas con +/−.
        El plano no supera el tamaño visible de la pantalla.
      </p>

      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/80 px-3 py-2">
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-neutral-700">
          {formatRoomDimensions(setup)}
        </p>
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40"
          aria-label="Limpiar plano"
          title="Limpiar plano"
          disabled={setup.placedAccessories.length === 0}
          onClick={onClearAccessories}
        >
          <IconClose width={16} height={16} />
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-500/10 disabled:opacity-40"
          aria-label="Volver al tamaño recomendado"
          title="Volver al tamaño recomendado"
          disabled={!recommendation}
          onClick={onApplyRecommendedSize}
        >
          <IconRefresh width={16} height={16} />
        </button>
      </div>

      <MobileHorizontalScroll
        label="Accesorios"
        className="-mx-1"
        scrollClassName="flex gap-2 px-1 pb-1"
        aria-label="Accesorios del plano"
      >
          {FLOOR_PLAN_ACCESSORIES.map((accessory) => (
            <AccessoryChip
              key={accessory.id}
              accessoryId={accessory.id}
              label={accessory.label}
              active={setup.placedAccessories.includes(accessory.id)}
              onClick={() => onToggleAccessory(accessory.id)}
            />
          ))}
        </MobileHorizontalScroll>
    </div>
  );
}
