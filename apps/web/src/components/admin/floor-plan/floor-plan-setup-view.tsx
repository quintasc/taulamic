'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { FloorAccessoryIcon, getFloorAccessoryDisplaySize } from '@/components/admin/floor-plan/floor-accessory-icon';
import {
  FloorPlanMobileControls,
  FloorPlanRecommendationStrip,
} from '@/components/admin/floor-plan/floor-plan-mobile-controls';
import { IconChevronDown } from '@/components/icons';
import { ResizableRoomCanvas } from '@/components/admin/floor-plan/resizable-room-canvas';
import { RoomDimensionFields } from '@/components/admin/floor-plan/room-dimension-fields';
import {
  canvasTierEdgePaddingPx,
  useLayoutCanvasTier,
  useRoomCanvasBounds,
} from '@/components/admin/floor-plan/use-room-canvas-max-px';
import { Alert, PageHeader, ResponsiveButtonLabel, SaveStatusIndicator, useAutoSaveIndicator } from '@/components/ui';
import { ApiError, eventsApi } from '@/lib/api';
import {
  loadEventUiMeta,
  markFloorPlanUploaded,
  parseApproximateGuestCount,
} from '@/lib/event-ui-meta';
import {
  DEFAULT_FLOOR_PLAN_SETUP,
  FLOOR_PLAN_ACCESSORIES,
  MAX_DIMENSION_M,
  ROOM_CANVAS_COMPACT_PADDING_PX,
  ROOM_SHAPE_OPTIONS,
  applyShapeChange,
  computeRoomFitMeterLimits,
  formatDimensionLimitsLabel,
  formatRoomDimensions,
  hasFloorPlanSetupSaved,
  isRoomAtMaxLength,
  isRoomAtMaxWidth,
  isRoomAtVisualMax,
  loadFloorPlanSetup,
  normalizeSetupForShape,
  saveFloorPlanSetup,
  setupFromRecommendation,
  type FloorPlanSetup,
  type RoomFitMeterLimits,
  type RoomShape,
} from '@/lib/floor-plan-setup';
import { adminRoutes } from '@/lib/routes';
import { getSetupNav } from '@/lib/setup-flow';
import {
  compareRoomToRecommendation,
  computeLogicalRoomLimits,
  recommendRoomSize,
} from '@/lib/room-size-recommendation';
import { SETUP_NAV_COPY, DISTRIBUTION_COPY } from '@/lib/ui-copy';

function AccessoryCard({
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-center transition ${
        active
          ? 'border-primary-500 bg-primary-500/10'
          : 'border-neutral-200 bg-neutral-0 hover:border-primary-500/40 hover:bg-primary-500/5'
      }`}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-lg ${
          active ? 'bg-primary-500/15 text-primary-600' : 'bg-wf-2 text-neutral-600'
        }`}
      >
        <FloorAccessoryIcon
          id={accessoryId}
          size={getFloorAccessoryDisplaySize(accessoryId, 'card')}
        />
      </span>
      <span className="text-xs font-medium text-neutral-700">{label}</span>
    </button>
  );
}

function sameFloorPlanSetup(
  current: FloorPlanSetup,
  next: FloorPlanSetup,
): boolean {
  return (
    current.shape === next.shape &&
    current.widthM === next.widthM &&
    current.lengthM === next.lengthM &&
    current.radiusM === next.radiusM &&
    current.placedAccessories.length === next.placedAccessories.length &&
    current.placedAccessories.every(
      (accessoryId, index) => accessoryId === next.placedAccessories[index],
    )
  );
}

