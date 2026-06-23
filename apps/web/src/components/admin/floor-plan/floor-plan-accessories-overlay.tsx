import {
  ACCESSORY_LAYOUT,
  FLOOR_PLAN_ACCESSORIES,
} from '@/lib/floor-plan-setup';

export function FloorPlanAccessoriesOverlay({
  accessoryIds,
}: {
  accessoryIds: string[];
}) {
  if (accessoryIds.length === 0) {
    return null;
  }

  return (
    <>
      {accessoryIds.map((id) => {
        const accessory = FLOOR_PLAN_ACCESSORIES.find((item) => item.id === id);
        if (!accessory) {
          return null;
        }
        const layout = ACCESSORY_LAYOUT[id] ?? { top: '50%', left: '50%' };
        return (
          <span
            key={id}
            className="badge-floor-accessory absolute z-[1] max-w-[42%] -translate-x-1/2 -translate-y-1/2 truncate"
            style={{ top: layout.top, left: layout.left }}
          >
            {accessory.label}
          </span>
        );
      })}
    </>
  );
}
