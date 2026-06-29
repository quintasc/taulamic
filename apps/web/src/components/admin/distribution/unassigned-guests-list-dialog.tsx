'use client';

import Link from 'next/link';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { UnassignedGuestOption } from '@/lib/distribution-view';

export function UnassignedGuestsListDialog({
  open,
  guests,
  distributionHref,
  onClose,
}: {
  open: boolean;
  guests: UnassignedGuestOption[];
  distributionHref?: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[110] bg-neutral-900/40"
        aria-label="Cerrar lista"
        onClick={onClose}
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
            Invitados sin asignar
          </h2>
          <p id={descriptionId} className="mt-2 text-sm text-neutral-600">
            {guests.length === 1
              ? '1 invitado pendiente de mesa.'
              : `${guests.length} invitados pendientes de mesa.`}
          </p>

          <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
            {guests.length > 0 ? (
              guests.map((guest) => (
                <li
                  key={guest.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-3 text-sm font-medium text-neutral-900"
                >
                  {guest.nombre}
                </li>
              ))
            ) : (
              <li className="text-sm text-neutral-500">
                Todos los invitados tienen mesa asignada.
              </li>
            )}
          </ul>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            {distributionHref && guests.length > 0 ? (
              <Link href={distributionHref} className="btn-primary">
                Asignar en distribución
              </Link>
            ) : null}
            <button
              ref={closeRef}
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
