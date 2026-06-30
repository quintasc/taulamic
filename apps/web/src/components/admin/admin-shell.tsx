'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import {
  EVENT_CONFIG_STATUS_CHANGED,
  getDisplayEventName,
} from '@/lib/event-ui-meta';
import { useEvent } from '@/lib/event-context';

export function AdminShell({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const { event } = useEvent();
  const [configStatusRevision, setConfigStatusRevision] = useState(0);

  useEffect(() => {
    function handleConfigStatusChanged(event: Event) {
      const detail = (event as CustomEvent<{ eventId: string }>).detail;
      if (detail?.eventId === eventId) {
        setConfigStatusRevision((current) => current + 1);
      }
    }

    window.addEventListener(
      EVENT_CONFIG_STATUS_CHANGED,
      handleConfigStatusChanged,
    );
    return () => {
      window.removeEventListener(
        EVENT_CONFIG_STATUS_CHANGED,
        handleConfigStatusChanged,
      );
    };
  }, [eventId]);

  const displayName = useMemo(
    () => getDisplayEventName(event?.name, eventId),
    [event?.name, eventId, configStatusRevision],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-wf-1">
      <AdminSidebar eventId={eventId} eventName={displayName} />
      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-wf-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
