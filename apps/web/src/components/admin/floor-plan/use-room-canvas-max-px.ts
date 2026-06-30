'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';
import {
  resolveRoomCanvasMaxPx,
  ROOM_CANVAS_CEILING_PX,
  type FloorPlanSetup,
} from '@/lib/floor-plan-setup';

export function useRoomCanvasMaxPx(
  containerRef: RefObject<HTMLElement | null>,
  setup: FloorPlanSetup,
  ceilingPx = ROOM_CANVAS_CEILING_PX,
) {
  const [canvasMaxPx, setCanvasMaxPx] = useState(ceilingPx);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const update = () => {
      const width = node.getBoundingClientRect().width;
      setCanvasMaxPx(resolveRoomCanvasMaxPx(setup, width, ceilingPx));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef, setup, ceilingPx]);

  return canvasMaxPx;
}
