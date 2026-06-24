'use client';

import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import {
  IconShapeOval,
  IconShapeRect,
  IconShapeRound,
} from '@/components/icons';
import { TableShapePreview } from '@/components/tables';
import {
  Button,
  EmptyState,
  FormField,
  PageHeader,
  SectionLabel,
  SelectableChip,
  Stepper,
  TextLink,
} from '@/components/ui';
import { useTablesSetup } from '@/hooks/use-tables-setup';

const shapeOptions = [
  { id: 'redonda', label: 'Redonda', Icon: IconShapeRound },
  { id: 'rectangular', label: 'Rectangular', Icon: IconShapeRect },
  { id: 'oval', label: 'Óvalo', Icon: IconShapeOval },
] as const;

export function TablesSetupView() {
  const {
    event,
    eventId,
    setupNav,
    shape,
    setShape,
    capacity,
    setCapacity,
    quantity,
    setQuantity,
    topology,
    saving,
    removingTableId,
    editingTableId,
    editingLabel,
    setEditingLabel,
    savingLabelId,
    previewLabels,
    saveTables,
    startEditLabel,
    cancelEditLabel,
    saveEditedLabel,
    removeTable,
  } = useTablesSetup();

  return (
    <>
      <PageHeader
        title="Configurar mesa"
        subtitle="Paso 5 del setup: define forma y capacidad para las mesas del evento."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card-admin space-y-6">
          <FormField label="Forma">
            <div className="grid grid-cols-3 gap-3">
              {shapeOptions.map((option) => {
                const ShapeIcon = option.Icon;
                const selected = shape === option.id;
                return (
                  <SelectableChip
                    key={option.id}
                    selected={selected}
                    onClick={() => setShape(option.id)}
                  >
                    <ShapeIcon active={selected} />
                    {option.label}
                  </SelectableChip>
                );
              })}
            </div>
          </FormField>

          <FormField label="Capacidad">
            <Stepper
              value={capacity}
              onChange={setCapacity}
              suffix="personas"
            />
          </FormField>

          <FormField
            label="Cantidad"
            hint={`Etiquetas: ${previewLabels.join(', ')}`}
          >
            <Stepper
              value={quantity}
              onChange={setQuantity}
              suffix={quantity === 1 ? 'mesa del mismo tipo' : 'mesas del mismo tipo'}
            />
          </FormField>

          <Button
            className="w-full"
            disabled={saving || event?.status === 'plan_approved'}
            onClick={() => void saveTables()}
          >
            {saving
              ? 'Añadiendo…'
              : quantity === 1
                ? 'Añadir mesa'
                : `Añadir ${quantity} mesas`}
          </Button>
        </div>

        <div className="card-admin">
          <SectionLabel>Vista previa</SectionLabel>
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
        <h2 className="section-label mb-4">Mesas del evento</h2>
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
                            onChange={(e) => setEditingLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                void saveEditedLabel(table.id);
                              }
                              if (e.key === 'Escape') {
                                cancelEditLabel();
                              }
                            }}
                          />
                          <TextLink
                            disabled={savingLabelId === table.id}
                            onClick={() => void saveEditedLabel(table.id)}
                          >
                            {savingLabelId === table.id ? 'Guardando…' : 'Guardar'}
                          </TextLink>
                          <TextLink
                            className="text-neutral-500 hover:text-neutral-700"
                            onClick={cancelEditLabel}
                          >
                            Cancelar
                          </TextLink>
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
                          <TextLink
                            disabled={event.status === 'plan_approved'}
                            onClick={() => startEditLabel(table.id, table.label)}
                          >
                            Editar
                          </TextLink>
                        ) : null}
                        <TextLink
                          disabled={
                            event.status === 'plan_approved' ||
                            removingTableId === table.id ||
                            editingTableId === table.id
                          }
                          onClick={() => void removeTable(table.id)}
                        >
                          {removingTableId === table.id ? 'Eliminando…' : 'Eliminar'}
                        </TextLink>
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

      {eventId ? (
        <SetupNavBar
          hidePrimary
          previousHref={setupNav?.previous?.href}
          previousLabel={setupNav?.previous?.previousLabel}
          nextHref={setupNav?.next?.href}
          nextLabel={setupNav?.next?.nextLabel}
          nextReady={(event?.tables.length ?? 0) > 0}
          nextDisabledHint="Añade al menos una mesa para continuar"
        />
      ) : null}
    </>
  );
}
