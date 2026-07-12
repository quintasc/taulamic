'use client';

import { useTableMetaDraft } from '@/hooks/use-table-meta-draft';
import { TableShapeInlineSelect } from '@/components/admin/tables/table-shape-inline-select';
import {
  TABLE_CAPACITY_MAX,
  TABLE_CAPACITY_MIN,
  type TableEditDraft,
  type TableShapeUiId,
} from '@/lib/table-form';

const DISTRIBUTION_FIELD_SELECT_BASE_CLASS =
  'input-field flex min-w-0 items-center justify-between gap-1 whitespace-nowrap py-1 pl-2 pr-6 text-xs capitalize';

const stopRowToggleProps = {
  'data-table-meta-control': true,
  onClick: (event: React.MouseEvent) => event.stopPropagation(),
  onPointerDown: (event: React.PointerEvent) => event.stopPropagation(),
} as const;

export function DistributionTableShapeEditor({
  tableId,
  tableLabel,
  tableShape,
  capacity,
  assignedCount,
  allTables,
  editable,
  onSave,
  dropdownWidthClass = 'w-[9.25rem]',
}: {
  tableId: string;
  tableLabel: string;
  tableShape: string;
  capacity: number;
  assignedCount: number;
  allTables: Array<{ id: string; label: string }>;
  editable: boolean;
  saving?: boolean;
  onSave: (tableId: string, draft: TableEditDraft) => Promise<boolean>;
  dropdownWidthClass?: string;
}) {
  const { draft, shapeLabel, commitDraft, updateDraft } = useTableMetaDraft({
    tableId,
    tableLabel,
    tableShape,
    capacity,
    assignedCount,
    allTables,
    onSave,
  });

  if (!editable) {
    return (
      <span className="whitespace-nowrap text-xs font-medium text-neutral-700">
        {shapeLabel}
      </span>
    );
  }

  return (
    <div {...stopRowToggleProps} className={dropdownWidthClass}>
      <TableShapeInlineSelect
        value={draft.shape}
        buttonClassName={`${DISTRIBUTION_FIELD_SELECT_BASE_CLASS} w-full`}
        truncateLabel={false}
        onChange={(shape: TableShapeUiId) => {
          const next = { ...draft, shape };
          updateDraft({ shape });
          void commitDraft(next);
        }}
      />
    </div>
  );
}

/** Capacidad editable de la mesa (columna PAX). */
export function DistributionTablePaxEditor({
  tableId,
  tableLabel,
  tableShape,
  capacity,
  assignedCount,
  allTables,
  editable,
  saving,
  onSave,
}: {
  tableId: string;
  tableLabel: string;
  tableShape: string;
  capacity: number;
  assignedCount: number;
  allTables: Array<{ id: string; label: string }>;
  editable: boolean;
  saving?: boolean;
  onSave: (tableId: string, draft: TableEditDraft) => Promise<boolean>;
}) {
  const { draft, error, updateDraft, commitCapacity } = useTableMetaDraft({
    tableId,
    tableLabel,
    tableShape,
    capacity,
    assignedCount,
    allTables,
    onSave,
  });

  if (!editable) {
    return (
      <span className="block text-center text-xs font-medium tabular-nums text-neutral-700">
        {capacity}
      </span>
    );
  }

  return (
    <div {...stopRowToggleProps}>
      <input
        type="number"
        min={TABLE_CAPACITY_MIN}
        max={TABLE_CAPACITY_MAX}
        className={`input-field w-[3.25rem] min-w-0 px-2 py-1 text-center text-xs tabular-nums ${
          error ? 'border-error-500' : ''
        }`}
        value={Number.isFinite(draft.capacity) ? draft.capacity : ''}
        disabled={saving}
        aria-label={`PAX de ${tableLabel}`}
        title={error ?? undefined}
        onChange={(event) => {
          const raw = event.target.value;
          updateDraft({
            capacity: raw === '' ? Number.NaN : Number(raw),
          });
        }}
        onBlur={commitCapacity}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitCapacity();
          }
        }}
      />
    </div>
  );
}
