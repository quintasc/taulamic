'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconMail,
  IconMoreVertical,
  IconTrash,
} from '@/components/icons';

const BULK_MENU_EST_HEIGHT = 280;

const BULK_POST_PILOT_ACTIONS = [
  { id: 'export', label: 'Exportar selección' },
  { id: 'send', label: 'Enviar invitaciones' },
  { id: 'reminder', label: 'Recordatorio RSVP' },
  { id: 'category', label: 'Asignar categoría' },
] as const;

function BulkActionsMenu({
  onDelete,
  onClose,
  deleting,
}: {
  onDelete: () => void;
  onClose: () => void;
  deleting: boolean;
}) {
  return (
    <div
      className="max-h-[min(70vh,20rem)] min-w-[220px] overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-0 py-1 shadow-lg"
      role="menu"
    >
      {BULK_POST_PILOT_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled
          title="Próximamente — no operativo en piloto"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-400"
        >
          <IconMail width={14} height={14} className="opacity-50" />
          {action.label}
        </button>
      ))}
      <div className="my-1 border-t border-neutral-100" />
      <button
        type="button"
        disabled={deleting}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error-500 hover:bg-error-500/5 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <IconTrash width={14} height={14} />
        {deleting ? 'Eliminando…' : 'Eliminar selección'}
      </button>
    </div>
  );
}

function useDismissBulkMenu(
  menuRef: React.RefObject<HTMLElement | null>,
  triggerRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointer(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }
      if (triggerRef.current?.contains(target)) {
        return;
      }
      onClose();
    }
    function handleResize() {
      onClose();
    }
    document.addEventListener('mousedown', handlePointer);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('resize', handleResize);
    };
  }, [menuRef, onClose, open, triggerRef]);
}

function BulkActionsMenuPortal({
  triggerRef,
  onDelete,
  onClose,
  deleting,
}: {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onDelete: () => void;
  onClose: () => void;
  deleting: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useDismissBulkMenu(menuRef, triggerRef, true, onClose);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? BULK_MENU_EST_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight + 8;

    setStyle({
      left: rect.right,
      transform: 'translateX(-100%)',
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [triggerRef]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    function handleScroll(event: Event) {
      const target = event.target;
      if (target instanceof Node && menuRef.current?.contains(target)) {
        return;
      }
      updatePosition();
    }
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [updatePosition]);

  if (typeof document === 'undefined' || !style) {
    return null;
  }

  return createPortal(
    <div ref={menuRef} className="fixed z-50" style={style}>
      <BulkActionsMenu
        deleting={deleting}
        onDelete={onDelete}
        onClose={onClose}
      />
    </div>,
    document.body,
  );
}

export function GuestsBulkSelectionToolbar({
  totalSelectedCount,
  visibleSelectedCount,
  onClear,
  onDelete,
  deleting = false,
}: {
  totalSelectedCount: number;
  visibleSelectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  if (totalSelectedCount === 0) {
    return null;
  }

  const countLabel =
    visibleSelectedCount !== totalSelectedCount
      ? `${totalSelectedCount} seleccionado${totalSelectedCount === 1 ? '' : 's'} (${visibleSelectedCount} visible${visibleSelectedCount === 1 ? '' : 's'})`
      : `${totalSelectedCount} seleccionado${totalSelectedCount === 1 ? '' : 's'}`;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-wf-3 bg-wf-2 px-3 py-2">
      <p className="text-sm text-neutral-700">
        <span className="font-medium text-neutral-900">{countLabel}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
          onClick={onClear}
          disabled={deleting}
        >
          Limpiar selección
        </button>
        <button
          ref={triggerRef}
          type="button"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-0 px-2.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          title="Más acciones sobre la selección"
          aria-label="Más acciones sobre la selección"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          disabled={deleting}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <IconMoreVertical width={16} height={16} className="text-neutral-500" />
          Más acciones
        </button>
        {menuOpen ? (
          <BulkActionsMenuPortal
            triggerRef={triggerRef}
            deleting={deleting}
            onDelete={onDelete}
            onClose={closeMenu}
          />
        ) : null}
      </div>
    </div>
  );
}
