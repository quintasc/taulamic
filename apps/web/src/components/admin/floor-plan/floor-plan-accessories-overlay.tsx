import {
  FLOOR_PLAN_ACCESSORIES,
  resolveAccessoryLayouts,
} from '@/lib/floor-plan-setup';
import { FloorAccessoryIcon, getFloorAccessoryDisplaySize } from './floor-accessory-icon';

export function FloorPlanAccessoriesOverlay({
  accessoryIds,
}: {
  accessoryIds: string[];
}) {
  if (accessoryIds.length === 0) {
    return null;
  }

  const layouts = resolveAccessoryLayouts(accessoryIds);

  return (
    <>
      {accessoryIds.map((id) => {
        const accessory = FLOOR_PLAN_ACCESSORIES.find((item) => item.id === id);
        if (!accessory) {
          return null;
        }
        const layout = layouts[id] ?? { top: '50%', left: '50%' };
        return (
          <span
            key={id}
            className="badge-floor-accessory absolute z-[1] flex max-w-[48%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 px-2.5 py-2 text-center"
            style={{ top: layout.top, left: layout.left }}
            title={accessory.label}
          >
            <FloorAccessoryIcon
              id={id}
              size={getFloorAccessoryDisplaySize(id, 'overlay')}
              className="shrink-0 text-primary-600"
            />
            <span className="max-w-full truncate text-[10px] font-semibold leading-tight">
              {accessory.label}
            </span>
          </span>
        );
      })}
    </>
  );
}
