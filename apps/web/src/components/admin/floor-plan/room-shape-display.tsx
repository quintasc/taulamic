'use client';

import type { ReactNode } from 'react';
import { roomPixelSize, type FloorPlanSetup } from '@/lib/floor-plan-setup';

export function roomShapeClassName(shape: FloorPlanSetup['shape']): string {
  switch (shape) {
    case 'round':
      return 'rounded-full';
    case 'oval':
      return 'rounded-[50%]';
    default:
      return 'rounded-xl';
  }
}

export function RoomShapeDisplay({
  setup,
  maxPx = 360,
  widthPx: widthPxOverride,
  heightPx: heightPxOverride,
  className = '',
  children,
}: {
  setup: FloorPlanSetup;
  maxPx?: number;
  widthPx?: number;
  heightPx?: number;
  className?: string;
  children?: ReactNode;
}) {
  const classic = roomPixelSize(setup, maxPx);
  const widthPx = widthPxOverride ?? classic.widthPx;
  const heightPx = heightPxOverride ?? classic.heightPx;

  return (
    <div
      className={`relative mx-auto shrink-0 ${className}`}
      style={{ width: widthPx, height: heightPx }}
    >
      <div
        className={`relative h-full w-full overflow-hidden border-2 border-neutral-400 bg-neutral-50/90 shadow-sm ${roomShapeClassName(setup.shape)}`}
      >
        {children}
      </div>
    </div>
  );
}