export function FloorPlanSetupView({
  eventId,
  hasDistribution,
}: {
  eventId: string;
  hasDistribution: boolean;
}) {
  const routes = adminRoutes(eventId);
  const setupNav = getSetupNav(eventId, 'plano');

  const {
    status: saveStatus,
    markPending,
    markSaving,
    markSaved,
    markIdle,
  } = useAutoSaveIndicator();

  const [setup, setSetup] = useState<FloorPlanSetup>(DEFAULT_FLOOR_PLAN_SETUP);
  const [configOpen, setConfigOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [guestCountHint, setGuestCountHint] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const mobileCanvasCardRef = useRef<HTMLDivElement>(null);
  const desktopCanvasCardRef = useRef<HTMLDivElement>(null);
  const canvasTier = useLayoutCanvasTier();
  const portraitLayout = canvasTier !== 'desktop';
  const mobileBounds = useRoomCanvasBounds(
    mobileCanvasCardRef,
    'phone',
    setup,
    true,
    mobileCanvasCardRef,
  );
  const desktopBounds = useRoomCanvasBounds(
    desktopCanvasCardRef,
    'desktop',
    setup,
    false,
    desktopCanvasCardRef,
  );
  const fitOptions = useMemo(
    () => ({
      portraitLayout,
      edgePaddingPx:
        canvasTier === 'desktop'
          ? canvasTierEdgePaddingPx('desktop')
          : ROOM_CANVAS_COMPACT_PADDING_PX,
    }),
    [canvasTier, portraitLayout],
  );
  const activeBounds = canvasTier === 'desktop' ? desktopBounds : mobileBounds;
  // fitLimits: límite visual del lienzo (para detectar tope visual, NO como max de inputs)
  const fitLimits = useMemo(
    () => computeRoomFitMeterLimits(setup, activeBounds, fitOptions),
    [activeBounds, fitOptions, setup],
  );

  // Mínimos lógicos por dimensión basados en invitados (restricción hiperbólica de área)
  const logicalMinLimits = useMemo(
    () => computeLogicalRoomLimits(guestCountHint, setup),
    [guestCountHint, setup],
  );

  // Límites para los inputs: mínimo lógico + máximo absoluto 200 m.
  // El canvas escala automáticamente; no limitamos el input al tamaño del lienzo.
  const fieldLimits = useMemo<RoomFitMeterLimits>(
    () => ({
      minWidthM: logicalMinLimits.minWidthM,
      minLengthM: logicalMinLimits.minLengthM,
      minRadiusM: logicalMinLimits.minRadiusM,
      maxWidthM: MAX_DIMENSION_M,
      maxLengthM: MAX_DIMENSION_M,
      maxRadiusM: MAX_DIMENSION_M,
    }),
    [logicalMinLimits],
  );

  // True cuando el salón supera el tope visual: el dibujo ya no crece más en pantalla
  const atVisualMax = isRoomAtVisualMax(setup, fitLimits);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const local = loadFloorPlanSetup(eventId);
      let nextSetup = local;
      let remoteMissing = false;

      try {
        const remote = await eventsApi.getRoomSetup(eventId);
        if (cancelled) {
          return;
        }
        nextSetup = normalizeSetupForShape({
          shape: remote.shape,
          widthM: remote.widthM,
          lengthM: remote.lengthM,
          radiusM: remote.radiusM,
          placedAccessories: remote.placedAccessories,
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          remoteMissing = true;
        }
      }

      const meta = loadEventUiMeta(eventId);
      const guestCount = parseApproximateGuestCount(meta);
      if (guestCount > 0 && remoteMissing && !hasFloorPlanSetupSaved(eventId)) {
        const rec = recommendRoomSize(guestCount, nextSetup.shape);
        if (rec) {
          nextSetup = setupFromRecommendation(
            nextSetup.shape,
            rec,
            nextSetup.placedAccessories,
          );
        }
      }

      if (!cancelled) {
        setGuestCountHint(guestCount);
        setSetup(nextSetup);
        if (!remoteMissing) {
          saveFloorPlanSetup(eventId, nextSetup);
        }
        setHydrated(true);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // NOTA: NO hay efecto de auto-clamp sobre activeBounds aquí.
  // useRoomCanvasBounds depende de 'setup' → si el efecto clampea setup → bounds cambian →
  // efecto vuelve a dispararse → espiral descendente hasta mínimo (3×3).
  // Las dimensiones físicas del salón no cambian por el tamaño del lienzo:
  // roomPixelSizeFit ya escala el salón para que quepa visualmente.
  // El clamp solo ocurre durante interacción del usuario (updateSetup, handleShapeChange).

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const normalized = normalizeSetupForShape(setup);
    saveFloorPlanSetup(eventId, normalized);
    markFloorPlanUploaded(eventId);

    markPending();
    const timer = window.setTimeout(() => {
      markSaving();
      setSaveError(null);
      void eventsApi
        .saveRoomSetup(eventId, normalized)
        .then(() => {
          markSaved();
        })
        .catch((err: unknown) => {
          markIdle();
          const message =
            err instanceof ApiError
              ? err.body.message ?? `Error API ${err.status}`
              : 'No se pudo sincronizar el plano con el servidor.';
          setSaveError(message);
        });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    eventId,
    setup,
    hydrated,
    markPending,
    markSaving,
    markSaved,
    markIdle,
  ]);

  // updateSetup: solo normaliza forma/dimensiones. El canvas escala visualmente
  // sin forzar las medidas físicas a los límites del lienzo.
  const updateSetup = useCallback(
    (patch: Partial<FloorPlanSetup>) => {
      setSetup((current) => normalizeSetupForShape({ ...current, ...patch }));
    },
    [],
  );

  function handleShapeChange(shape: RoomShape) {
    setSetup((current) => {
      const rec = recommendRoomSize(guestCountHint, shape);
      const base = rec
        ? setupFromRecommendation(shape, rec, current.placedAccessories)
        : applyShapeChange(current, shape);
      return normalizeSetupForShape(base);
    });
  }

  function toggleAccessory(id: string) {
    setSetup((current) => {
      const placed = current.placedAccessories.includes(id)
        ? current.placedAccessories.filter((item) => item !== id)
        : [...current.placedAccessories, id];
      return { ...current, placedAccessories: placed };
    });
  }

  function clearAccessories() {
    updateSetup({ placedAccessories: [] });
  }

  if (!hydrated) {
    return <p className="text-sm text-neutral-500">Cargando plano…</p>;
  }

  const roomRecommendation = recommendRoomSize(guestCountHint, setup.shape);
  const roomComparison = compareRoomToRecommendation(setup, guestCountHint);

  function applyRecommendedSize() {
    if (!roomRecommendation) {
      return;
    }
    setSetup(
      setupFromRecommendation(setup.shape, roomRecommendation, setup.placedAccessories),
    );
  }

  return (
    <>
      <PageHeader
        title="Plano del salón"
        subtitle="Paso 4: Define la forma, tamaño y accesorios."
        saveStatus={<SaveStatusIndicator status={saveStatus} />}
        action={
          hasDistribution ? (
            <Link
              href={routes.floorPlanLayout}
              className="btn-secondary"
              aria-label={DISTRIBUTION_COPY.viewFloorPlan.full}
            >
              <ResponsiveButtonLabel
                short={DISTRIBUTION_COPY.viewFloorPlan.short}
                full={DISTRIBUTION_COPY.viewFloorPlan.full}
              />
            </Link>
          ) : undefined
        }
      />

      {saveError ? (
        <div className="mb-4">
          <Alert variant="error">{saveError}</Alert>
        </div>
      ) : null}

      {roomRecommendation && roomComparison ? (
        <div className="mb-4 lg:hidden">
          <FloorPlanRecommendationStrip
            recommendedAreaM2={roomComparison.recommendation.minAreaM2}
            currentAreaM2={roomComparison.currentAreaM2}
            adequate={roomComparison.adequate}
          />
        </div>
      ) : (
        <div className="mb-4 lg:hidden">
          <Alert variant="warning">
            Indica los invitados aproximados en Configuración para ver el tamaño
            mínimo recomendado del salón.
          </Alert>
        </div>
      )}

      {roomRecommendation ? (
        <div className="mb-6 hidden lg:block">
          <Alert variant={roomComparison?.adequate ? 'success' : 'warning'}>
            <p className="font-medium">{roomRecommendation.summary}</p>
            <p className="mt-1 text-sm opacity-90">{roomRecommendation.detail}</p>
            {roomComparison ? (
              <p className="mt-1 text-sm opacity-90">
                Superficie actual del plano: ~{roomComparison.currentAreaM2} m²
                {roomComparison.adequate
                  ? ' · Cumple la recomendación orientativa'
                  : ' · Por debajo de la recomendación; amplía el salón si es posible'}
              </p>
            ) : null}
          </Alert>
        </div>
      ) : (
        <div className="mb-6 hidden lg:block">
          <Alert variant="warning">
            Indica los invitados aproximados en Configuración para ver el tamaño
            mínimo recomendado del salón.
          </Alert>
        </div>
      )}

      <div className="mb-6 space-y-4 lg:hidden">
        <FloorPlanMobileControls
          setup={setup}
          limits={fieldLimits}
          recommendation={roomRecommendation}
          onShapeChange={handleShapeChange}
          onUpdateSetup={updateSetup}
          onToggleAccessory={toggleAccessory}
          onApplyRecommendedSize={applyRecommendedSize}
          onClearAccessories={clearAccessories}
        />
        <div
          ref={mobileCanvasCardRef}
          className="card-admin overflow-visible border border-neutral-200 bg-neutral-50/50 p-1"
        >
          <ResizableRoomCanvas
            setup={setup}
            onChange={updateSetup}
            compact
            areaRef={mobileCanvasCardRef}
          />
        </div>
      </div>

      <div className="hidden gap-6 lg:grid xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col">
          <div
            ref={desktopCanvasCardRef}
            className="card-admin flex min-h-0 flex-1 flex-col overflow-visible border-2 border-dashed border-neutral-200 bg-neutral-50/40 p-4 md:p-6"
          >
            <ResizableRoomCanvas
              setup={setup}
              onChange={updateSetup}
              areaRef={desktopCanvasCardRef}
            />
          </div>

          <p className="mt-3 text-center text-sm font-medium text-neutral-600">
            {formatRoomDimensions(setup)}
          </p>
          {atVisualMax ? (
            <p className="mt-1 text-center text-xs text-warning-600">
              ⚠ Límite visual de pantalla alcanzado. Las medidas reales se guardarán correctamente.
            </p>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="card-admin">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left"
              onClick={() => setConfigOpen((open) => !open)}
            >
              <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
                Configuración del salón
              </h2>
              <IconChevronDown
                width={16}
                height={16}
                className={`shrink-0 text-neutral-400 transition ${configOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {configOpen ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-700">
                    Forma
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ROOM_SHAPE_OPTIONS.map((option) => {
                      const active = setup.shape === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? 'border-primary-500 bg-primary-500/10 text-primary-600'
                              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                          onClick={() => handleShapeChange(option.id)}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <RoomDimensionFields
                  setup={setup}
                  limits={fieldLimits}
                  onUpdate={updateSetup}
                  labelClassName="mb-1.5 block text-xs font-medium text-neutral-700"
                />

                {setup.shape === 'oval' ? (
                  <p className="text-xs text-neutral-500">
                    Ovalada: dos ejes del rectángulo que la contiene (como una
                    elipse).
                  </p>
                ) : null}

                <p className="text-xs text-neutral-500">
                  {formatDimensionLimitsLabel()} Puedes afinar con +/− o arrastrando el
                  marcador del plano. El dibujo escala para encajar en pantalla.
                </p>

                {atVisualMax ? (
                  <p className="text-xs font-medium text-warning-600">
                    ⚠ Límite visual alcanzado. Las medidas reales se guardan correctamente.
                  </p>
                ) : null}

                {setup.shape !== 'round' && isRoomAtMaxWidth(setup) ? (
                  <p className="text-xs font-medium text-warning-600">
                    Ancho máximo absoluto alcanzado ({setup.widthM} m).
                  </p>
                ) : null}

                {setup.shape !== 'round' && isRoomAtMaxLength(setup) ? (
                  <p className="text-xs font-medium text-warning-600">
                    Largo máximo absoluto alcanzado ({setup.lengthM} m).
                  </p>
                ) : null}

                {setup.shape === 'round' && isRoomAtMaxWidth(setup) ? (
                  <p className="text-xs font-medium text-warning-600">
                    Radio máximo absoluto alcanzado ({setup.radiusM} m).
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="card-admin">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
              Accesorios
            </h2>
            <p className="mt-2 text-xs text-neutral-500">
              Pulsa para marcar en el plano.
            </p>
            <div className="mt-4 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
              {FLOOR_PLAN_ACCESSORIES.map((accessory) => (
                <AccessoryCard
                  key={accessory.id}
                  accessoryId={accessory.id}
                  label={accessory.label}
                  active={setup.placedAccessories.includes(accessory.id)}
                  onClick={() => toggleAccessory(accessory.id)}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <SetupNavBar
        hidePrimary
        previousHref={setupNav.previous?.href}
        previousLabel={setupNav.previous?.previousLabel}
        nextHref={setupNav.next?.href}
        nextLabel={setupNav.next?.nextLabel}
        nextReady={hydrated}
        nextDisabledHint={SETUP_NAV_COPY.floorPlanLoading}
      />
    </>
  );
}
