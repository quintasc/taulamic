'use client';

import { IconChevronLeft, IconChevronRight } from '@/components/icons';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const SCROLL_EDGE_PX = 4;

/** Mismo patrón que expandir/contraer en tarjetas de invitados (móvil). */
export const MOBILE_CHEVRON_ICON_BUTTON_CLASS =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 disabled:opacity-40';

function canScrollForward(el: HTMLElement): boolean {
  return (
    el.scrollWidth > el.clientWidth + SCROLL_EDGE_PX &&
    el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_EDGE_PX
  );
}

function canScrollBack(el: HTMLElement): boolean {
  return el.scrollLeft > SCROLL_EDGE_PX;
}

/**
 * Carril horizontal en móvil. Con `label`, los indicadores van en la cabecera
 * (título a la izquierda; chevrones a la derecha, sin centrar el título).
 */
export function MobileHorizontalScroll({
  children,
  label,
  className = '',
  scrollClassName = '',
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
  scrollClassName?: string;
  'aria-label'?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showBackHint, setShowBackHint] = useState(false);
  const [showForwardHint, setShowForwardHint] = useState(false);

  const updateHints = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    setShowBackHint(canScrollBack(el));
    setShowForwardHint(canScrollForward(el));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    updateHints();
    const observer = new ResizeObserver(updateHints);
    observer.observe(el);
    el.addEventListener('scroll', updateHints, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', updateHints);
    };
  }, [updateHints, children]);

  function scrollByDirection(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const delta = Math.max(120, Math.floor(el.clientWidth * 0.65)) * direction;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }

  const scrollHints =
    label && (showBackHint || showForwardHint) ? (
      <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
        {showBackHint ? (
          <button
            type="button"
            className={MOBILE_CHEVRON_ICON_BUTTON_CLASS}
            aria-label={`Deslizar ${label.toLowerCase()} hacia la izquierda`}
            onClick={() => scrollByDirection(-1)}
          >
            <IconChevronLeft width={18} height={18} />
          </button>
        ) : null}
        {showForwardHint ? (
          <button
            type="button"
            className={MOBILE_CHEVRON_ICON_BUTTON_CLASS}
            aria-label={`Deslizar ${label.toLowerCase()} hacia la derecha`}
            onClick={() => scrollByDirection(1)}
          >
            <IconChevronRight width={18} height={18} />
          </button>
        ) : null}
      </div>
    ) : null;

  return (
    <div className={className}>
      {label ? (
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="min-w-0 text-xs font-semibold text-neutral-700">{label}</p>
          {scrollHints}
        </div>
      ) : null}
      <div
        ref={scrollRef}
        className={`overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${scrollClassName}`}
        role={ariaLabel ? 'region' : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}
