'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminShell, RequireEvent } from '@/components/admin';
import { useEvent } from '@/lib/event-context';

export default function EventAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const { syncEventIdFromUrl } = useEvent();

  useEffect(() => {
    if (eventId) {
      syncEventIdFromUrl(eventId);
    }
  }, [eventId, syncEventIdFromUrl]);

  if (!eventId) {
    return null;
  }

  return (
    <AdminShell eventId={eventId}>
      <RequireEvent urlEventId={eventId}>{children}</RequireEvent>
    </AdminShell>
  );
}
