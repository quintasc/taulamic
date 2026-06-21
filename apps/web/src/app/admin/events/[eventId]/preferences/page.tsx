'use client';

import { useEffect, useState } from 'react';
import { Alert, PageHeader } from '@/components/ui';
import { preferencesApi } from '@/lib/api';
import { useEvent } from '@/lib/event-context';

export default function PreferencesPage() {
  const { eventId } = useEvent();
  const [mode, setMode] = useState<'colaborativo' | 'anfitrion_exclusivo'>(
    'colaborativo',
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void preferencesApi
      .get(eventId)
      .then((settings) => setMode(settings.mode))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function save() {
    if (!eventId) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await preferencesApi.update(eventId, mode);
      setMessage('Modo de preferencias guardado.');
    } catch {
      setMessage('Error al guardar preferencias.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Modo de preferencias"
        subtitle="Control colaborativo o exclusivo del anfitrión."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      <div className="card-admin max-w-xl space-y-4">
        {loading ? (
          <p className="text-sm text-neutral-500">Cargando…</p>
        ) : (
          <>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="radio"
                name="mode"
                checked={mode === 'colaborativo'}
                onChange={() => setMode('colaborativo')}
              />
              <span>
                <span className="block font-semibold">Colaborativo</span>
                <span className="text-sm text-neutral-500">
                  Los invitados pueden editar sus preferencias.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4">
              <input
                type="radio"
                name="mode"
                checked={mode === 'anfitrion_exclusivo'}
                onChange={() => setMode('anfitrion_exclusivo')}
              />
              <span>
                <span className="block font-semibold">Anfitrión exclusivo</span>
                <span className="text-sm text-neutral-500">
                  Solo el admin gestiona preferencias.
                </span>
              </span>
            </label>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                className="btn-primary"
                disabled={saving}
                onClick={() => void save()}
              >
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
