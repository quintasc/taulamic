'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useEvent } from '@/lib/event-context';

export function AdminShell({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const { event } = useEvent();

  return (
    <div className="flex h-screen overflow-hidden bg-wf-1">
      <AdminSidebar eventId={eventId} eventName={event?.name} />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-wf-1 p-8">
        {children}
      </main>
    </div>
  );
}
