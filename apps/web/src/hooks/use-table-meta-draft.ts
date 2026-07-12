'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  draftFromTable,
  tableMatchesDraft,
  type TableEditDraft,
  validateTableDraft,
} from '@/lib/table-form';
import { formatTableShapeLabel } from '@/lib/distribution-view';

export function useTableMetaDraft({
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
