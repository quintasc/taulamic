'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { FloorPlanAccessoriesOverlay } from '@/components/admin/floor-plan/floor-plan-accessories-overlay';
import {
  canvasTierEdgePaddingPx,
  canvasTierUsesPortraitLayout,
  useLayoutCanvasTier,
  useRoomCanvasBounds,
  type CanvasLayoutTier,
} from '@/components/admin/floor-plan/use-room-canvas-max-px';
import {
  RESIZE_DRAG_THRESHOLD_PX,
  ROOM_CANVAS_COMPACT_PADDING_PX,
  ROOM_CANVAS_HANDLE_PADDING_PX,
  patchFromDragResize,
  resolveRoomResizeAxis,
  roomPixelSizeFit,
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
  frozenPxPerMeter: number;
  axis: RoomResizeAxis | null;
  portraitDisplay: boolean;
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
  compact = false,
  areaRef,
}: {
  setup: FloorPlanSetup;
  onChange: (patch: Partial<FloorPlanSetup>) => void;
  compact?: boolean;
  areaRef?: React.RefObject<HTMLElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasTier = useLayoutCanvasTier();
  const portraitLayout = compact
    ? true
    : canvasTierUsesPortraitLayout(canvasTier);
  const boundsTier: CanvasLayoutTier = compact ? 'phone' : canvasTier;
  const bounds = useRoomCanvasBounds(
    containerRef,
    boundsTier,
    setup,
    portraitLayout,
    areaRef,
  );
  const dragSessionRef = useRef<DragSession | null>(null);
  const [frozenPxPerMeter, setFrozenPxPerMeter] = useState<number | undefined>();

  const sizing = useMemo(() => {
    return roomPixelSizeFit(setup, bounds, {
      portraitLayout,
      frozenPxPerMeter,
      edgePaddingPx: compact
        ? ROOM_CANVAS_COMPACT_PADDING_PX
        : canvasTierEdgePaddingPx(canvasTier),
    });
  }, [bounds, canvasTier, compact, frozenPxPerMeter, portraitLayout, setup]);

  const { widthPx, heightPx, portraitDisplay } = sizing;
  const canvasRefPx = Math.max(widthPx, heightPx);

  useEffect(() => {
    setFrozenPxPerMeter(undefined);
  }, [setup.shape]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);

      const startSize = compact
        ? roomPixelSizeFit(setup, bounds, {
            portraitLayout: true,
            edgePaddingPx: ROOM_CANVAS_COMPACT_PADDING_PX,
          })
        : roomPixelSizeFit(setup, bounds, {
            portraitLayout: canvasTierUsesPortraitLayout(canvasTier),
            edgePaddingPx: canvasTierEdgePaddingPx(canvasTier),
          });

      const pxPerMeter =
        startSize.metersPerPx > 0
          ? 1 / startSize.metersPerPx
          : startSize.widthPx / Math.max(setup.radiusM * 2, setup.widthM, 0.1);

      dragSessionRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startSetup: setup,
        startWidthPx: startSize.widthPx,
        startHeightPx: startSize.heightPx,
        frozenPxPerMeter: pxPerMeter,
        axis: null,
        portraitDisplay: startSize.portraitDisplay,
      };
      setFrozenPxPerMeter(pxPerMeter);

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
            session.portraitDisplay,
          ),
        );
      };

      const onUp = (upEvent: PointerEvent) => {
        dragSessionRef.current = null;
        setFrozenPxPerMeter(undefined);
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
    [bounds, canvasTier, compact, onChange, setup],
  );

  const handleStyle: CSSProperties =
    setup.shape === 'round'
      ? roundHandlePosition(widthPx)
      : {
          right: 4,
          bottom: 4,
        };

  return (
    <div
      ref={containerRef}
      className={`flex w-full items-center justify-center ${compact ? 'min-h-0 py-1' : 'min-h-0 flex-1'}`}
    >
      <div
        className={`relative shrink-0 ${compact ? '' : 'my-1'}`}
        style={{ width: widthPx, height: heightPx }}
      >
          <div
            className={`relative h-full w-full overflow-hidden border-2 border-neutral-400 bg-neutral-50/90 shadow-sm ${
              setup.shape === 'round'
                ? 'rounded-full'
                : setup.shape === 'oval'
                  ? 'rounded-[50%]'
                  : 'rounded-xl'
            }`}
          >
            {!compact ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <p className="text-center text-xs font-medium text-neutral-500">
                  {setup.shape === 'round'
                    ? 'Arrastra el marcador para cambiar el radio'
                    : 'Arrastra el marcador: horizontal (ancho), vertical (largo) o diagonal (ambos a la vez)'}
                </p>
              </div>
            ) : null}
            <FloorPlanAccessoriesOverlay
              accessoryIds={setup.placedAccessories}
              canvasRefPx={canvasRefPx}
              portraitCanvas={heightPx > widthPx}
              portraitFixedSlots={compact}
              roomShape={setup.shape}
            />
          </div>
          {!compact ? (
            <ResizeHandle onPointerDown={handlePointerDown} style={handleStyle} />
          ) : null}
      </div>
    </div>
  );
}
