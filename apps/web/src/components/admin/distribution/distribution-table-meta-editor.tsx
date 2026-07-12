'use client';

import { useCallback, useEffect, useState } from 'react';

import { TableShapeInlineSelect } from '@/components/admin/tables/table-shape-inline-select';
import {
  TABLE_CAPACITY_MAX,
  TABLE_CAPACITY_MIN,
  draftFromTable,
  tableMatchesDraft,
  type TableEditDraft,
  type TableShapeUiId,
  validateTableDraft,
} from '@/lib/table-form';
import { formatTableShapeLabel } from '@/lib/distribution-view';

const DISTRIBUTION_FIELD_SELECT_BASE_CLASS =
  'input-field flex min-w-0 items-center justify-between gap-1 whitespace-nowrap py-1 pl-2 pr-6 text-xs capitalize';

function useTableMetaDraft({
  tableId,
  tableLabel,
  tableShape,
  capacity,
  assignedCount,
  allTables,
  onSave,
}: {
  tableId: string;
  tableLabel: string;
  tableShape: string;
  capacity: number;
  assignedCount: number;
  allTables: Array<{ id: string; label: string }>;
  onSave: (tableId: string, draft: TableEditDraft) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<TableEditDraft>(() =>
    draftFromTable({ label: tableLabel, shape: tableShape, capacity }),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(draftFromTable({ label: tableLabel, shape: tableShape, capacity }));
    setError(null);
  }, [capacity, tableId, tableLabel, tableShape]);

  const commitDraft = useCallback(
    async (next: TableEditDraft) => {
      const validationError = validateTableDraft(
        tableId,
        next,
        allTables,
        assignedCount,
      );
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      if (
        tableMatchesDraft(
          { label: tableLabel, shape: tableShape, capacity },
          next,
        )
      ) {
        return;
      }

      const saved = await onSave(tableId, next);
      if (!saved) {
        setDraft(
          draftFromTable({ label: tableLabel, shape: tableShape, capacity }),
        );
      }
    },
    [allTables, assignedCount, capacity, onSave, tableId, tableLabel, tableShape],
  );

  const updateDraft = useCallback(
    (patch: Partial<TableEditDraft>) => {
      const next = { ...draft, ...patch };
      setDraft(next);
      setError(validateTableDraft(tableId, next, allTables, assignedCount));
    },
    [allTables, assignedCount, draft, tableId],
  );

  const commitCapacity = useCallback(() => {
    if (!error) {
      void commitDraft({ ...draft, label: tableLabel });
    }
  }, [commitDraft, draft, error, tableLabel]);

  return {
    draft,
    error,
    updateDraft,
    commitDraft,
    commitCapacity,
    shapeLabel: formatTableShapeLabel(tableShape),
  };
}

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

/** @deprecated Usar DistributionTablePaxEditor */
export const DistributionTableCapacityEditor = DistributionTablePaxEditor;
