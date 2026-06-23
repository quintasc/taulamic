'use client';

import { PreferencesAffinityView } from '@/components/admin/preferences/preferences-affinity-view';
import { useEvent } from '@/lib/event-context';

export default function PreferencesPage() {
  const { eventId } = useEvent();

  if (!eventId) {
    return <p className="text-sm text-neutral-500">Cargando…</p>;
  }

  return <PreferencesAffinityView eventId={eventId} />;
}
