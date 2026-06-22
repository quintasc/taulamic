'use client';

import Link from 'next/link';
import { useEvent } from '@/lib/event-context';

export function RequireEvent({ children }: { children: React.ReactNode }) {
  const { eventId, loading, error } = useEvent();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        Cargando evento…
      </div>
    );
  }

  if (!eventId || error) {
    return (
      <div className="card-admin max-w-lg">
        <h2 className="text-lg font-semibold">Evento no disponible</h2>
        <p className="mt-2 text-sm text-neutral-500">
          En el piloto no se recuperan eventos guardados. Crea uno nuevo para
          empezar a configurar el evento.
        </p>
        <Link href="/admin" className="btn-primary mt-4 inline-flex">
          Crear evento nuevo
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
