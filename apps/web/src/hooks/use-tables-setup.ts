import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/components/ui';
import { apiTableShape } from '@/components/tables';
import {
  ApiError,
  distributionApi,
  eventsApi,
  tableShapesApi,
  type DistributionProposal,
  type SeatTopology,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { getSetupNav } from '@/lib/setup-flow';
import { suggestNextTableLabels } from '@/lib/table-labels';
import {
  apiShapeFromUi,
  draftFromTable,
  getTableAssignedGuestCount,
  tableDraftEquals,
  tableMatchesDraft,
  type TableEditDraft,
  validateTableDraft,
} from '@/lib/table-form';

export function useTablesSetup() {
  const toast = useToast();
  const { event, eventId, refreshEvent } = useEvent();
  const setupNav = eventId ? getSetupNav(eventId, 'tables') : null;

  const [shape, setShape] = useState('redonda');
  const [capacity, setCapacity] = useState(8);
  const [quantity, setQuantity] = useState(1);
  const [topology, setTopology] = useState<SeatTopology | null>(null);
  const [distribution, setDistribution] = useState<DistributionProposal | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [removingTableId, setRemovingTableId] = useState<string | null>(null);
  const [bulkRemoving, setBulkRemoving] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<TableEditDraft | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<TableEditDraft | null>(
    null,
  );
  const [editError, setEditError] = useState<string | null>(null);
  const [savingTableId, setSavingTableId] = useState<string | null>(null);
  const [pendingRemoveTableIds, setPendingRemoveTableIds] = useState<
    string[] | null
  >(null);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<string>>(
    () => new Set(),
  );

  const tables = event?.tables ?? [];
  const previewLabels = suggestNextTableLabels(tables, Math.max(1, quantity));

  const assignedGuestCountForTable = useCallback(
    (tableId: string) =>
      getTableAssignedGuestCount(distribution?.placements, tableId),
    [distribution?.placements],
  );

  const validateDraft = useCallback(
    (tableId: string, draft: TableEditDraft) =>
      validateTableDraft(
        tableId,
        draft,
        tables,
        assignedGuestCountForTable(tableId),
      ),
    [assignedGuestCountForTable, tables],
  );

  useEffect(() => {
    setSelectedTableIds((current) => {
      const valid = new Set(tables.map((table) => table.id));
      const next = new Set([...current].filter((id) => valid.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [tables]);

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

  const saveTables = useCallback(async () => {
    if (!eventId) {
      return;
    }
    const count = Math.max(1, Math.min(50, quantity));
    const labels = suggestNextTableLabels(tables, count);

    setSaving(true);
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
      if (count === 1) {
        toast.success(`Mesa «${labels[0]}» añadida.`);
      } else {
        toast.success(`${count} mesas añadidas.`);
      }
    } catch {
      toast.error('No se pudieron añadir las mesas.');
    } finally {
      setSaving(false);
    }
  }, [capacity, eventId, quantity, refreshEvent, shape, tables, toast]);

  const exitTableEdit = useCallback(() => {
    setEditingTableId(null);
    setEditingDraft(null);
    setEditingOriginal(null);
    setEditError(null);
  }, []);

  const persistTableEdit = useCallback(
    async (tableId: string, draft: TableEditDraft) => {
      if (!eventId) {
        return false;
      }
      const table = tables.find((item) => item.id === tableId);
      if (!table || tableMatchesDraft(table, draft)) {
        return true;
      }

      const validationError = validateDraft(tableId, draft);
      if (validationError) {
        return false;
      }

      setSavingTableId(tableId);
      try {
        await eventsApi.updateTable(eventId, tableId, {
          label: draft.label.trim(),
          shape: apiShapeFromUi(draft.shape),
          estimatedCapacity: draft.capacity,
        });
      await refreshEvent({ silent: true });
      if (editingTableId === tableId) {
        setEditingOriginal({
          label: draft.label.trim(),
          shape: draft.shape,
          capacity: draft.capacity,
        });
      }
      return true;
      } catch {
        toast.error('No se pudo actualizar la mesa.');
        return false;
      } finally {
        setSavingTableId(null);
      }
    },
    [editingTableId, eventId, refreshEvent, tables, toast, validateDraft],
  );

  const persistTableEditRef = useRef(persistTableEdit);
  persistTableEditRef.current = persistTableEdit;

  const startEditTable = useCallback(
    (tableId: string) => {
      if (editingTableId === tableId || editError !== null) {
        return;
      }
      const table = tables.find((item) => item.id === tableId);
      if (!table) {
        return;
      }
      const draft = draftFromTable(table);
      setEditingTableId(tableId);
      setEditingDraft(draft);
      setEditingOriginal(draft);
      setEditError(null);
    },
    [editError, editingTableId, tables],
  );

  const updateEditingDraft = useCallback(
    (patch: Partial<TableEditDraft>) => {
      if (!editingTableId) {
        return;
      }
      setEditingDraft((prev) => {
        if (!prev) {
          return prev;
        }
        const next = { ...prev, ...patch };
        setEditError(validateDraft(editingTableId, next));
        return next;
      });
    },
    [editingTableId, validateDraft],
  );

  const undoTableEdit = useCallback(() => {
    if (editingOriginal) {
      setEditingDraft(editingOriginal);
    }
    setEditError(null);
    exitTableEdit();
  }, [editingOriginal, exitTableEdit]);

  const tryFinishTableEdit = useCallback(async () => {
    if (!editingTableId || !editingDraft || !editingOriginal) {
      return true;
    }
    const error = validateDraft(editingTableId, editingDraft);
    if (error) {
      setEditError(error);
      return false;
    }
    if (tableDraftEquals(editingDraft, editingOriginal)) {
      exitTableEdit();
      return true;
    }
    const ok = await persistTableEdit(editingTableId, editingDraft);
    if (ok) {
      exitTableEdit();
    }
    return ok;
  }, [
    editingDraft,
    editingOriginal,
    editingTableId,
    exitTableEdit,
    persistTableEdit,
    validateDraft,
    tables,
  ]);

  useEffect(() => {
    if (!editingTableId || !eventId || !editingDraft || editError) {
      return;
    }
    const table = tables.find((item) => item.id === editingTableId);
    if (!table || tableMatchesDraft(table, editingDraft)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void persistTableEditRef.current(editingTableId, editingDraft);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [editError, editingDraft, editingTableId, eventId, tables]);

  const toggleTableSelection = useCallback((tableId: string) => {
    setSelectedTableIds((current) => {
      const next = new Set(current);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  }, []);

  const toggleSelectAllTables = useCallback(() => {
    setSelectedTableIds((current) => {
      if (current.size === tables.length) {
        return new Set();
      }
      return new Set(tables.map((table) => table.id));
    });
  }, [tables]);

  const clearTableSelection = useCallback(() => {
    setSelectedTableIds(new Set());
  }, []);

  const cancelRemoveTables = useCallback(() => {
    setPendingRemoveTableIds(null);
  }, []);

  const executeRemoveTables = useCallback(
    async (tableIds: string[]) => {
      if (!eventId || tableIds.length === 0) {
        return;
      }

      const isBulk = tableIds.length > 1;
      if (isBulk) {
        setBulkRemoving(true);
      } else {
        setRemovingTableId(tableIds[0] ?? null);
      }

      try {
        for (const tableId of tableIds) {
          await eventsApi.removeTable(eventId, tableId);
        }
        await refreshEvent();
        setSelectedTableIds((current) => {
          const next = new Set(current);
          for (const tableId of tableIds) {
            next.delete(tableId);
          }
          return next;
        });
        if (editingTableId && tableIds.includes(editingTableId)) {
          exitTableEdit();
        }
        const count = tableIds.length;
        if (count === 1) {
          const table = tables.find((item) => item.id === tableIds[0]);
          toast.success(`Mesa «${table?.label ?? 'Mesa'}» eliminada.`);
        } else {
          toast.success(`${count} mesas eliminadas.`);
        }
        try {
          const updatedDistribution = await distributionApi.get(eventId);
          setDistribution(updatedDistribution);
        } catch (err: unknown) {
          if (err instanceof ApiError && err.status === 404) {
            setDistribution(null);
          }
        }
      } catch {
        toast.error(
          tableIds.length === 1
            ? 'No se pudo eliminar la mesa.'
            : 'No se pudieron eliminar las mesas seleccionadas.',
        );
      } finally {
        setRemovingTableId(null);
        setBulkRemoving(false);
      }
    },
    [editingTableId, eventId, exitTableEdit, refreshEvent, tables, toast],
  );

  const requestRemoveTables = useCallback(
    (tableIds: string[]) => {
      if (!eventId || tableIds.length === 0 || editError !== null) {
        return;
      }

      const uniqueIds = [...new Set(tableIds)];
      const hasDraftDistribution =
        distribution !== null && distribution.status === 'draft';
      const withAssignments = hasDraftDistribution
        ? uniqueIds.filter(
            (tableId) =>
              (distribution?.placements.filter(
                (placement) => placement.tableId === tableId,
              ).length ?? 0) > 0,
          )
        : [];

      if (withAssignments.length > 0) {
        setPendingRemoveTableIds(uniqueIds);
        return;
      }

      void executeRemoveTables(uniqueIds);
    },
    [distribution, editError, eventId, executeRemoveTables],
  );

  const removeTable = useCallback(
    (tableId: string) => {
      requestRemoveTables([tableId]);
    },
    [requestRemoveTables],
  );

  const removeSelectedTables = useCallback(() => {
    requestRemoveTables([...selectedTableIds]);
  }, [requestRemoveTables, selectedTableIds]);

  const confirmRemoveTables = useCallback(async () => {
    if (!pendingRemoveTableIds?.length) {
      return;
    }
    const ids = pendingRemoveTableIds;
    setPendingRemoveTableIds(null);
    await executeRemoveTables(ids);
  }, [executeRemoveTables, pendingRemoveTableIds]);

  return {
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
    savingTableId,
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
  };
}
