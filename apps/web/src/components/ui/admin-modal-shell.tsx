'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type AdminModalShellProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  backdropLabel?: string;
  children: ReactNode;
};

/** Backdrop + contenedor centrado para diálogos admin (z-index unificado). */
export function AdminModalShell({
  open,
  busy = false,
  onClose,
  backdropLabel = 'Cerrar',
  children,
}: AdminModalShellProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onClose, open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[110] bg-neutral-900/40"
        aria-label={backdropLabel}
        disabled={busy}
        onClick={onClose}
      />
      <div
        className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none"
        role="presentation"
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
