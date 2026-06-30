import {
  FLOOR_PLAN_ACCESSORIES,
  resolveAccessoryLayouts,
  ROOM_CANVAS_CEILING_PX,
} from '@/lib/floor-plan-setup';
import { FloorAccessoryIcon, getFloorAccessoryDisplaySize } from './floor-accessory-icon';

export function FloorPlanAccessoriesOverlay({
  accessoryIds,
  tableCount = 0,
  canvasRefPx,
}: {
  accessoryIds: string[];
  tableCount?: number;
  canvasRefPx?: number;
}) {
  if (accessoryIds.length === 0) {
    return null;
  }

  const layouts = resolveAccessoryLayouts(
    accessoryIds,
    tableCount,
    canvasRefPx,
  );
  const displayScale =
    canvasRefPx !== undefined
      ? canvasRefPx / ROOM_CANVAS_CEILING_PX
      : 1;
  const badgePadPx = Math.max(4, Math.round(6 * displayScale));

  return (
    <>
      {accessoryIds.map((id) => {
        const accessory = FLOOR_PLAN_ACCESSORIES.find((item) => item.id === id);
        if (!accessory) {
          return null;
        }
        const layout = layouts[id] ?? { top: '50%', left: '50%' };
        const iconSize = Math.max(
          16,
          Math.round(getFloorAccessoryDisplaySize(id, 'overlay') * displayScale),
        );
        return (
          <span
            key={id}
            className="badge-floor-accessory pointer-events-auto absolute z-[3] inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{
              top: layout.top,
              left: layout.left,
              padding: badgePadPx,
            }}
            title={accessory.label}
            aria-label={accessory.label}
          >
            <FloorAccessoryIcon
              id={id}
              size={iconSize}
              className="shrink-0 text-primary-600"
            />
          </span>
        );
      })}
    </>
  );
}
