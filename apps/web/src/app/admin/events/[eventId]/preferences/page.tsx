'use client';

import { useEffect, useState } from 'react';
import { Alert, PageHeader, PreferenceOption } from '@/components/ui';
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
        title="Preferencias de distribución"
        subtitle="Elige cómo se recopilarán las preferencias de afinidad."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      <div className="max-w-2xl space-y-4">
        {loading ? (
          <p className="text-sm text-neutral-500">Cargando…</p>
        ) : (
          <>
            <PreferenceOption
              selected={mode === 'colaborativo'}
              title="Colaborativo"
              description="Los invitados reciben un enlace RSVP para indicar sus propias afinidades y preferencias de mesa."
              onSelect={() => setMode('colaborativo')}
            />
            <PreferenceOption
              selected={mode === 'anfitrion_exclusivo'}
              title="Anfitrión exclusivo"
              description="Solo el organizador define afinidades, restricciones y preferencias. Los invitados no editan sus datos."
              onSelect={() => setMode('anfitrion_exclusivo')}
            />
            <button
              type="button"
              className="btn-primary mt-4"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? 'Guardando…' : 'Guardar preferencias'}
            </button>
          </>
        )}
      </div>
    </>
  );
}
