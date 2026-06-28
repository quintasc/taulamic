'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, Button } from '@/components/ui';
import { useEvent } from '@/lib/event-context';
import { EVENT_API_PLACEHOLDER_NAME } from '@/lib/event-ui-meta';
import { adminEntryPaths, adminRoutes } from '@/lib/routes';

export default function AdminIndexPage() {
  const router = useRouter();
  const { createEvent, clearEvent } = useEvent();
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startNewEvent() {
      clearEvent();
      try {
        const created = await createEvent(EVENT_API_PLACEHOLDER_NAME);
        if (cancelled) {
          return;
        }
        router.replace(adminRoutes(created.id).config);
      } catch {
        if (cancelled) {
          return;
        }
        setError(
          'No se pudo crear el evento. Comprueba que la API esté en marcha (puerto 3000).',
        );
        setBooting(false);
      }
    }

    void startNewEvent();

    return () => {
      cancelled = true;
    };
    // router es estable; omitido para evitar re-ejecuciones en Strict Mode (dev/E2E)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearEvent, createEvent]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-wf-1 p-8 text-center">
        <Alert variant="error">{error}</Alert>
        <Button onClick={() => router.push(adminEntryPaths.newEvent)}>
          Reintentar manualmente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-wf-1 text-sm text-neutral-500">
      {booting ? 'Creando evento…' : 'Redirigiendo…'}
    </div>
  );
}
