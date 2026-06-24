'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { IconChevronDown } from '@/components/icons';
import { ResizableRoomCanvas } from '@/components/admin/floor-plan/resizable-room-canvas';
import { Alert, PageHeader } from '@/components/ui';
import { ApiError, eventsApi } from '@/lib/api';
import {
  loadEventUiMeta,
  markFloorPlanUploaded,
  parseApproximateGuestCount,
} from '@/lib/event-ui-meta';
import {
  DEFAULT_FLOOR_PLAN_SETUP,
  FLOOR_PLAN_ACCESSORIES,
  ROOM_SHAPE_OPTIONS,
  applyShapeChange,
  formatRoomDimensions,
  loadFloorPlanSetup,
  normalizeSetupForShape,
  saveFloorPlanSetup,
  type FloorPlanSetup,
  type RoomShape,
} from '@/lib/floor-plan-setup';
import { adminRoutes } from '@/lib/routes';
import { getSetupNav } from '@/lib/setup-flow';
import {
  compareRoomToRecommendation,
  recommendRoomSize,
} from '@/lib/room-size-recommendation';

function AccessoryCard({
  label,
  active,
  onClick,
}: {
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
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-wf-2 text-lg text-neutral-500">
        ▢
      </span>
      <span className="text-xs font-medium text-neutral-700">{label}</span>
    </button>
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

  const [setup, setSetup] = useState<FloorPlanSetup>(DEFAULT_FLOOR_PLAN_SETUP);
  const [configOpen, setConfigOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [guestCountHint, setGuestCountHint] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const local = loadFloorPlanSetup(eventId);
      if (!cancelled) {
        setSetup(local);
      }

      try {
        const remote = await eventsApi.getRoomSetup(eventId);
        if (cancelled) {
          return;
        }
        const fromApi = normalizeSetupForShape({
          shape: remote.shape,
          widthM: remote.widthM,
          lengthM: remote.lengthM,
          radiusM: remote.radiusM,
          placedAccessories: remote.placedAccessories,
        });
        setSetup(fromApi);
        saveFloorPlanSetup(eventId, fromApi);
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 404)) {
          // Mantener copia local si la API falla.
        }
      }

      const meta = loadEventUiMeta(eventId);
      if (!cancelled) {
        setGuestCountHint(parseApproximateGuestCount(meta));
        setHydrated(true);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const normalized = normalizeSetupForShape(setup);
    saveFloorPlanSetup(eventId, normalized);
    markFloorPlanUploaded(eventId);

    const timer = window.setTimeout(() => {
      setSaveError(null);
      void eventsApi
        .saveRoomSetup(eventId, normalized)
        .catch((err: unknown) => {
          const message =
            err instanceof ApiError
              ? err.body.message ?? `Error API ${err.status}`
              : 'No se pudo sincronizar el plano con el servidor.';
          setSaveError(message);
        });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [eventId, setup, hydrated]);

  const updateSetup = useCallback((patch: Partial<FloorPlanSetup>) => {
    setSetup((current) => normalizeSetupForShape({ ...current, ...patch }));
  }, []);

  function handleShapeChange(shape: RoomShape) {
    setSetup((current) => applyShapeChange(current, shape));
  }

  function toggleAccessory(id: string) {
    setSetup((current) => {
      const placed = current.placedAccessories.includes(id)
        ? current.placedAccessories.filter((item) => item !== id)
        : [...current.placedAccessories, id];
      return { ...current, placedAccessories: placed };
    });
  }

  if (!hydrated) {
    return <p className="text-sm text-neutral-500">Cargando plano…</p>;
  }

  const roomRecommendation = recommendRoomSize(guestCountHint, setup.shape);
  const roomComparison = compareRoomToRecommendation(setup, guestCountHint);

  return (
    <>
      <PageHeader
        title="Plano del salón"
        subtitle="Paso 4 del setup: define la forma y el tamaño del espacio. Si no cambias nada, se usa la configuración por defecto."
        action={
          hasDistribution ? (
            <Link href={routes.floorPlanLayout} className="btn-secondary">
              Ver mesas en plano
            </Link>
          ) : undefined
        }
      />

      {saveError ? (
        <div className="mb-4">
          <Alert variant="error">{saveError}</Alert>
        </div>
      ) : null}

      {roomRecommendation ? (
        <div className="mb-6">
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
        <div className="mb-6">
          <Alert variant="warning">
            Indica los invitados aproximados en Configuración para ver el tamaño
            mínimo recomendado del salón.
          </Alert>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-h-[520px] flex-col">
          <div className="card-admin flex min-h-[460px] flex-1 flex-col overflow-visible border-2 border-dashed border-neutral-200 bg-neutral-50/40 p-6">
            <div className="flex flex-1 items-center justify-center">
              <ResizableRoomCanvas setup={setup} onChange={updateSetup} />
            </div>
          </div>

          <p className="mt-3 text-center text-sm font-medium text-neutral-600">
            {formatRoomDimensions(setup)}
          </p>
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

                {setup.shape === 'round' ? (
                  <div>
                    <label
                      htmlFor="room-radius"
                      className="mb-1.5 block text-xs font-medium text-neutral-700"
                    >
                      Radio (m)
                    </label>
                    <input
                      id="room-radius"
                      type="number"
                      min={3}
                      max={200}
                      className="input-field py-2"
                      value={setup.radiusM}
                      onChange={(event) =>
                        updateSetup({ radiusM: Number(event.target.value) })
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="room-width"
                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                      >
                        {setup.shape === 'oval' ? 'Ancho eje (m)' : 'Ancho (m)'}
                      </label>
                      <input
                        id="room-width"
                        type="number"
                        min={3}
                        max={200}
                        className="input-field py-2"
                        value={setup.widthM}
                        onChange={(event) =>
                          updateSetup({ widthM: Number(event.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="room-length"
                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                      >
                        {setup.shape === 'oval'
                          ? 'Largo eje (m)'
                          : 'Largo (m)'}
                      </label>
                      <input
                        id="room-length"
                        type="number"
                        min={3}
                        max={200}
                        className="input-field py-2"
                        value={setup.lengthM}
                        onChange={(event) =>
                          updateSetup({ lengthM: Number(event.target.value) })
                        }
                      />
                    </div>
                  </div>
                )}

                {setup.shape === 'oval' ? (
                  <p className="text-xs text-neutral-500">
                    Ovalada: dos ejes del rectángulo que la contiene (como una
                    elipse).
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
              Pulsa para marcar en el plano. Posicionar con drag — post-MVP.
            </p>
            <div className="mt-4 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto">
              {FLOOR_PLAN_ACCESSORIES.map((accessory) => (
                <AccessoryCard
                  key={accessory.id}
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
      />
    </>
  );
}
