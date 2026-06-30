import {
  FLOOR_PLAN_ACCESSORIES,
  resolveAccessoryLayouts,
  ROOM_CANVAS_CEILING_PX,
  type RoomShape,
} from '@/lib/floor-plan-setup';
import { FloorAccessoryIcon, getFloorAccessoryDisplaySize } from './floor-accessory-icon';

export function FloorPlanAccessoriesOverlay({
  accessoryIds,
  tableCount = 0,
  canvasRefPx,
  showLabels = false,
  portraitCanvas = false,
  portraitFixedSlots = false,
  roomShape = 'rectangular',
}: {
  accessoryIds: string[];
  tableCount?: number;
  canvasRefPx?: number;
  showLabels?: boolean;
  portraitCanvas?: boolean;
  portraitFixedSlots?: boolean;
  roomShape?: RoomShape;
}) {
  if (accessoryIds.length === 0) {
    return null;
  }

  const refPx = canvasRefPx ?? ROOM_CANVAS_CEILING_PX;
  const layouts = resolveAccessoryLayouts(
    accessoryIds,
    tableCount,
    refPx,
    {
      labeled: showLabels,
      portraitCanvas: portraitCanvas || showLabels,
      portraitFixedSlots,
      roomShape,
    },
  );
  const displayScale =
    canvasRefPx !== undefined
      ? refPx / ROOM_CANVAS_CEILING_PX
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
            className="badge-floor-accessory pointer-events-auto absolute z-[3] inline-flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
            style={{
              top: layout.top,
              left: layout.left,
              padding: badgePadPx,
            }}
            title={accessory.label}
            aria-label={accessory.label}
          >
            <span className="inline-flex items-center justify-center rounded-lg bg-neutral-0/90 shadow-sm">
              <FloorAccessoryIcon
                id={id}
                size={iconSize}
                className="shrink-0 text-primary-600"
              />
            </span>
            {showLabels ? (
              <span className="max-w-[5.5rem] truncate rounded bg-neutral-0/90 px-1 py-0.5 text-center text-[9px] font-medium leading-tight text-neutral-700 shadow-sm">
                {accessory.label}
              </span>
            ) : null}
          </span>
        );
      })}
    </>
  );
}
