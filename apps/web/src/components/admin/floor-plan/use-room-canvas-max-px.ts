'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';
import {
  resolveRoomCanvasMaxPx,
  ROOM_CANVAS_CEILING_PX,
  type FloorPlanSetup,
} from '@/lib/floor-plan-setup';

/** Hasta 767px: teléfono. 768–1023px: tablet. 1024+: escritorio. */
export const CANVAS_TIER_PHONE_MAX_PX = 767;
export const LAYOUT_CANVAS_MOBILE_BREAKPOINT_PX = 1024;

export type CanvasLayoutTier = 'phone' | 'tablet' | 'desktop';

const VIEWPORT_HEIGHT_FRACTION: Record<CanvasLayoutTier, number> = {
  phone: 0.72,
  tablet: 0.8,
  desktop: 0.84,
};

const MIN_CANVAS_HEIGHT_PX: Record<CanvasLayoutTier, number> = {
  phone: 280,
  tablet: 360,
  desktop: 400,
};

/** Espacio reservado bajo la tarjeta (nav setup, márgenes). */
const VIEWPORT_BOTTOM_RESERVE_PX: Record<CanvasLayoutTier, number> = {
  phone: 96,
  tablet: 112,
  desktop: 128,
};

const CARD_HORIZONTAL_PAD_PX = 16;

export function resolveCanvasLayoutTier(viewportWidthPx: number): CanvasLayoutTier {
  if (viewportWidthPx <= CANVAS_TIER_PHONE_MAX_PX) {
    return 'phone';
  }
  if (viewportWidthPx < LAYOUT_CANVAS_MOBILE_BREAKPOINT_PX) {
    return 'tablet';
  }
  return 'desktop';
}

function roomAspectDims(
  setup: FloorPlanSetup,
  portraitLayout: boolean,
): { alongX: number; alongY: number } {
  if (setup.shape === 'round') {
    const d = setup.radiusM * 2;
    return { alongX: d, alongY: d };
  }
  if (
    portraitLayout &&
    setup.shape !== 'oval' &&
    setup.widthM > setup.lengthM
  ) {
    return { alongX: setup.lengthM, alongY: setup.widthM };
  }
  return { alongX: setup.widthM, alongY: setup.lengthM };
}

function initialBoundsForTier(tier: CanvasLayoutTier): {
  maxWidthPx: number;
  maxHeightPx: number;
} {
  if (typeof window === 'undefined') {
    return { maxWidthPx: 360, maxHeightPx: 480 };
  }
  // Conservador hasta que ResizeObserver mida la tarjeta real.
  const maxWidthPx = 400;
  const maxHeightPx = Math.max(
    MIN_CANVAS_HEIGHT_PX[tier],
    Math.min(480, Math.floor(window.innerHeight * 0.55)),
  );
  return { maxWidthPx, maxHeightPx };
}

function sameBounds(
  current: { maxWidthPx: number; maxHeightPx: number },
  next: { maxWidthPx: number; maxHeightPx: number },
): boolean {
  return (
    current.maxWidthPx === next.maxWidthPx &&
    current.maxHeightPx === next.maxHeightPx
  );
}

export function useLayoutCanvasTier(): CanvasLayoutTier {
  const [tier, setTier] = useState<CanvasLayoutTier>(() =>
    typeof window === 'undefined'
      ? 'desktop'
      : resolveCanvasLayoutTier(window.innerWidth),
  );

  useLayoutEffect(() => {
    const update = () => {
      setTier(resolveCanvasLayoutTier(window.innerWidth));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return tier;
}

/** @deprecated Usar useLayoutCanvasTier(). */
export function useLayoutCanvasPortraitMode(): boolean {
  const tier = useLayoutCanvasTier();
  return tier === 'phone';
}

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
      const nextMaxPx = resolveRoomCanvasMaxPx(setup, width, ceilingPx);
      setCanvasMaxPx((current) =>
        current === nextMaxPx ? current : nextMaxPx,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef, setup, ceilingPx]);

  return canvasMaxPx;
}

export function resolveRoomCanvasBounds(
  areaRect: DOMRect,
  tier: CanvasLayoutTier,
  setup: FloorPlanSetup,
  portraitLayout: boolean,
): { maxWidthPx: number; maxHeightPx: number } {
  const viewportWidthPx =
    typeof window !== 'undefined' ? window.innerWidth : areaRect.width;
  const viewportHeightPx =
    typeof window !== 'undefined' ? window.innerHeight : areaRect.height;

  // Ancho según la tarjeta/contenedor medido — no inflar con el viewport completo
  // (evita lienzo gigante en escritorio con sidebar + panel lateral).
  const measuredWidthPx =
    areaRect.width > 0
      ? areaRect.width
      : Math.max(240, viewportWidthPx - 40);
  const maxWidthPx = Math.max(
    240,
    Math.floor(measuredWidthPx - CARD_HORIZONTAL_PAD_PX * 2),
  );

  const { alongX, alongY } = roomAspectDims(setup, portraitLayout);
  /** Alto necesario para llenar el ancho disponible sin deformar el salón. */
  const heightForFullWidthPx = Math.floor((maxWidthPx * alongY) / alongX);

  const fractionCapPx = Math.floor(
    viewportHeightPx * VIEWPORT_HEIGHT_FRACTION[tier],
  );
  const visibleBelowCardPx =
    areaRect.top > 0
      ? viewportHeightPx - areaRect.top - VIEWPORT_BOTTOM_RESERVE_PX[tier]
      : fractionCapPx;
  const viewportHeightCapPx = Math.floor(
    Math.min(fractionCapPx, Math.max(160, visibleBelowCardPx)),
  );

  const maxHeightPx = Math.max(
    MIN_CANVAS_HEIGHT_PX[tier],
    Math.min(heightForFullWidthPx, viewportHeightCapPx),
  );

  return { maxWidthPx, maxHeightPx };
}

/**
 * Límites del lienzo según tarjeta + viewport (no el tamaño del dibujo).
 * `areaRef`: tarjeta del plano.
 */
export function useRoomCanvasBounds(
  containerRef: RefObject<HTMLElement | null>,
  tier: CanvasLayoutTier,
  setup: FloorPlanSetup,
  portraitLayout: boolean,
  areaRef?: RefObject<HTMLElement | null>,
) {
  const [bounds, setBounds] = useState(() =>
    initialBoundsForTier(tier),
  );

  useLayoutEffect(() => {
    const host = containerRef.current;
    if (!host) {
      return;
    }

    const update = () => {
      const areaNode = areaRef?.current ?? host;
      const areaRect = areaNode.getBoundingClientRect();
      const nextBounds = resolveRoomCanvasBounds(
        areaRect,
        tier,
        setup,
        portraitLayout,
      );
      setBounds((current) =>
        sameBounds(current, nextBounds) ? current : nextBounds,
      );
    };

    update();
    requestAnimationFrame(update);

    const observer = new ResizeObserver(update);
    observer.observe(host);
    if (areaRef?.current && areaRef.current !== host) {
      observer.observe(areaRef.current);
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [areaRef, containerRef, portraitLayout, setup, tier]);

  return bounds;
}

export function canvasTierUsesPortraitLayout(tier: CanvasLayoutTier): boolean {
  return tier === 'phone';
}

export function canvasTierEdgePaddingPx(tier: CanvasLayoutTier): number {
  switch (tier) {
    case 'phone':
      return 4;
    case 'tablet':
      return 8;
    case 'desktop':
      return 10;
  }
}
