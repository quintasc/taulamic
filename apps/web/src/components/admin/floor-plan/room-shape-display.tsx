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
  className = '',
  children,
}: {
  setup: FloorPlanSetup;
  maxPx?: number;
  className?: string;
  children?: ReactNode;
}) {
  const { widthPx, heightPx } = roomPixelSize(setup, maxPx);

  return (
    <div
      className={`relative mx-auto max-w-full shrink-0 ${className}`}
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
