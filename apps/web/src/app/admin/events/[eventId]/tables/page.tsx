'use client';

import { useEffect, useState } from 'react';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import { eventsApi, tableShapesApi, type SeatTopology } from '@/lib/api';
import { useEvent } from '@/lib/event-context';

const shapeOptions = [
  { id: 'redonda', label: 'Redonda' },
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'oval', label: 'Óvalo' },
];

export default function TablesPage() {
  const { event, eventId, refreshEvent } = useEvent();
  const [label, setLabel] = useState('Mesa nueva');
  const [shape, setShape] = useState('redonda');
  const [capacity, setCapacity] = useState(8);
  const [topology, setTopology] = useState<SeatTopology | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void tableShapesApi
      .topology(eventId, shape, capacity)
      .then(setTopology)
      .catch(() => setTopology(null));
  }, [eventId, shape, capacity]);

  async function saveTable() {
    if (!eventId) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await eventsApi.addTable(eventId, {
        label,
        shape,
        estimatedCapacity: capacity,
      });
      await refreshEvent();
      setLabel(`Mesa ${(event?.tables.length ?? 0) + 2}`);
    } catch {
      setError('No se pudo guardar la mesa.');
    } finally {
      setSaving(false);
    }
  }

  async function removeTable(tableId: string) {
    if (!eventId) {
      return;
    }
    await eventsApi.removeTable(eventId, tableId);
    await refreshEvent();
  }

  return (
    <>
      <PageHeader
        title="Configurar mesa"
        subtitle="Define forma y capacidad para las mesas del evento."
      />

      {error ? (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card-admin space-y-6">
          <div>
            <p className="label-field">Forma</p>
            <div className="grid grid-cols-3 gap-3">
              {shapeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setShape(option.id)}
                  className={`rounded-xl border px-3 py-4 text-sm font-medium transition ${
                    shape === option.id
                      ? 'border-primary-500 bg-primary-100 text-primary-600'
                      : 'border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label-field">Capacidad</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-secondary px-3 py-2"
                onClick={() => setCapacity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-lg font-semibold">
                {capacity}
              </span>
              <button
                type="button"
                className="btn-secondary px-3 py-2"
                onClick={() => setCapacity((value) => Math.min(50, value + 1))}
              >
                +
              </button>
              <span className="text-sm text-neutral-500">personas</span>
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="table-label">
              Etiqueta
            </label>
            <input
              id="table-label"
              className="input-field"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-primary w-full"
            disabled={saving || event?.status === 'plan_approved'}
            onClick={() => void saveTable()}
          >
            Guardar mesa
          </button>
        </div>

        <div className="card-admin">
          <p className="label-field">Vista previa</p>
          <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-neutral-100">
            {topology ? (
              <div className="relative h-44 w-44 rounded-full border-2 border-neutral-300 bg-neutral-0">
                {topology.seats.map((seat, index) => (
                  <span
                    key={seat.index}
                    className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold"
                    style={{
                      left: `${50 + 44 * Math.cos((index * 2 * Math.PI) / topology.seats.length - Math.PI / 2)}%`,
                      top: `${50 + 44 * Math.sin((index * 2 * Math.PI) / topology.seats.length - Math.PI / 2)}%`,
                    }}
                  >
                    {seat.label}
                  </span>
                ))}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-neutral-500">
                  {capacity} pax
                </span>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Cargando topología…</p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Mesas del evento
        </h2>
        {event?.tables.length ? (
          <div className="card-admin overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                  <th className="pb-3 pr-4">Etiqueta</th>
                  <th className="pb-3 pr-4">Forma</th>
                  <th className="pb-3 pr-4">Capacidad</th>
                  <th className="pb-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {event.tables.map((table) => (
                  <tr key={table.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4">{table.label}</td>
                    <td className="py-3 pr-4 capitalize">{table.shape}</td>
                    <td className="py-3 pr-4">{table.capacity}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        className="text-sm font-medium text-primary-500 hover:text-primary-600"
                        disabled={event.status === 'plan_approved'}
                        onClick={() => void removeTable(table.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Sin mesas"
            description="Añade la primera mesa con el formulario superior."
          />
        )}
      </section>
    </>
  );
}
