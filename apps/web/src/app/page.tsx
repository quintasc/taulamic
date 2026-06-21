'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MarketingHeader } from '@/components/ui';
import { useEvent } from '@/lib/event-context';
import { adminEntryPaths, eventBasePath } from '@/lib/routes';

export default function LandingPage() {
  const router = useRouter();
  const { eventId } = useEvent();
  const [error, setError] = useState<string | null>(null);

  function enterAdmin() {
    setError(null);
    if (eventId) {
      router.push(eventBasePath(eventId));
      return;
    }
    router.push(adminEntryPaths.newEvent);
  }

  return (
    <div className="min-h-screen bg-neutral-0">
      <MarketingHeader />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:px-12 md:py-24">
        <div>
          <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-600">
            IA para seating inteligente
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
            Distribución inteligente para tus mesas
          </h1>
          <p className="mt-4 text-lg text-neutral-700">
            Tecnología que sienta a las personas compatibles.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={adminEntryPaths.newEvent} className="btn-primary">
              Crear evento →
            </Link>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => enterAdmin()}
            >
              Iniciar sesión
            </button>
          </div>
          <p className="mt-4 max-w-md text-xs text-neutral-500">
            Piloto julio: acceso directo al panel organizador (admin único).
            Registro y auth completo — post-julio 2026.
          </p>
          {error ? (
            <p className="mt-4 text-sm text-error-500">{error}</p>
          ) : null}
        </div>

        <div className="card-admin relative overflow-hidden bg-neutral-100">
          <div className="absolute right-6 top-6 rounded-xl border border-neutral-200 bg-neutral-0 p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase text-neutral-500">
              Afinidad media
            </p>
            <p className="text-2xl font-bold text-primary-500">94%</p>
            <div className="mt-2 h-2 w-32 rounded-full bg-neutral-200">
              <div className="h-2 w-[94%] rounded-full bg-primary-500" />
            </div>
          </div>
          <div className="flex h-64 items-center justify-center md:h-80">
            <div className="relative h-40 w-40 rounded-full border-2 border-dashed border-primary-500/40">
              {[0, 1, 2, 3].map((seat) => (
                <span
                  key={seat}
                  className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white"
                  style={{
                    left: `${50 + 42 * Math.cos((seat * Math.PI) / 2 - Math.PI / 2)}%`,
                    top: `${50 + 42 * Math.sin((seat * Math.PI) / 2 - Math.PI / 2)}%`,
                  }}
                >
                  {seat + 1}
                </span>
              ))}
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                Mesa
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-100 px-6 py-16 md:px-12">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Para cada tipo de evento
        </p>
        <div className="mx-auto mt-8 grid max-w-5xl gap-6 md:grid-cols-3">
          <article className="rounded-2xl bg-neutral-900 p-6 text-neutral-0">
            <p className="text-xs font-semibold text-primary-500">Destacado</p>
            <h3 className="mt-2 text-lg font-semibold">Bodas y celebraciones</h3>
            <p className="mt-2 text-sm text-neutral-300">
              Organiza la distribución perfecta para el gran día.
            </p>
          </article>
          <article className="card-admin">
            <h3 className="text-lg font-semibold">Aulas y formación</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Optimiza el acomodo para cursos y talleres colaborativos.
            </p>
          </article>
          <article className="card-admin">
            <h3 className="text-lg font-semibold">Eventos de empresa</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Conecta equipos en cenas y team building.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
