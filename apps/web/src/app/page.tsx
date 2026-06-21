'use client';

import Link from 'next/link';
import { HeroFloorplan } from '@/components/hero-floorplan';
import {
  IconArrowRight,
  IconChevronRight,
  IconSparkles,
} from '@/components/icons';
import { marketingCards } from '@/components/marketing-illustrations';
import { TaulamicLogo } from '@/components/taulamic-logo';
import { adminEntryPaths } from '@/lib/routes';

function MarketingHeader({ onAdmin }: { onAdmin: string }) {
  return (
    <header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-neutral-200 bg-neutral-0/95 px-6 backdrop-blur-md md:px-16">
      <Link href="/">
        <TaulamicLogo />
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-700 md:flex">
        {['Sobre nosotros', 'Precios', 'Blog'].map((label) => (
          <span key={label} className="cursor-default hover:text-neutral-900">
            {label}
          </span>
        ))}
      </nav>
      <div className="flex flex-col items-end gap-1">
        <Link href={onAdmin} className="btn-primary px-5 py-2 text-sm">
          Iniciar sesión
        </Link>
        <span className="max-w-[220px] text-right text-[11px] leading-snug text-neutral-500">
          Piloto julio · acceso directo, sin registro
        </span>
      </div>
    </header>
  );
}

function MinimalCard({
  card,
  onAdmin,
}: {
  card: (typeof marketingCards)[0];
  onAdmin: string;
}) {
  return (
    <article
      className={`relative flex flex-col rounded-[18px] p-7 md:p-8 ${
        card.featured
          ? 'bg-neutral-900 text-neutral-0 shadow-[0_8px_40px_rgba(0,0,0,0.2)]'
          : 'border border-neutral-200 bg-neutral-0 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
      }`}
    >
      {card.featured && (
        <span className="absolute right-[18px] top-[18px] rounded-full bg-primary-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-600">
          Destacado
        </span>
      )}
      <div
        className={`mb-5 flex h-[120px] items-center ${
          card.featured ? 'bg-neutral-900' : ''
        }`}
      >
        {card.illu}
      </div>
      <h3
        className={`text-[15px] font-bold tracking-wide ${
          card.featured ? 'text-neutral-0' : 'text-neutral-900'
        }`}
      >
        {card.title}
      </h3>
      <p className="mt-2.5 flex-1 text-[13px] leading-[1.7] text-neutral-500">
        {card.desc}
      </p>
      <Link
        href={onAdmin}
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-primary-500"
      >
        Saber más <IconChevronRight width={13} height={13} />
      </Link>
    </article>
  );
}

export default function LandingPage() {
  const adminHref = adminEntryPaths.root;

  return (
    <div className="min-h-screen bg-neutral-0">
      <MarketingHeader onAdmin={adminHref} />

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
            <MinimalCard key={card.title} card={card} onAdmin={adminHref} />
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
