'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEvent } from '@/lib/event-context';
import { adminEntryPaths, eventBasePath } from '@/lib/routes';

export default function AdminIndexPage() {
  const router = useRouter();
  const { eventId, loading } = useEvent();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (eventId) {
      router.replace(eventBasePath(eventId));
      return;
    }
    router.replace(adminEntryPaths.newEvent);
  }, [eventId, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
      Redirigiendo…
    </div>
  );
}
