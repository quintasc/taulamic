'use client';

import { useState } from 'react';
import { Alert, PageHeader, UploadZone } from '@/components/ui';
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
        'Plano subido y detección iniciada. Revisa las mesas detectadas (Corregir plano — próxima iteración).',
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
        subtitle="Sube el plano en PDF o imagen para detectar las mesas automáticamente."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      <div className="max-w-2xl">
        <UploadZone
          title="Arrastra o haz clic para subir"
          hint="PDF, PNG o JPG · Máx. 20 MB"
          accept="image/*,application/pdf"
          disabled={uploading}
          buttonLabel={uploading ? 'Subiendo…' : 'Subir plano'}
          onFile={(file) => void upload(file)}
        />
      </div>
    </>
  );
}
