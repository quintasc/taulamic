'use client';

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  cancelGuestPointerDrag,
  endGuestPointerDrag,
  getGuestPointerDragSnapshot,
  isGuestPointerDragSessionActive,
  moveGuestPointerDrag,
  subscribeGuestPointerDrag,
} from '@/lib/guest-pointer-drag';

function GuestDragGhost() {
  const snapshot = useSyncExternalStore(
    subscribeGuestPointerDrag,
    getGuestPointerDragSnapshot,
    () => null,
  );

  if (!snapshot?.active) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed z-[200] max-w-[12rem] truncate rounded-full border border-primary-500 bg-neutral-0 px-3 py-1.5 text-[13px] font-medium text-neutral-900 shadow-lg"
      style={{
        left: snapshot.x,
        top: snapshot.y,
        transform: 'translate(-50%, -50%)',
      }}
      aria-hidden
    >
      {snapshot.guestName}
    </div>
  );
}

export function GuestPointerDragLayer({
  onDrop,
  onDragStart,
  onDragEnd,
  children,
}: {
  onDrop: (guestId: string, targetTableId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  children: ReactNode;
}) {
  const dragStartedRef = useRef(false);
  const onDropRef = useRef(onDrop);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);

  onDropRef.current = onDrop;
  onDragStartRef.current = onDragStart;
  onDragEndRef.current = onDragEnd;

  useEffect(() => {
    const previousTouchAction = document.body.style.touchAction;

    function onPointerMove(event: PointerEvent) {
      if (!isGuestPointerDragSessionActive()) {
        return;
      }
      moveGuestPointerDrag(event.clientX, event.clientY);
      const snapshot = getGuestPointerDragSnapshot();
      if (snapshot?.active && !dragStartedRef.current) {
        dragStartedRef.current = true;
        document.body.style.touchAction = 'none';
        onDragStartRef.current?.();
      }
    }

    function finishDrag() {
      const hadActiveDrag = Boolean(getGuestPointerDragSnapshot()?.active);
      const result = endGuestPointerDrag();
      document.body.style.touchAction = previousTouchAction;
      dragStartedRef.current = false;
      if (result) {
        onDropRef.current(result.guestId, result.targetTableId);
      }
      if (hadActiveDrag) {
        onDragEndRef.current?.();
      }
    }

    function onPointerUp() {
      if (!isGuestPointerDragSessionActive()) {
        return;
      }
      finishDrag();
    }

    function onPointerCancel() {
      if (!isGuestPointerDragSessionActive()) {
        return;
      }
      const hadActiveDrag = Boolean(getGuestPointerDragSnapshot()?.active);
      cancelGuestPointerDrag();
      document.body.style.touchAction = previousTouchAction;
      dragStartedRef.current = false;
      if (hadActiveDrag) {
        onDragEndRef.current?.();
      }
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      document.body.style.touchAction = previousTouchAction;
      if (isGuestPointerDragSessionActive()) {
        cancelGuestPointerDrag();
      }
      dragStartedRef.current = false;
    };
  }, []);

  return (
    <>
      {children}
      <GuestDragGhost />
    </>
  );
}
