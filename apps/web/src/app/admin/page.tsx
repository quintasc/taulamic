'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvent } from '@/lib/event-context';
import { EVENT_API_PLACEHOLDER_NAME } from '@/lib/event-ui-meta';
import { adminEntryPaths, adminRoutes } from '@/lib/routes';

export default function AdminIndexPage() {
  const router = useRouter();
  const { createEvent, clearEvent } = useEvent();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    clearEvent();

    async function startNewEvent() {
      try {
        const created = await createEvent(EVENT_API_PLACEHOLDER_NAME);
        router.replace(adminRoutes(created.id).config);
      } catch {
        router.replace(adminEntryPaths.newEvent);
      } finally {
        setBooting(false);
      }
    }

    void startNewEvent();
  }, [clearEvent, createEvent, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-wf-1 text-sm text-neutral-500">
      {booting ? 'Creando evento…' : 'Redirigiendo…'}
    </div>
  );
}
