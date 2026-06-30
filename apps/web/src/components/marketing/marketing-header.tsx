'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { TaulamicLogo } from '@/components/brand/taulamic-logo';
import { IconChevronDown, IconLogIn } from '@/components/icons';
import { marketingCards } from '@/components/marketing/marketing-cards';

export function MarketingHeader({ adminHref }: { adminHref: string }) {
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  const closeSolutions = useCallback(() => {
    setSolutionsOpen(false);
  }, []);

  useEffect(() => {
    if (!solutionsOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeSolutions();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [solutionsOpen, closeSolutions]);

  useEffect(() => {
    function onHashChange() {
      closeSolutions();
    }

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [closeSolutions]);

  return (
    <header className="sticky top-0 z-[100] flex h-14 items-center gap-2 border-b border-neutral-200 bg-neutral-0/95 px-4 backdrop-blur-md md:h-16 md:gap-4 md:px-16">
      <Link
        href="/"
        className="min-w-0 shrink rounded-[7px] outline-offset-2"
        onClick={closeSolutions}
      >
        <span className="md:hidden">
          <TaulamicLogo compact />
        </span>
        <span className="hidden md:inline-flex">
          <TaulamicLogo />
        </span>
      </Link>

      <nav
        className="hidden min-w-0 flex-1 items-center justify-center gap-6 md:flex"
        aria-label="Tipos de evento"
      >
        {marketingCards.map((card) => (
          <Link
            key={card.anchorId}
            href={`/#${card.anchorId}`}
            className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            {card.navLabel}
          </Link>
        ))}
      </nav>

      <div className="relative md:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-0.5 rounded-lg px-2 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
          aria-expanded={solutionsOpen}
          aria-controls="marketing-solutions-menu"
          aria-haspopup="true"
          onClick={() => setSolutionsOpen((open) => !open)}
        >
          Soluciones
          <IconChevronDown
            width={14}
            height={14}
            className={`transition ${solutionsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {solutionsOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[90] cursor-default bg-transparent"
              aria-label="Cerrar menú de soluciones"
              onClick={closeSolutions}
            />
            <ul
              id="marketing-solutions-menu"
              className="absolute right-0 top-full z-[110] mt-1 min-w-[10.5rem] rounded-xl border border-neutral-200 bg-neutral-0 py-1 shadow-lg"
            >
              {marketingCards.map((card) => (
                <li key={card.anchorId}>
                  <Link
                    href={`/#${card.anchorId}`}
                    className="block px-3.5 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    onClick={closeSolutions}
                  >
                    {card.navLabel}
                    {card.availability === 'coming-soon' ? (
                      <span className="ml-1 text-[11px] text-neutral-400">
                        (próx.)
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="ml-auto flex shrink-0 items-center">
        <Link
          href={adminHref}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-primary-600 hover:bg-primary-50 md:hidden"
          aria-label="Acceder al piloto"
          onClick={closeSolutions}
        >
          <IconLogIn width={22} height={22} />
        </Link>

        <div className="hidden flex-col items-end gap-1 md:flex">
          <Link href={adminHref} className="btn-primary px-5 py-2 text-sm">
            Acceder al piloto
          </Link>
          <span className="max-w-[220px] text-right text-[11px] leading-snug text-neutral-500">
            Bodas · acceso directo, sin registro
          </span>
        </div>
      </div>
    </header>
  );
}
