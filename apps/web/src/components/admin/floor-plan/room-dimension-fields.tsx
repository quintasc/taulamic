'use client';

import { useEffect, useState } from 'react';
import {
  DIMENSION_STEP_M,
  parseDimensionInput,
  type FloorPlanSetup,
  type RoomFitMeterLimits,
} from '@/lib/floor-plan-setup';

function DimensionStepButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-0 text-lg font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {label === 'Disminuir' ? '−' : '+'}
    </button>
  );
}

function RoomDimensionInput({
  id,
  label,
  value,
  min,
  max,
  onCommit,
  labelClassName = 'mb-1.5 block text-xs font-semibold text-neutral-700',
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
  labelClassName?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const atMin = value <= min + 0.05;
  const atMax = value >= max - 0.05;

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commitDraft() {
    const parsed = parseDimensionInput(draft, value);
    const next = Math.min(max, Math.max(min, parsed));
    onCommit(next);
    setDraft(String(next));
  }

  function step(delta: number) {
    const next = Math.min(
      max,
      Math.max(min, Math.round((value + delta) * 10) / 10),
    );
    onCommit(next);
    setDraft(String(next));
  }

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <DimensionStepButton
          label="Disminuir"
          disabled={atMin}
          onClick={() => step(-DIMENSION_STEP_M)}
        />
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="input-field min-w-0 flex-1 py-2 text-center tabular-nums"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
        />
        <DimensionStepButton
          label="Aumentar"
          disabled={atMax}
          onClick={() => step(DIMENSION_STEP_M)}
        />
      </div>
      {atMax ? (
        <p className="mt-1 text-[10px] leading-snug text-neutral-500">
          Máximo para este tamaño de pantalla ({max} m)
        </p>
      ) : null}
    </div>
  );
}

export function RoomDimensionFields({
  setup,
  onUpdate,
  limits,
  idPrefix = 'room',
  labelClassName,
}: {
  setup: FloorPlanSetup;
  onUpdate: (patch: Partial<FloorPlanSetup>) => void;
  limits: RoomFitMeterLimits;
  idPrefix?: string;
  labelClassName?: string;
}) {
  if (setup.shape === 'round') {
    return (
      <RoomDimensionInput
        id={`${idPrefix}-radius`}
        label="Radio (m)"
        value={setup.radiusM}
        min={limits.minRadiusM}
        max={limits.maxRadiusM}
        onCommit={(radiusM) => onUpdate({ radiusM })}
        labelClassName={labelClassName}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <RoomDimensionInput
        id={`${idPrefix}-width`}
        label={setup.shape === 'oval' ? 'Ancho eje (m)' : 'Ancho (m)'}
        value={setup.widthM}
        min={limits.minWidthM}
        max={limits.maxWidthM}
        onCommit={(widthM) => onUpdate({ widthM })}
        labelClassName={labelClassName}
      />
      <RoomDimensionInput
        id={`${idPrefix}-length`}
        label={setup.shape === 'oval' ? 'Largo eje (m)' : 'Largo (m)'}
        value={setup.lengthM}
        min={limits.minLengthM}
        max={limits.maxLengthM}
        onCommit={(lengthM) => onUpdate({ lengthM })}
        labelClassName={labelClassName}
      />
    </div>
  );
}
