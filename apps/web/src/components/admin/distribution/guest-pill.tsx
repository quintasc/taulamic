'use client';

import { useEffect, useState } from 'react';

import { setGuestDragData, clearGuestDrag } from '@/lib/distribution-dnd';
import {
  armGuestPointerDrag,
  cancelGuestPointerDrag,
  isGuestPointerDragSessionActive,
  shouldUsePointerGuestDrag,
} from '@/lib/guest-pointer-drag';
import { GUEST_PILL_COPY } from '@/lib/ui-copy';

export function GuestPill({
  name,
  guestId,
  removable = false,
  removing = false,
  draggable = false,
  dragging = false,
  sourceTableId,
  variant = 'pill',
  onRemove,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  name: string;
  guestId?: string;
  removable?: boolean;
  removing?: boolean;
  draggable?: boolean;
  dragging?: boolean;
  sourceTableId?: string;
  variant?: 'pill' | 'row';
  onRemove?: (guestId: string) => void;
  onMove?: (guestId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const [coarsePointer, setCoarsePointer] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(pointer: coarse)');
    const sync = () => setCoarsePointer(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const canRemove = removable && Boolean(guestId) && Boolean(onRemove);
  const canMove = Boolean(guestId) && Boolean(onMove) && !removing;
  const canDrag =
    draggable && Boolean(guestId) && Boolean(sourceTableId) && !removing;
  // HTML5 siempre activo con ratón. Si se desactiva por (pointer:coarse) en
  // híbridos, el ratón no puede arrastrar (solo touch arma el pointer-drag).
  const html5Drag = canDrag;

  const isRow = variant === 'row';

  const pillClass = isRow
    ? `flex min-w-0 items-center justify-between w-full text-xs font-semibold text-neutral-800 ${
        canDrag
          ? `select-none transition-opacity ${coarsePointer ? 'touch-none' : 'cursor-grab active:cursor-grabbing'}`
          : ''
      } ${dragging ? 'opacity-40' : ''}`
    : `inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-50 text-[13px] font-medium text-neutral-800 ${
        canRemove ? 'pl-3 pr-1.5 py-1' : 'px-3 py-1.5'
      } ${
        canDrag
          ? `select-none transition-[border-color,background-color,opacity,box-shadow] hover:border-neutral-300 hover:bg-white ${coarsePointer ? 'touch-none' : 'cursor-grab active:cursor-grabbing'}`
          : ''
      } ${dragging ? 'opacity-45 shadow-sm ring-1 ring-primary-500/25' : ''}`;

  const nameNode = isRow ? (
    <span
      className="min-w-0 flex-1 truncate whitespace-nowrap py-0.5 text-left pr-2"
      title={name}
    >
      {name}
    </span>
  ) : (
    <span className="py-0.5">{name}</span>
  );

  const actionButtons = isRow ? (
    <div className="flex items-center gap-1 shrink-0">
      {canMove ? (
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-primary-600 disabled:opacity-50"
          aria-label={`Mover a ${name}`}
          title={GUEST_PILL_COPY.moveTitle}
          disabled={removing}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onMove?.(guestId!);
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      ) : null}
      {canDrag ? (
        <div className="p-1 text-neutral-300 hover:text-neutral-500 transition cursor-grab active:cursor-grabbing" title="Arrastrar para mover">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </div>
      ) : null}
      {canRemove ? (
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-50"
          aria-label={`Quitar a ${name} de la mesa`}
          title={GUEST_PILL_COPY.removeTitle}
          disabled={removing}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.(guestId!);
          }}
        >
          ×
        </button>
      ) : null}
    </div>
  ) : null;

  if (!canRemove && !canDrag && !canMove) {
    if (isRow) {
      return <div className={pillClass}>{nameNode}</div>;
    }
    return <span className={pillClass}>{nameNode}</span>;
  }

  const dragProps = {
    draggable: html5Drag,
    'aria-label': canDrag ? GUEST_PILL_COPY.dragTitle : undefined,
    onPointerDown: (event: React.PointerEvent) => {
      if (!canDrag || !guestId || !sourceTableId) {
        return;
      }
      if ((event.target as HTMLElement).closest('button')) {
        return;
      }
      if (!shouldUsePointerGuestDrag(event.pointerType)) {
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      armGuestPointerDrag({
        guestId,
        sourceTableId,
        guestName: name,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      });
    },
    onPointerCancel: () => {
      if (!isGuestPointerDragSessionActive()) {
        return;
      }
      cancelGuestPointerDrag();
      onDragEnd?.();
    },
    onDragStart: (event: React.DragEvent) => {
      if (!html5Drag || !guestId || !sourceTableId) {
        event.preventDefault();
        return;
      }
      if (isGuestPointerDragSessionActive()) {
        event.preventDefault();
        return;
      }
      setGuestDragData(event.dataTransfer, {
        guestId,
        sourceTableId,
      });
      onDragStart?.();
      event.stopPropagation();
    },
    onDragEnd: (event: React.DragEvent) => {
      clearGuestDrag();
      onDragEnd?.();
      event.stopPropagation();
    },
  };

  if (isRow) {
    return (
      <div className={`group/pill ${pillClass}`} {...(canDrag ? dragProps : {})}>
        {nameNode}
        {actionButtons}
      </div>
    );
  }

  return (
    <span className={`group/pill ${pillClass}`} {...(canDrag ? dragProps : {})}>
      {nameNode}
      {canRemove ? (
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-50"
          aria-label={`Quitar a ${name} de la mesa`}
          title={GUEST_PILL_COPY.removeTitle}
          disabled={removing}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.(guestId!);
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
