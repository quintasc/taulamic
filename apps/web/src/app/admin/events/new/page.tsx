'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, PageHeader } from '@/components/ui';
import { useEvent } from '@/lib/event-context';
import { eventBasePath } from '@/lib/routes';

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useEvent();
  const [name, setName] = useState('Mi evento piloto');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await createEvent(name.trim());
      router.push(eventBasePath(created.id));
    } catch {
      setError('No se pudo crear el evento. ¿Está la API en el puerto 3000?');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-0 p-8">
      <div className="card-admin w-full max-w-lg">
        <PageHeader
          title="Crear evento"
          subtitle="Introduce un nombre para empezar a configurar el evento."
        />

        {error ? (
          <div className="mb-6">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={(event) => void submit(event)}>
          <div>
            <label className="label-field" htmlFor="new-event-name">
              Nombre del evento
            </label>
            <input
              id="new-event-name"
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={creating}
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={creating || !name.trim()}
          >
            {creating ? 'Creando…' : 'Crear y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
