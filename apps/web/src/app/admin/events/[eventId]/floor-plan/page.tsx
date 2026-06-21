'use client';

import { useState } from 'react';
import { Alert, PageHeader } from '@/components/ui';
import { useEvent } from '@/lib/event-context';

export default function FloorPlanPage() {
  const { eventId } = useEvent();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(file: File) {
    if (!eventId) {
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch(`/api/v1/events/${eventId}/floor-plans`, {
        method: 'POST',
        headers: { 'x-taulamic-actor-role': 'admin' },
        body: form,
      });
      if (!response.ok) {
        throw new Error('upload failed');
      }
      const plan = (await response.json()) as { id: string };
      await fetch(
        `/api/v1/events/${eventId}/floor-plans/${plan.id}/detect`,
        {
          method: 'POST',
          headers: { 'x-taulamic-actor-role': 'admin' },
        },
      );
      setMessage(
        'Plano subido y detección iniciada. Corrección detallada en iteración post-piloto.',
      );
    } catch {
      setMessage('Error al subir el plano.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Subir plano"
        subtitle="Importa imagen o PDF del salón para detectar mesas."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      <div className="card-admin max-w-xl">
        <Alert variant="info">
          La detección es asistida. Tras subir, revisa y confirma cada mesa
          (pantalla «Corregir plano» en Figma — UI completa post-piloto).
        </Alert>

        <label className="btn-primary mt-6 inline-flex cursor-pointer">
          {uploading ? 'Subiendo…' : 'Subir plano'}
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void upload(file);
              }
            }}
          />
        </label>
      </div>
    </>
  );
}
