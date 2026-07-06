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
  customPositions = {},
  onPointerDownAccessory,
  editable = false,
}: {
  accessoryIds: string[];
  tableCount?: number;
  canvasRefPx?: number;
  showLabels?: boolean;
  portraitCanvas?: boolean;
  portraitFixedSlots?: boolean;
  roomShape?: RoomShape;
  customPositions?: Record<string, { x: number; y: number }>;
  onPointerDownAccessory?: (e: React.PointerEvent, id: string, initialPos: { x: number; y: number }) => void;
  editable?: boolean;
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
        const customPos = customPositions[id];
        const layout = customPos
          ? { top: `${customPos.y}%`, left: `${customPos.x}%` }
          : layouts[id] ?? { top: '50%', left: '50%' };

        const initialX = customPos ? customPos.x : Number.parseFloat(layout.left);
        const initialY = customPos ? customPos.y : Number.parseFloat(layout.top);

        const iconSize = Math.max(
          20,
          Math.round(getFloorAccessoryDisplaySize(id, 'overlay') * displayScale),
        );
        return (
          <span
            key={id}
            className={`badge-floor-accessory absolute z-[3] inline-flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 pointer-events-auto ${
              editable ? 'cursor-move select-none touch-none' : ''
            }`}
            style={{
              top: layout.top,
              left: layout.left,
              padding: badgePadPx,
            }}
            title={accessory.label}
            aria-label={accessory.label}
            onPointerDown={(e) => {
              if (editable && onPointerDownAccessory) {
                onPointerDownAccessory(e, id, { x: initialX, y: initialY });
              }
            }}
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
