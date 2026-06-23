'use client';

import { useEffect, useState } from 'react';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import {
  IconShapeOval,
  IconShapeRect,
  IconShapeRound,
} from '@/components/icons';
import {
  apiTableShape,
  TableShapePreview,
} from '@/components/tables';
import {
  eventsApi,
  tableShapesApi,
  distributionApi,
  ApiError,
  type DistributionProposal,
  type SeatTopology,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { suggestNextTableLabels } from '@/lib/table-labels';

const shapeOptions = [
  { id: 'redonda', label: 'Redonda', Icon: IconShapeRound },
  { id: 'rectangular', label: 'Rectangular', Icon: IconShapeRect },
  { id: 'oval', label: 'Óvalo', Icon: IconShapeOval },
] as const;

export default function TablesPage() {
  const { event, eventId, refreshEvent } = useEvent();
  const [shape, setShape] = useState('redonda');
  const [capacity, setCapacity] = useState(8);
  const [quantity, setQuantity] = useState(1);
  const [topology, setTopology] = useState<SeatTopology | null>(null);
  const [distribution, setDistribution] = useState<DistributionProposal | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [removingTableId, setRemovingTableId] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [savingLabelId, setSavingLabelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewLabels = suggestNextTableLabels(
    event?.tables ?? [],
    Math.max(1, quantity),
  );

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void distributionApi
      .get(eventId)
      .then(setDistribution)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setDistribution(null);
          return;
        }
        setDistribution(null);
      });
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void tableShapesApi
      .topology(eventId, apiTableShape(shape), capacity)
      .then(setTopology)
      .catch(() => setTopology(null));
  }, [eventId, shape, capacity]);

  async function saveTables() {
    if (!eventId) {
      return;
    }
    const count = Math.max(1, Math.min(50, quantity));
    const labels = suggestNextTableLabels(event?.tables ?? [], count);

    setSaving(true);
    setError(null);
    try {
      for (const tableLabel of labels) {
        await eventsApi.addTable(eventId, {
          label: tableLabel,
          shape: apiTableShape(shape),
          estimatedCapacity: capacity,
        });
      }
      await refreshEvent();
      setQuantity(1);
    } catch {
      setError('No se pudieron guardar las mesas.');
    } finally {
      setSaving(false);
    }
  }

  function startEditLabel(tableId: string, currentLabel: string) {
    setEditingTableId(tableId);
    setEditingLabel(currentLabel);
  }

  function cancelEditLabel() {
    setEditingTableId(null);
    setEditingLabel('');
  }

  async function saveEditedLabel(tableId: string) {
    if (!eventId) {
      return;
    }
    const table = event?.tables.find((item) => item.id === tableId);
    if (!table) {
      return;
    }

    const trimmed = editingLabel.trim();
    if (!trimmed) {
      setError('La etiqueta no puede estar vacía.');
      return;
    }

    const duplicate = event?.tables.some(
      (item) => item.id !== tableId && item.label.trim() === trimmed,
    );
    if (duplicate) {
      setError('Ya existe otra mesa con esa etiqueta.');
      return;
    }

    setSavingLabelId(tableId);
    setError(null);
    try {
      await eventsApi.updateTable(eventId, tableId, {
        label: trimmed,
        shape: table.shape,
        estimatedCapacity: table.capacity,
      });
      await refreshEvent();
      cancelEditLabel();
    } catch {
      setError('No se pudo actualizar la etiqueta.');
    } finally {
      setSavingLabelId(null);
    }
  }

  async function removeTable(tableId: string) {
    if (!eventId) {
      return;
    }

    const table = event?.tables.find((item) => item.id === tableId);
    const assignedCount =
      distribution?.placements.filter((placement) => placement.tableId === tableId)
        .length ?? 0;
    const hasDraftDistribution =
      distribution !== null && distribution.status === 'draft';

    if (hasDraftDistribution && assignedCount > 0) {
      const guestLabel =
        assignedCount === 1 ? 'invitado asignado' : 'invitados asignados';
      const accepted = window.confirm(
        `${table?.label ?? 'Esta mesa'} tiene ${assignedCount} ${guestLabel} en la distribución en borrador. Al eliminarla pasarán a «sin asignar». ¿Continuar?`,
      );
      if (!accepted) {
        return;
      }
    }

    setRemovingTableId(tableId);
    setError(null);
    try {
      await eventsApi.removeTable(eventId, tableId);
      await refreshEvent();
      try {
        const updatedDistribution = await distributionApi.get(eventId);
        setDistribution(updatedDistribution);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 404) {
          setDistribution(null);
        }
      }
    } catch {
      setError('No se pudo eliminar la mesa.');
    } finally {
      setRemovingTableId(null);
    }
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
              {shapeOptions.map((option) => {
                const ShapeIcon = option.Icon;
                const selected = shape === option.id;
                return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setShape(option.id)}
                  className={`flex flex-col items-center gap-2 rounded-[9px] border-2 px-3.5 py-3 text-[11px] font-medium transition ${
                    selected
                      ? 'border-primary-500 bg-primary-100 text-primary-600'
                      : 'border-wf-3 text-neutral-700 hover:border-wf-4'
                  }`}
                >
                  <ShapeIcon active={selected} />
                  {option.label}
                </button>
              );
              })}
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
            <p className="label-field">Cantidad</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-secondary px-3 py-2"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span className="min-w-[3rem] text-center text-lg font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                className="btn-secondary px-3 py-2"
                onClick={() => setQuantity((value) => Math.min(50, value + 1))}
              >
                +
              </button>
              <span className="text-sm text-neutral-500">
                {quantity === 1 ? 'mesa' : 'mesas'} del mismo tipo
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Etiquetas: {previewLabels.join(', ')}
            </p>
          </div>

          <button
            type="button"
            className="btn-primary w-full"
            disabled={saving || event?.status === 'plan_approved'}
            onClick={() => void saveTables()}
          >
            {quantity === 1 ? 'Guardar mesa' : `Guardar ${quantity} mesas`}
          </button>
        </div>

        <div className="card-admin">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-wf-5">
            Vista previa
          </p>
          <div className="flex min-h-[280px] items-center justify-center px-3 pb-1 pt-3">
            {topology ? (
              <TableShapePreview
                shape={shape}
                capacity={capacity}
                topology={topology}
              />
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
                    <td className="py-3 pr-4">
                      {editingTableId === table.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className="input-field max-w-[140px] py-1.5 text-sm"
                            value={editingLabel}
                            autoFocus
                            onChange={(event) =>
                              setEditingLabel(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                void saveEditedLabel(table.id);
                              }
                              if (event.key === 'Escape') {
                                cancelEditLabel();
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="text-sm font-medium text-primary-500 hover:text-primary-600 disabled:opacity-50"
                            disabled={savingLabelId === table.id}
                            onClick={() => void saveEditedLabel(table.id)}
                          >
                            {savingLabelId === table.id ? 'Guardando…' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            className="text-sm text-neutral-500 hover:text-neutral-700"
                            onClick={cancelEditLabel}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        table.label
                      )}
                    </td>
                    <td className="py-3 pr-4 capitalize">{table.shape}</td>
                    <td className="py-3 pr-4">{table.capacity}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {editingTableId !== table.id ? (
                          <button
                            type="button"
                            className="text-sm font-medium text-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={event.status === 'plan_approved'}
                            onClick={() => startEditLabel(table.id, table.label)}
                          >
                            Editar
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="text-sm font-medium text-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={
                            event.status === 'plan_approved' ||
                            removingTableId === table.id ||
                            editingTableId === table.id
                          }
                          onClick={() => void removeTable(table.id)}
                        >
                          {removingTableId === table.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
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
