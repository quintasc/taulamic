'use client';

import { useEffect, useState } from 'react';
import { Alert, PageHeader } from '@/components/ui';
import { eventsApi } from '@/lib/api';
import { useEvent } from '@/lib/event-context';

export default function EventConfigPage() {
  const { event, eventId, refreshEvent } = useEvent();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (event?.name) {
      setName(event.name);
    }
  }, [event?.name]);

  async function save() {
    if (!eventId || !name.trim()) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await eventsApi.update(eventId, name.trim());
      await refreshEvent();
      setMessage('Evento guardado correctamente.');
    } catch {
      setMessage('Error al guardar el evento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Configuración del evento"
        subtitle="Define los datos básicos del evento."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      <div className="card-admin max-w-2xl space-y-5">
        <div>
          <label className="label-field" htmlFor="event-name">
            Nombre del evento
          </label>
          <input
            id="event-name"
            className="input-field"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Estado</label>
          <p className="text-sm capitalize text-neutral-700">
            {event?.status === 'plan_approved'
              ? 'Plan aprobado'
              : 'En configuración'}
          </p>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            className="btn-primary"
            disabled={saving || !name.trim()}
            onClick={() => void save()}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </>
  );
}
