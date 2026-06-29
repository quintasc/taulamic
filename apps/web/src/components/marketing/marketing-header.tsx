'use client';

import Link from 'next/link';
import { TaulamicLogo } from '@/components/brand/taulamic-logo';

export function MarketingHeader({ adminHref }: { adminHref: string }) {
  return (
    <header className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-neutral-200 bg-neutral-0/95 px-6 backdrop-blur-md md:px-16">
      <Link href="/">
        <TaulamicLogo />
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
        <Link
          href="/#segmentos"
          className="text-neutral-700 hover:text-neutral-900"
        >
          Soluciones
        </Link>
      </nav>
      <div className="flex flex-col items-end gap-1">
        <Link href={adminHref} className="btn-primary px-5 py-2 text-sm">
          Acceder al piloto
        </Link>
        <span className="max-w-[220px] text-right text-[11px] leading-snug text-neutral-500">
          Bodas · acceso directo, sin registro
        </span>
      </div>
    </header>
  );
}
