'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { TaulamicLogo } from '@/components/brand/taulamic-logo';
import {
  IconChevronDown,
  IconClose,
  IconLogIn,
  IconLogOut,
  IconMenu,
} from '@/components/icons';
import { marketingCards } from '@/components/marketing/marketing-cards';
import { useEvent } from '@/lib/event-context';

function MarketingSolutionsMenu({
  open,
  onToggle,
  onClose,
  buttonClassName,
  menuClassName = 'right-0',
  menuId = 'marketing-solutions-menu',
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  buttonClassName: string;
  menuClassName?: string;
  menuId?: string;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        className={buttonClassName}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={onToggle}
      >
        Soluciones
        <IconChevronDown
          width={14}
          height={14}
          className={`transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[90] cursor-default bg-transparent"
            aria-label="Cerrar menú de soluciones"
            onClick={onClose}
          />
          <ul
            id={menuId}
            className={`absolute top-full z-[110] mt-1 min-w-[10.5rem] rounded-xl border border-neutral-200 bg-neutral-0 py-1 shadow-lg ${menuClassName}`.trim()}
          >
            {marketingCards.map((card) => (
              <li key={card.anchorId}>
                <Link
                  href={`/#${card.anchorId}`}
                  className="block px-3.5 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  onClick={onClose}
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
  );
}

function MobileMenuPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 top-14 z-[90] cursor-default bg-neutral-900/10 backdrop-blur-[1px] md:top-16"
        aria-label="Cerrar menu principal"
        onClick={onClose}
      />
      <div
        id="marketing-mobile-menu"
        className="fixed inset-x-3 top-[4.25rem] z-[110] max-h-[calc(100vh-5.25rem)] overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-0 p-3 shadow-xl md:inset-x-auto md:right-8 md:top-[4.75rem] md:w-[22rem]"
      >
        <div className="border-b border-neutral-100 pb-2">
          <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
            Soluciones
          </p>
          {marketingCards.map((card) => (
            <Link
              key={card.anchorId}
              href={`/#${card.anchorId}`}
              className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              onClick={onClose}
            >
              <span>{card.navLabel}</span>
              {card.availability === 'coming-soon' ? (
                <span className="text-[11px] font-medium text-neutral-400">
                  Proximamente
                </span>
              ) : null}
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}

export function MarketingHeader({ adminHref }: { adminHref: string }) {
  const { clearEvent, eventId } = useEvent();
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pilotActive = Boolean(eventId);
  const accessHref = pilotActive ? '/' : adminHref;
  const accessLabel = pilotActive ? 'Salir del piloto' : 'Acceder al piloto';
  const AccessIcon = pilotActive ? IconLogOut : IconLogIn;

  const closeSolutions = useCallback(() => {
    setSolutionsOpen(false);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const closeAllMenus = useCallback(() => {
    setSolutionsOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const toggleSolutions = useCallback(() => {
    setSolutionsOpen((open) => !open);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((open) => !open);
    setSolutionsOpen(false);
  }, []);

  useEffect(() => {
    if (!solutionsOpen && !mobileMenuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAllMenus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [solutionsOpen, mobileMenuOpen, closeAllMenus]);

  useEffect(() => {
    function onHashChange() {
      closeAllMenus();
    }

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [closeAllMenus]);

  const desktopMenuButtonClass =
    'inline-flex items-center gap-1 rounded-lg px-2 py-2 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900';

  return (
    <header className="sticky top-0 z-[100] flex h-14 items-center gap-2 border-b border-neutral-200 bg-neutral-0/95 px-4 backdrop-blur-md md:h-16 md:gap-4 md:px-16">
      <Link
        href="/"
        className="min-w-0 shrink rounded-[7px] outline-offset-2"
        onClick={closeAllMenus}
      >
        <span className="md:hidden">
          <TaulamicLogo compact />
        </span>
        <span className="hidden md:inline-flex">
          <TaulamicLogo />
        </span>
      </Link>

      <nav
        className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex"
        aria-label="Navegacion principal"
      >
        <MarketingSolutionsMenu
          open={solutionsOpen}
          onToggle={toggleSolutions}
          onClose={closeSolutions}
          buttonClassName={desktopMenuButtonClass}
          menuClassName="left-1/2 right-auto -translate-x-1/2"
          menuId="marketing-solutions-menu-desktop"
        />
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
          aria-label={mobileMenuOpen ? 'Cerrar menu principal' : 'Abrir menu principal'}
          aria-controls="marketing-mobile-menu"
          aria-expanded={mobileMenuOpen}
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? (
            <IconClose width={21} height={21} />
          ) : (
            <IconMenu width={22} height={22} />
          )}
        </button>

        <Link
          href={accessHref}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-primary-600 hover:bg-primary-50 lg:hidden"
          aria-label={accessLabel}
          onClick={() => {
            if (pilotActive) {
              clearEvent();
            }
            closeAllMenus();
          }}
        >
          <AccessIcon width={22} height={22} />
        </Link>

        <div className="hidden flex-col items-end gap-1 lg:flex">
          <Link
            href={accessHref}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm"
            onClick={() => {
              if (pilotActive) {
                clearEvent();
              }
              closeAllMenus();
            }}
          >
            <AccessIcon width={16} height={16} />
            {accessLabel}
          </Link>
          <span className="max-w-[220px] text-right text-[11px] leading-snug text-neutral-500">
            Bodas · acceso directo, sin registro
          </span>
        </div>
      </div>

      {mobileMenuOpen ? (
        <MobileMenuPanel onClose={closeMobileMenu} />
      ) : null}
    </header>
  );
}
