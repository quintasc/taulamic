'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { IconChevronDown } from '@/components/icons';
import { ResizableRoomCanvas } from '@/components/admin/floor-plan/resizable-room-canvas';
import { PageHeader } from '@/components/ui';
import { markFloorPlanUploaded } from '@/lib/event-ui-meta';
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
  const router = useRouter();
  const routes = adminRoutes(eventId);

  const [setup, setSetup] = useState<FloorPlanSetup>(DEFAULT_FLOOR_PLAN_SETUP);
  const [configOpen, setConfigOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSetup(loadFloorPlanSetup(eventId));
    setHydrated(true);
  }, [eventId]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const normalized = normalizeSetupForShape(setup);
    saveFloorPlanSetup(eventId, normalized);
    markFloorPlanUploaded(eventId);
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

  function handleSave() {
    const normalized = normalizeSetupForShape(setup);
    saveFloorPlanSetup(eventId, normalized);
    markFloorPlanUploaded(eventId);
    router.push(routes.guests);
  }

  if (!hydrated) {
    return <p className="text-sm text-neutral-500">Cargando plano…</p>;
  }

  return (
    <>
      <PageHeader
        title="Plano del salón"
        subtitle="Define la forma y el tamaño del espacio. Las medidas se actualizan al redimensionar el lienzo."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {hasDistribution ? (
              <Link href={routes.floorPlanLayout} className="btn-secondary">
                Ver mesas en plano
              </Link>
            ) : null}
            <button type="button" className="btn-primary" onClick={handleSave}>
              Guardar y continuar
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-h-[520px] flex-col">
          <div className="card-admin flex min-h-[460px] flex-1 flex-col overflow-visible border-2 border-dashed border-neutral-200 bg-neutral-50/40 p-6">
            <div className="flex flex-1 items-center justify-center">
              <ResizableRoomCanvas setup={setup} onChange={updateSetup} />
            </div>

            {setup.placedAccessories.length > 0 ? (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {setup.placedAccessories.map((id) => {
                  const accessory = FLOOR_PLAN_ACCESSORIES.find(
                    (item) => item.id === id,
                  );
                  if (!accessory) {
                    return null;
                  }
                  return (
                    <span
                      key={id}
                      className="rounded-full border border-neutral-200 bg-neutral-0 px-3 py-1 text-xs font-medium text-neutral-700"
                    >
                      {accessory.label}
                    </span>
                  );
                })}
              </div>
            ) : null}
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
              Pulsa para marcar en el plano. Posicionar en canvas — post-MVP.
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
    </>
  );
}
