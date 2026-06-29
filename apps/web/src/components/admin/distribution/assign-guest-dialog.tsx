'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export type AssignGuestOption = {
  id: string;
  nombre: string;
};

export function AssignGuestDialog({
  open,
  tableLabel,
  guests,
  assigningGuestId,
  onAssign,
  onCancel,
}: {
  open: boolean;
  tableLabel: string;
  guests: AssignGuestOption[];
  assigningGuestId: string | null;
  onAssign: (guestId: string) => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    listRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !assigningGuestId) {
        onCancel();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, assigningGuestId, onCancel]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[110] bg-neutral-900/40"
        aria-label="Cerrar selector"
        disabled={Boolean(assigningGuestId)}
        onClick={onCancel}
      />
      <div
        className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none"
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="card-admin pointer-events-auto w-full max-w-md shadow-lg"
        >
          <h2
            id={titleId}
            className="text-lg font-semibold text-neutral-900"
          >
            Añadir invitado
          </h2>
          <p id={descriptionId} className="mt-2 text-sm text-neutral-600">
            Mesa <span className="font-medium text-neutral-800">{tableLabel}</span>
            . Elige un invitado sin asignar.
          </p>

          <div
            ref={listRef}
            className="mt-4 max-h-56 space-y-2 overflow-y-auto"
          >
            {guests.length > 0 ? (
              guests.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-3 text-left text-sm font-medium text-neutral-900 transition hover:border-primary-500/40 hover:bg-primary-500/5 disabled:opacity-50"
                  disabled={Boolean(assigningGuestId)}
                  onClick={() => onAssign(guest.id)}
                >
                  <span>{guest.nombre}</span>
                  {assigningGuestId === guest.id ? (
                    <span className="text-xs text-neutral-500">Asignando…</span>
                  ) : null}
                </button>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                No hay invitados sin asignar.
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="btn-secondary"
              disabled={Boolean(assigningGuestId)}
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
