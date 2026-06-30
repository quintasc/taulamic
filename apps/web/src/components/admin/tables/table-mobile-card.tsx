'use client';

import { TableShapeInlineSelect } from '@/components/admin/tables/table-shape-inline-select';
import { IconPencil, IconTrash } from '@/components/icons';
import type { TableEditDraft } from '@/lib/table-form';
import { TABLE_CAPACITY_MAX, TABLE_CAPACITY_MIN } from '@/lib/table-form';

type TableRow = {
  id: string;
  label: string;
  shape: string;
  capacity: number;
};

export function TableMobileCard({
  table,
  shapeLabel,
  isEditing,
  isSelected,
  editingDraft,
  labelError,
  capacityError,
  planLocked,
  editBlocked,
  deleting,
  isRemoving,
  onToggleSelect,
  onStartEdit,
  onRemove,
  onUpdateDraft,
  onUndoEdit,
  onFinishEdit,
}: {
  table: TableRow;
  shapeLabel: string;
  isEditing: boolean;
  isSelected: boolean;
  editingDraft: TableEditDraft | null;
  labelError: string | null;
  capacityError: string | null;
  planLocked: boolean;
  editBlocked: boolean;
  deleting: boolean;
  isRemoving: boolean;
  onToggleSelect: () => void;
  onStartEdit: () => void;
  onRemove: () => void;
  onUpdateDraft: (patch: Partial<TableEditDraft>) => void;
  onUndoEdit: () => void;
  onFinishEdit: () => void;
}) {
  const editPanelId = `table-mobile-edit-${table.id}`;

  return (
    <article
      id={`table-mobile-card-${table.id}`}
      className="card-admin overflow-hidden p-0"
      aria-label={`Mesa ${table.label}`}
      onBlur={(event) => {
        if (!isEditing || editBlocked) {
          return;
        }
        const card = event.currentTarget;
        window.setTimeout(() => {
          if (card.contains(document.activeElement)) {
            return;
          }
          onFinishEdit();
        }, 0);
      }}
    >
      <div className="flex items-center gap-2 p-3">
        <input
          type="checkbox"
          className="checkbox-admin shrink-0"
          aria-label={`Seleccionar ${table.label}`}
          checked={isSelected}
          disabled={planLocked || deleting || (editBlocked && !isEditing)}
          onChange={onToggleSelect}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {isEditing && editingDraft ? editingDraft.label : table.label}
          </p>
          {!isEditing ? (
            <p className="truncate text-xs text-neutral-500">
              {shapeLabel} · {table.capacity}{' '}
              {table.capacity === 1 ? 'persona' : 'personas'}
            </p>
          ) : null}
        </div>

        {!isEditing ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
              title="Editar"
              aria-label={`Editar ${table.label}`}
              disabled={planLocked || editBlocked || deleting}
              onClick={onStartEdit}
            >
              <IconPencil width={16} height={16} />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-error-500 hover:bg-error-500/10 disabled:opacity-40"
              title="Eliminar"
              aria-label={isRemoving ? 'Eliminando mesa' : `Eliminar ${table.label}`}
              disabled={planLocked || isRemoving || editBlocked || deleting}
              onClick={onRemove}
            >
              <IconTrash width={16} height={16} strokeWidth={2} />
            </button>
          </div>
        ) : null}
      </div>

      {isEditing && editingDraft ? (
        <div
          id={editPanelId}
          className="space-y-3 border-t border-neutral-100 bg-neutral-50/60 px-3 py-3"
        >
          <div>
            <label
              htmlFor={`${editPanelId}-label`}
              className="mb-1 block text-xs font-semibold text-neutral-600"
            >
              Etiqueta
            </label>
            <input
              id={`${editPanelId}-label`}
              className={`input-field-compact w-full max-w-[8rem] ${
                labelError
                  ? 'border-error-500 text-error-600 focus:border-error-500 focus:ring-error-500/20'
                  : ''
              }`}
              value={editingDraft.label}
              autoFocus
              aria-invalid={labelError !== null}
              onChange={(event) => onUpdateDraft({ label: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  onUndoEdit();
                }
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onFinishEdit();
                }
              }}
            />
            {labelError ? (
              <p className="mt-1 text-xs leading-snug text-error-500">{labelError}</p>
            ) : null}
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold text-neutral-600">Forma</p>
            <TableShapeInlineSelect
              value={editingDraft.shape}
              onChange={(shape) => onUpdateDraft({ shape })}
            />
          </div>

          <div>
            <label
              htmlFor={`${editPanelId}-capacity`}
              className="mb-1 block text-xs font-semibold text-neutral-600"
            >
              Capacidad
            </label>
            <input
              id={`${editPanelId}-capacity`}
              type="number"
              min={TABLE_CAPACITY_MIN}
              max={TABLE_CAPACITY_MAX}
              className={`input-field-compact w-full max-w-[5rem] tabular-nums ${
                capacityError
                  ? 'border-error-500 text-error-600 focus:border-error-500 focus:ring-error-500/20'
                  : ''
              }`}
              value={
                Number.isFinite(editingDraft.capacity) ? editingDraft.capacity : ''
              }
              aria-invalid={capacityError !== null}
              onChange={(event) => {
                const raw = event.target.value;
                onUpdateDraft({
                  capacity: raw === '' ? Number.NaN : Number(raw),
                });
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  onUndoEdit();
                }
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onFinishEdit();
                }
              }}
            />
            {capacityError ? (
              <p className="mt-1 text-xs leading-snug text-error-500">{capacityError}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
