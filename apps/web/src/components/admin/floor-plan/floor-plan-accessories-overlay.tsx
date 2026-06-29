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
            className="badge-floor-accessory absolute z-[1] inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center p-1.5"
            style={{ top: layout.top, left: layout.left }}
            title={accessory.label}
            aria-label={accessory.label}
          >
            <FloorAccessoryIcon
              id={id}
              size={getFloorAccessoryDisplaySize(id, 'overlay')}
              className="shrink-0 text-primary-600"
            />
          </span>
        );
      })}
    </>
  );
}
