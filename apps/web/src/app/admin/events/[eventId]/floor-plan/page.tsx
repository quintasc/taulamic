'use client';

import { FloorPlanSetupView } from '@/components/admin/floor-plan/floor-plan-setup-view';
import { useHasDistribution } from '@/hooks/use-has-distribution';
import { useEvent } from '@/lib/event-context';

export default function FloorPlanPage() {
  const { eventId } = useEvent();
  const hasDistribution = useHasDistribution(eventId ?? '');

  if (!eventId) {
    return null;
  }

  return (
    <FloorPlanSetupView eventId={eventId} hasDistribution={hasDistribution} />
  );
}
