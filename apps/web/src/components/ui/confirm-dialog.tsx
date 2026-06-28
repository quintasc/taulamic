'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirming = false,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    confirmRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !confirming) {
        onCancel();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, confirming, onCancel]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[110] bg-neutral-900/40"
        aria-label="Cerrar diálogo"
        disabled={confirming}
        onClick={onCancel}
      />
      <div
        className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none"
        role="presentation"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="card-admin pointer-events-auto w-full max-w-md shadow-lg"
        >
          <h2
            id={titleId}
            className="text-lg font-semibold text-neutral-900"
          >
            {title}
          </h2>
          <p
            id={descriptionId}
            className="mt-2 text-sm text-neutral-600"
          >
            {description}
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={confirming}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              type="button"
              className={
                destructive
                  ? 'inline-flex items-center justify-center rounded-lg border border-error-500/40 bg-error-500 px-4 py-2 text-sm font-medium text-neutral-0 transition hover:bg-error-500/90 disabled:opacity-40'
                  : 'btn-primary'
              }
              disabled={confirming}
              onClick={onConfirm}
            >
              {confirming ? 'Eliminando…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
