import type { ComponentType, SVGProps } from 'react';

import {
  floorAccessoryIcons,
  type FloorAccessoryIconId,
} from '@/components/icons';

const LARGER_ACCESSORY_IDS = new Set([
  'mesa-presidencial',
  'mesa-novios',
  'entrada',
  'escenario',
]);

export function getFloorAccessoryDisplaySize(
  id: string,
  context: 'card' | 'overlay',
): number {
  const isLarge = LARGER_ACCESSORY_IDS.has(id);
  if (context === 'card') {
    return isLarge ? 30 : 24;
  }
  return isLarge ? 26 : 22;
}

export function getFloorAccessoryIcon(
  id: string,
): ComponentType<SVGProps<SVGSVGElement>> | null {
  if (id in floorAccessoryIcons) {
    return floorAccessoryIcons[id as FloorAccessoryIconId];
  }
  return null;
}

export function FloorAccessoryIcon({
  id,
  className,
  size = 24,
}: {
  id: string;
  className?: string;
  size?: number;
}) {
  const Icon = getFloorAccessoryIcon(id);
  if (!Icon) {
    return null;
  }
  return (
    <Icon
      width={size}
      height={size}
      className={className}
      aria-hidden
    />
  );
}
