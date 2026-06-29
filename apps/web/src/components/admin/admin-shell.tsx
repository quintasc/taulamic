'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { getDisplayEventName } from '@/lib/event-ui-meta';
import { useEvent } from '@/lib/event-context';

export function AdminShell({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const { event } = useEvent();
  const displayName = getDisplayEventName(event?.name, eventId);

  return (
    <div className="flex h-screen overflow-hidden bg-wf-1">
      <AdminSidebar eventId={eventId} eventName={displayName} />
      <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-wf-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
