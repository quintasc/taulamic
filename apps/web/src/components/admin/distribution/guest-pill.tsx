'use client';

import { useState } from 'react';

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
  onRemove,
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
  onRemove?: (guestId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const [usePointerDrag, setUsePointerDrag] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches,
  );

  const canRemove = removable && Boolean(guestId) && Boolean(onRemove);
  const canDrag =
    draggable && Boolean(guestId) && Boolean(sourceTableId) && !removing;
  const html5Drag = canDrag && !usePointerDrag;

  const pillClass = `inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-50 text-[13px] font-medium text-neutral-800 ${
    canRemove ? 'pl-3 pr-1.5 py-1' : 'px-3 py-1.5'
  } ${
    canDrag
      ? `select-none transition-[border-color,background-color,opacity,box-shadow] hover:border-neutral-300 hover:bg-white ${usePointerDrag ? 'touch-none' : 'cursor-default'}`
      : ''
  } ${dragging ? 'opacity-45 shadow-sm ring-1 ring-primary-500/25' : ''}`;

  const nameNode = <span className="py-0.5">{name}</span>;

  if (!canRemove && !canDrag) {
    return <span className={pillClass}>{name}</span>;
  }

  return (
    <span
      className={`group/pill ${pillClass}`}
      draggable={html5Drag}
      aria-label={canDrag ? GUEST_PILL_COPY.dragTitle : undefined}
      onPointerDown={(event) => {
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
      }}
      onPointerCancel={() => {
        if (!isGuestPointerDragSessionActive()) {
          return;
        }
        cancelGuestPointerDrag();
        onDragEnd?.();
      }}
      onDragStart={(event) => {
        if (!html5Drag || !guestId || !sourceTableId) {
          event.preventDefault();
          return;
        }
        setGuestDragData(event.dataTransfer, {
          guestId,
          sourceTableId,
        });
        onDragStart?.();
        event.stopPropagation();
      }}
      onDragEnd={(event) => {
        clearGuestDrag();
        onDragEnd?.();
        event.stopPropagation();
      }}
    >
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
