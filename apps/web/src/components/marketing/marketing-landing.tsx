'use client';

import Link from 'next/link';
import { HeroFloorplan } from '@/components/marketing/hero-floorplan';
import { MarketingCard } from '@/components/marketing/marketing-card';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { marketingCards } from '@/components/marketing/marketing-cards';
import { IconArrowRight, IconSparkles } from '@/components/icons';
import { adminEntryPaths } from '@/lib/routes';

export function MarketingLanding() {
  const adminHref = adminEntryPaths.root;

  return (
    <div className="min-h-screen bg-neutral-0">
      <MarketingHeader adminHref={adminHref} />

      <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-16 md:grid-cols-2 md:gap-20 md:px-16 md:py-24 lg:gap-22">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3.5 py-1 text-[11px] font-semibold tracking-wide text-primary-600">
            <IconSparkles width={11} height={11} color="#E86B4A" />
            IA para seating inteligente
          </span>
          <h1 className="mt-6 text-[2.75rem] font-bold leading-[1.08] tracking-[-0.032em] text-neutral-900 lg:text-[3.25rem]">
            Distribución inteligente para tus mesas
          </h1>
          <p className="mt-5 max-w-[420px] text-xl leading-[1.55] text-neutral-500">
            Tecnología que sienta a las personas compatibles.
          </p>
          <Link
            href={adminHref}
            className="btn-primary mt-10 inline-flex items-center gap-2 rounded-[10px] px-8 py-3.5 text-[15px] font-semibold"
          >
            Crear evento <IconArrowRight width={16} height={16} />
          </Link>
          <p className="mt-3 max-w-[380px] text-xs leading-relaxed text-neutral-500">
            <span className="font-semibold text-neutral-700">Piloto julio:</span>{' '}
            acceso directo al panel organizador (admin único). Registro y auth
            completo — post-julio 2026.
          </p>
        </div>
        <div className="flex justify-center">
          <HeroFloorplan />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-16 md:pb-24">
        <p className="mb-10 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
          Para cada tipo de evento
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {marketingCards.map((card) => (
            <MarketingCard key={card.title} card={card} adminHref={adminHref} />
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-6 bg-neutral-900 px-6 py-[72px] md:px-16">
        <h2 className="max-w-[520px] text-center text-[2.5rem] font-bold leading-[1.12] tracking-[-0.025em] text-neutral-0">
          Tu próximo evento, un éxito desde que toman asiento
        </h2>
        <Link
          href={adminHref}
          className="btn-primary rounded-[10px] px-9 py-3.5 text-[15px] font-semibold"
        >
          Empezar gratis
        </Link>
      </section>
    </div>
  );
}
