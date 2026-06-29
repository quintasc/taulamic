'use client';

import { TableShapeInlineSelect } from '@/components/admin/tables/table-shape-inline-select';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import {
  IconPencil,
  IconShapeOval,
  IconShapeRect,
  IconShapeRound,
  IconTrash,
} from '@/components/icons';
import { TableShapePreview } from '@/components/tables';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  FormField,
  PageHeader,
  SectionLabel,
  SelectableChip,
  Stepper,
} from '@/components/ui';
import { useTablesSetup } from '@/hooks/use-tables-setup';
import {
  TABLE_CAPACITY_MAX,
  TABLE_CAPACITY_MIN,
  TABLE_SHAPE_OPTIONS,
  uiTableShape,
  splitTableEditErrors,
} from '@/lib/table-form';

const shapeIcons = {
  redonda: IconShapeRound,
  rectangular: IconShapeRect,
  oval: IconShapeOval,
} as const;

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
    distribution,
    saving,
    removingTableId,
    bulkRemoving,
    editingTableId,
    editingDraft,
    editError,
    updateEditingDraft,
    pendingRemoveTableIds,
    selectedTableIds,
    previewLabels,
    saveTables,
    startEditTable,
    undoTableEdit,
    tryFinishTableEdit,
    toggleTableSelection,
    toggleSelectAllTables,
    clearTableSelection,
    removeTable,
    removeSelectedTables,
    cancelRemoveTables,
    confirmRemoveTables,
  } = useTablesSetup();

  const tables = event?.tables ?? [];
  const planLocked = event?.status === 'plan_approved';
  const editBlocked = editError !== null;
  const allSelected = tables.length > 0 && selectedTableIds.size === tables.length;
  const someSelected = selectedTableIds.size > 0;
  const deleting = removingTableId !== null || bulkRemoving;

  const pendingRemoveTables = tables.filter((table) =>
    pendingRemoveTableIds?.includes(table.id),
  );
  const hasDraftDistribution =
    distribution !== null && distribution.status === 'draft';
  const pendingAssignedTableCount = hasDraftDistribution
    ? (pendingRemoveTableIds?.filter(
        (tableId) =>
          (distribution?.placements.filter(
            (placement) => placement.tableId === tableId,
          ).length ?? 0) > 0,
      ).length ?? 0)
    : 0;

  let removeDialogDescription = '';
  if (pendingRemoveTables.length === 1) {
    const table = pendingRemoveTables[0];
    const assignedCount =
      distribution?.placements.filter(
        (placement) => placement.tableId === table.id,
      ).length ?? 0;
    const guestLabel =
      assignedCount === 1 ? 'invitado asignado' : 'invitados asignados';
    removeDialogDescription = `${table.label} tiene ${assignedCount} ${guestLabel} en la distribución en borrador. Al eliminarla pasarán a «sin asignar». ¿Continuar?`;
  } else if (pendingRemoveTables.length > 1) {
    if (pendingAssignedTableCount > 0) {
      removeDialogDescription = `${pendingRemoveTables.length} mesas seleccionadas; ${pendingAssignedTableCount} tienen invitados asignados en borrador. Al eliminarlas pasarán a «sin asignar». ¿Continuar?`;
    } else {
      removeDialogDescription = `¿Eliminar ${pendingRemoveTables.length} mesas seleccionadas?`;
    }
  }

  return (
    <>
      <ConfirmDialog
        open={pendingRemoveTableIds !== null && pendingRemoveTableIds.length > 0}
        title={
          (pendingRemoveTableIds?.length ?? 0) === 1
            ? 'Eliminar mesa'
            : 'Eliminar mesas seleccionadas'
        }
        description={removeDialogDescription}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        confirming={deleting}
        onConfirm={() => void confirmRemoveTables()}
        onCancel={cancelRemoveTables}
      />
      <PageHeader
        title="Configurar mesa"
        subtitle="Paso 5 del setup: define forma y capacidad para las mesas del evento."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card-admin space-y-6">
          <FormField label="Forma">
            <div className="grid grid-cols-3 gap-3">
              {TABLE_SHAPE_OPTIONS.map((option) => {
                const ShapeIcon = shapeIcons[option.id];
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
              min={TABLE_CAPACITY_MIN}
              max={TABLE_CAPACITY_MAX}
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
            disabled={saving || planLocked}
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
        {tables.length ? (
          <>
            {someSelected ? (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-wf-3 bg-wf-2 px-3 py-2">
                <p className="text-sm text-neutral-700">
                  <span className="font-medium text-neutral-900">
                    {selectedTableIds.size} seleccionada
                    {selectedTableIds.size === 1 ? '' : 's'}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-800 disabled:opacity-50"
                    disabled={deleting}
                    onClick={clearTableSelection}
                  >
                    Limpiar selección
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-error-500/30 bg-neutral-0 px-2.5 text-xs font-medium text-error-500 transition hover:bg-error-500/5 disabled:opacity-50"
                    title="Eliminar selección"
                    disabled={deleting || editBlocked || planLocked}
                    onClick={removeSelectedTables}
                  >
                    <IconTrash width={14} height={14} />
                    {deleting ? 'Eliminando…' : 'Eliminar selección'}
                  </button>
                </div>
              </div>
            ) : null}
            <div className="card-admin overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                    <th className="w-10 pb-3 pr-2">
                      <input
                        type="checkbox"
                        className="checkbox-admin"
                        aria-label="Seleccionar todas las mesas"
                        checked={allSelected}
                        disabled={planLocked || editBlocked || deleting}
                        onChange={toggleSelectAllTables}
                      />
                    </th>
                    <th className="pb-3 pr-4">Etiqueta</th>
                    <th className="pb-3 pr-4">Forma</th>
                    <th className="pb-3 pr-4">Capacidad</th>
                    <th className="pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => {
                    const isEditing = editingTableId === table.id;
                    const isSelected = selectedTableIds.has(table.id);
                    const { labelError, capacityError } =
                      isEditing && editingDraft
                        ? splitTableEditErrors(
                            table.id,
                            editingDraft,
                            tables,
                            editError,
                          )
                        : { labelError: null, capacityError: null };
                    const shapeOption = TABLE_SHAPE_OPTIONS.find(
                      (option) =>
                        option.id ===
                        (isEditing && editingDraft
                          ? editingDraft.shape
                          : uiTableShape(table.shape)),
                    );

                    return (
                      <tr
                        key={table.id}
                        className="border-b border-neutral-100 transition-colors hover:bg-neutral-50/80"
                        onBlur={(event) => {
                          if (!isEditing || editError) {
                            return;
                          }
                          const row = event.currentTarget;
                          window.setTimeout(() => {
                            if (row.contains(document.activeElement)) {
                              return;
                            }
                            void tryFinishTableEdit();
                          }, 0);
                        }}
                      >
                        <td className="py-3 pr-2">
                          <input
                            type="checkbox"
                            className="checkbox-admin"
                            aria-label={`Seleccionar ${table.label}`}
                            checked={isSelected}
                            disabled={
                              planLocked ||
                              deleting ||
                              (editBlocked && !isEditing)
                            }
                            onChange={() => toggleTableSelection(table.id)}
                          />
                        </td>
                        <td className="max-w-[7rem] py-3 pr-4">
                          {isEditing && editingDraft ? (
                            <div className="flex flex-col gap-1">
                              <input
                                className={`input-field-compact w-[5.5rem] ${
                                  labelError
                                    ? 'border-error-500 text-error-600 focus:border-error-500 focus:ring-error-500/20'
                                    : ''
                                }`}
                                value={editingDraft.label}
                                autoFocus
                                aria-label="Etiqueta de la mesa"
                                aria-invalid={labelError !== null}
                                onChange={(e) =>
                                  updateEditingDraft({ label: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    e.preventDefault();
                                    undoTableEdit();
                                  }
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    void tryFinishTableEdit();
                                  }
                                }}
                              />
                              {labelError ? (
                                <p className="max-w-[7rem] text-xs leading-snug text-error-500">
                                  {labelError}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            table.label
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {isEditing && editingDraft ? (
                            <TableShapeInlineSelect
                              value={editingDraft.shape}
                              onChange={(shape) => updateEditingDraft({ shape })}
                            />
                          ) : (
                            <span className="capitalize">
                              {shapeOption?.label ?? table.shape}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {isEditing && editingDraft ? (
                            <div className="flex flex-col gap-1">
                              <input
                                type="number"
                                min={TABLE_CAPACITY_MIN}
                                max={TABLE_CAPACITY_MAX}
                                className={`input-field-compact w-14 tabular-nums ${
                                  capacityError
                                    ? 'border-error-500 text-error-600 focus:border-error-500 focus:ring-error-500/20'
                                    : ''
                                }`}
                                value={
                                  Number.isFinite(editingDraft.capacity)
                                    ? editingDraft.capacity
                                    : ''
                                }
                                aria-label="Capacidad de la mesa"
                                aria-invalid={capacityError !== null}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  updateEditingDraft({
                                    capacity:
                                      raw === '' ? Number.NaN : Number(raw),
                                  });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') {
                                    e.preventDefault();
                                    undoTableEdit();
                                  }
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    void tryFinishTableEdit();
                                  }
                                }}
                              />
                              {capacityError ? (
                                <p className="max-w-[220px] text-xs leading-snug text-error-500">
                                  {capacityError}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            table.capacity
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40"
                              title="Editar"
                              aria-label="Editar mesa"
                              disabled={
                                planLocked ||
                                (editBlocked && !isEditing) ||
                                isEditing
                              }
                              onClick={() => startEditTable(table.id)}
                            >
                              <IconPencil width={16} height={16} />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-error-500 transition hover:bg-error-500/10 hover:text-error-600 disabled:opacity-40"
                              title="Eliminar"
                              aria-label={
                                removingTableId === table.id
                                  ? 'Eliminando mesa'
                                  : 'Eliminar mesa'
                              }
                              disabled={
                                planLocked ||
                                removingTableId === table.id ||
                                editBlocked ||
                                deleting
                              }
                              onClick={() => removeTable(table.id)}
                            >
                              <IconTrash width={16} height={16} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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
          nextReady={tables.length > 0}
          nextDisabledHint="Añade al menos una mesa para continuar"
        />
      ) : null}
    </>
  );
}
