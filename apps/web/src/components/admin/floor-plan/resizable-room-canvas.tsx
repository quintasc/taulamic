'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { FloorPlanAccessoriesOverlay } from '@/components/admin/floor-plan/floor-plan-accessories-overlay';
import {
  RESIZE_DRAG_THRESHOLD_PX,
  patchFromDragResize,
  resolveRoomResizeAxis,
  roomDisplayRefSideM,
  roomPixelSize,
  type FloorPlanSetup,
  type RoomResizeAxis,
} from '@/lib/floor-plan-setup';

const HANDLE_SIZE_PX = 20;

type DragSession = {
  startX: number;
  startY: number;
  startSetup: FloorPlanSetup;
  startWidthPx: number;
  startHeightPx: number;
  frozenRefSideM: number;
  axis: RoomResizeAxis | null;
};

function roundHandlePosition(diameterPx: number): CSSProperties {
  const radiusPx = diameterPx / 2;
  const offset = radiusPx * Math.SQRT1_2;

  return {
    left: radiusPx + offset - HANDLE_SIZE_PX / 2,
    top: radiusPx + offset - HANDLE_SIZE_PX / 2,
  };
}

function ResizeHandle({
  onPointerDown,
  style,
}: {
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      aria-label="Redimensionar salón"
      className="absolute z-20 h-5 w-5 cursor-se-resize rounded-sm border-2 border-primary-500 bg-neutral-0 shadow-md touch-none"
      style={style}
      onPointerDown={onPointerDown}
    />
  );
}

export function ResizableRoomCanvas({
  setup,
  onChange,
}: {
  setup: FloorPlanSetup;
  onChange: (patch: Partial<FloorPlanSetup>) => void;
}) {
  const dragSessionRef = useRef<DragSession | null>(null);
  /** Escala congelada al iniciar el gesto; se mantiene al soltar para no saltar el tamaño. */
  const [displayRefSideM, setDisplayRefSideM] = useState<number | undefined>();
  const { widthPx, heightPx } = roomPixelSize(setup, 400, displayRefSideM);

  useEffect(() => {
    setDisplayRefSideM(undefined);
  }, [setup.shape]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);

      const refSideM = displayRefSideM ?? roomDisplayRefSideM(setup);
      const { widthPx: startWidthPx, heightPx: startHeightPx } = roomPixelSize(
        setup,
        400,
        refSideM,
      );

      dragSessionRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startSetup: setup,
        startWidthPx,
        startHeightPx,
        frozenRefSideM: refSideM,
        axis: null,
      };
      setDisplayRefSideM(refSideM);

      const onMove = (moveEvent: PointerEvent) => {
        const session = dragSessionRef.current;
        if (!session) {
          return;
        }

        const totalDxPx = moveEvent.clientX - session.startX;
        const totalDyPx = moveEvent.clientY - session.startY;

        if (session.axis === null) {
          if (
            Math.abs(totalDxPx) < RESIZE_DRAG_THRESHOLD_PX &&
            Math.abs(totalDyPx) < RESIZE_DRAG_THRESHOLD_PX
          ) {
            return;
          }
          session.axis = resolveRoomResizeAxis(totalDxPx, totalDyPx);
        }

        onChange(
          patchFromDragResize(
            session.startSetup,
            session.startWidthPx,
            session.startHeightPx,
            totalDxPx,
            totalDyPx,
            session.axis,
          ),
        );
      };

      const onUp = (upEvent: PointerEvent) => {
        dragSessionRef.current = null;
        if (handle.hasPointerCapture(upEvent.pointerId)) {
          handle.releasePointerCapture(upEvent.pointerId);
        }
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [displayRefSideM, onChange, setup],
  );

  const handleStyle: CSSProperties =
    setup.shape === 'round'
      ? roundHandlePosition(widthPx)
      : {
          right: 4,
          bottom: 4,
        };

  return (
    <div className="overflow-visible p-3">
      <div className="relative" style={{ width: widthPx, height: heightPx }}>
        <div
          className={`relative h-full w-full overflow-hidden border-2 border-neutral-400 bg-neutral-50/90 shadow-sm ${
            setup.shape === 'round'
              ? 'rounded-full'
              : setup.shape === 'oval'
                ? 'rounded-[50%]'
                : 'rounded-xl'
          }`}
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <p className="text-center text-xs font-medium text-neutral-500">
              {setup.shape === 'round'
                ? 'Arrastra el marcador para cambiar el radio'
                : 'Arrastra el marcador: horizontal (ancho), vertical (largo) o diagonal (ambos a la vez)'}
            </p>
          </div>
          <FloorPlanAccessoriesOverlay accessoryIds={setup.placedAccessories} />
        </div>
        <ResizeHandle onPointerDown={handlePointerDown} style={handleStyle} />
      </div>
    </div>
  );
}
