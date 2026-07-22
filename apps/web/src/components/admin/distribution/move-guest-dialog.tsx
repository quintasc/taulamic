'use client';

import { useEffect, useId, useMemo, useState } from 'react';

import { AdminModalShell } from '@/components/ui/admin-modal-shell';
import { CustomSelect } from '@/components/ui/custom-select';
import { chairIdToSeatIndex } from '@/lib/guest-chair-mappings';

export type MoveGuestTableOption = {
  tableId: string;
  tableLabel: string;
  capacity: number;
  freeSeats: number;
  occupiedSeats: Record<string, { guestId: string; guestName: string }>;
};

export function MoveGuestDialog({
  open,
  guestId,
  guestName,
  sourceTableId,
  sourceChairId,
  tables,
  movingGuestId,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  guestId: string;
  guestName: string;
  sourceTableId: string;
  sourceChairId: string | null;
  tables: MoveGuestTableOption[];
  movingGuestId: string | null;
  onConfirm: (targetTableId: string, seatIndex: number) => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [targetTableId, setTargetTableId] = useState(sourceTableId);
  const [targetChairId, setTargetChairId] = useState(sourceChairId ?? '');

  const selectedTable = useMemo(
    () => tables.find((table) => table.tableId === targetTableId) ?? null,
    [tables, targetTableId],
  );

  const seatOptions = useMemo(() => {
    if (!selectedTable) {
      return [];
    }

    return Array.from({ length: selectedTable.capacity }, (_, index) => {
      const chairId = `S${index + 1}`;
      const occupant = selectedTable.occupiedSeats[chairId];

      return {
        chairId,
        seatIndex: index,
        occupant,
        isCurrent:
          occupant !== undefined && occupant.guestId === guestId,
        isSwap:
          occupant !== undefined && occupant.guestId !== guestId,
      };
    });
  }, [guestId, selectedTable]);

  const tableSelectOptions = useMemo(
    () =>
      tables.map((table) => ({
        value: table.tableId,
        label: `${table.tableLabel}${table.tableId === sourceTableId ? ' (actual)' : ''}`,
        hint:
          table.freeSeats > 0
            ? `${table.freeSeats} libre${table.freeSeats === 1 ? '' : 's'}`
            : table.tableId === sourceTableId
              ? undefined
              : 'Intercambiar',
      })),
    [sourceTableId, tables],
  );

  const seatSelectOptions = useMemo(
    () =>
      seatOptions.map((option) => ({
        value: option.chairId,
        label: option.isCurrent
          ? `${option.chairId} (actual)`
          : option.occupant
            ? `${option.chairId} · Intercambiar con ${option.occupant.guestName}`
            : `${option.chairId} · Libre`,
      })),
    [seatOptions],
  );

  const preferredChairId = useMemo(() => {
    const free = seatOptions.find((option) => !option.occupant);
    if (free) {
      return free.chairId;
    }
    const swap = seatOptions.find((option) => option.isSwap);
    return swap?.chairId ?? seatOptions[0]?.chairId ?? '';
  }, [seatOptions]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTargetTableId(sourceTableId);
    setTargetChairId(sourceChairId ?? '');
  }, [open, sourceChairId, sourceTableId]);

  useEffect(() => {
    if (!open || !selectedTable) {
      return;
    }

    const currentValid = seatOptions.some(
      (option) => option.chairId === targetChairId,
    );
    if (!currentValid) {
      setTargetChairId(preferredChairId);
    }
  }, [open, preferredChairId, seatOptions, selectedTable, targetChairId]);

  const seatIndex = chairIdToSeatIndex(targetChairId);
  const selectedSeat = seatOptions.find(
    (option) => option.chairId === targetChairId,
  );
  const isSwap = Boolean(selectedSeat?.isSwap);
  const isSameSeat = Boolean(selectedSeat?.isCurrent);
  const busy = Boolean(movingGuestId);
  const canConfirm =
    selectedTable !== null &&
    seatIndex !== null &&
    selectedSeat !== undefined &&
    !isSameSeat;

  return (
    <AdminModalShell
      open={open}
      busy={busy}
      onClose={onCancel}
      backdropLabel="Cerrar mover invitado"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="card-admin pointer-events-auto w-full max-w-md shadow-lg"
      >
          <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
            Mover o intercambiar
          </h2>
          <p id={descriptionId} className="mt-2 text-sm text-neutral-600">
            Elige mesa y silla para{' '}
            <span className="font-medium text-neutral-800">{guestName}</span>.
            Si la silla está ocupada, se intercambiarán los asientos.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label
                id={`${titleId}-table-label`}
                htmlFor={`${titleId}-table`}
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
              >
                Mesa
              </label>
              <CustomSelect
                id={`${titleId}-table`}
                aria-labelledby={`${titleId}-table-label`}
                value={targetTableId}
                disabled={Boolean(movingGuestId)}
                onChange={setTargetTableId}
                options={tableSelectOptions}
                placeholder="Selecciona una mesa…"
              />
            </div>

            <div>
              <label
                id={`${titleId}-seat-label`}
                htmlFor={`${titleId}-seat`}
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
              >
                Silla
              </label>
              <CustomSelect
                id={`${titleId}-seat`}
                aria-labelledby={`${titleId}-seat-label`}
                value={targetChairId}
                disabled={Boolean(movingGuestId) || seatOptions.length === 0}
                onChange={setTargetChairId}
                options={seatSelectOptions}
                placeholder="Selecciona una silla…"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={Boolean(movingGuestId)}
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!canConfirm || Boolean(movingGuestId)}
              onClick={() => {
                if (seatIndex === null) {
                  return;
                }
                onConfirm(targetTableId, seatIndex);
              }}
            >
              {movingGuestId
                ? isSwap
                  ? 'Intercambiando…'
                  : 'Moviendo…'
                : isSwap
                  ? 'Intercambiar'
                  : 'Mover'}
            </button>
          </div>
        </div>
    </AdminModalShell>
  );
}
