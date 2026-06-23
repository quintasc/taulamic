'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, PageHeader } from '@/components/ui';
import { useEvent } from '@/lib/event-context';
import {
  EVENT_API_PLACEHOLDER_NAME,
  EVENT_NAME_INPUT_PLACEHOLDER,
} from '@/lib/event-ui-meta';
import { adminRoutes } from '@/lib/routes';

export default function NewEventPage() {
  const router = useRouter();
  const { createEvent } = useEvent();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const created = await createEvent(
        name.trim() || EVENT_API_PLACEHOLDER_NAME,
      );
      router.push(adminRoutes(created.id).config);
    } catch {
      setError('No se pudo crear el evento. ¿Está la API en el puerto 3000?');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-wf-1 p-8">
      <div className="card-admin w-full max-w-lg">
        <PageHeader
          title="Crear evento"
          subtitle="Cada acceso al panel crea un evento nuevo. En el piloto no se guardan proyectos entre sesiones."
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
              placeholder={EVENT_NAME_INPUT_PLACEHOLDER}
              onChange={(event) => setName(event.target.value)}
              disabled={creating}
            />
            <p className="mt-1.5 text-xs text-neutral-500">
              Puedes dejarlo vacío y definirlo en Configuración.
            </p>
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={creating}
          >
            {creating ? 'Creando…' : 'Crear y configurar'}
          </button>
        </form>
      </div>
    </div>
  );
}
