'use client';

import { useCallback, useRef, type CSSProperties } from 'react';
import { FloorPlanAccessoriesOverlay } from '@/components/admin/floor-plan/floor-plan-accessories-overlay';
import {
  patchFromPixelResize,
  roomPixelSize,
  type FloorPlanSetup,
} from '@/lib/floor-plan-setup';

const HANDLE_SIZE_PX = 20;

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
  const setupRef = useRef(setup);
  setupRef.current = setup;

  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const { widthPx, heightPx } = roomPixelSize(setup);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      dragRef.current = { x: event.clientX, y: event.clientY };

      const onMove = (moveEvent: PointerEvent) => {
        if (!dragRef.current) {
          return;
        }
        const deltaWidthPx = moveEvent.clientX - dragRef.current.x;
        const deltaHeightPx = moveEvent.clientY - dragRef.current.y;
        dragRef.current = { x: moveEvent.clientX, y: moveEvent.clientY };

        const current = setupRef.current;
        const { metersPerPx } = roomPixelSize(current);
        onChange(
          patchFromPixelResize(current, deltaWidthPx, deltaHeightPx, metersPerPx),
        );
      };

      const onUp = (upEvent: PointerEvent) => {
        dragRef.current = null;
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
    [onChange],
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
              Arrastra el marcador para ajustar
            </p>
          </div>
          <FloorPlanAccessoriesOverlay accessoryIds={setup.placedAccessories} />
        </div>
        <ResizeHandle onPointerDown={handlePointerDown} style={handleStyle} />
      </div>
    </div>
  );
}
