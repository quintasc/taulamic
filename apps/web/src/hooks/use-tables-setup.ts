import { useCallback, useEffect, useState } from 'react';

import { useToast } from '@/components/ui';
import {
  ApiError,
  distributionApi,
  eventsApi,
  tableShapesApi,
  type DistributionProposal,
  type SeatTopology,
} from '@/lib/api';
import { apiTableShape } from '@/components/tables';
import { useEvent } from '@/lib/event-context';
import { getSetupNav } from '@/lib/setup-flow';
import { suggestNextTableLabels } from '@/lib/table-labels';

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
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [savingLabelId, setSavingLabelId] = useState<string | null>(null);

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

  const saveTables = useCallback(async () => {
    if (!eventId) {
      return;
    }
    const count = Math.max(1, Math.min(50, quantity));
    const labels = suggestNextTableLabels(event?.tables ?? [], count);

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
  }, [capacity, event?.tables, eventId, quantity, refreshEvent, shape, toast]);

  const startEditLabel = useCallback((tableId: string, currentLabel: string) => {
    setEditingTableId(tableId);
    setEditingLabel(currentLabel);
  }, []);

  const cancelEditLabel = useCallback(() => {
    setEditingTableId(null);
    setEditingLabel('');
  }, []);

  const saveEditedLabel = useCallback(
    async (tableId: string) => {
      if (!eventId) {
        return;
      }
      const table = event?.tables.find((item) => item.id === tableId);
      if (!table) {
        return;
      }

      const trimmed = editingLabel.trim();
      if (!trimmed) {
        toast.error('La etiqueta no puede estar vacía.');
        return;
      }

      const duplicate = event?.tables.some(
        (item) => item.id !== tableId && item.label.trim() === trimmed,
      );
      if (duplicate) {
        toast.error('Ya existe otra mesa con esa etiqueta.');
        return;
      }

      setSavingLabelId(tableId);
      try {
        await eventsApi.updateTable(eventId, tableId, {
          label: trimmed,
          shape: table.shape,
          estimatedCapacity: table.capacity,
        });
        await refreshEvent();
        cancelEditLabel();
        toast.success(`Mesa renombrada a «${trimmed}».`);
      } catch {
        toast.error('No se pudo actualizar la etiqueta.');
      } finally {
        setSavingLabelId(null);
      }
    },
    [cancelEditLabel, editingLabel, event?.tables, eventId, refreshEvent, toast],
  );

  const removeTable = useCallback(
    async (tableId: string) => {
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
      try {
        await eventsApi.removeTable(eventId, tableId);
        await refreshEvent();
        toast.success(`Mesa «${table?.label ?? 'Mesa'}» eliminada.`);
        try {
          const updatedDistribution = await distributionApi.get(eventId);
          setDistribution(updatedDistribution);
        } catch (err: unknown) {
          if (err instanceof ApiError && err.status === 404) {
            setDistribution(null);
          }
        }
      } catch {
        toast.error('No se pudo eliminar la mesa.');
      } finally {
        setRemovingTableId(null);
      }
    },
    [distribution, event?.tables, eventId, refreshEvent, toast],
  );

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
  };
}
