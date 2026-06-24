'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Alert } from '@/components/ui';

export type SetupNavBarProps = {
  variant?: 'sticky-bottom' | 'header' | 'inline';
  previousHref?: string;
  previousLabel?: string;
  nextHref?: string;
  nextLabel?: string;
  /** Si false, «Siguiente» se muestra deshabilitado. */
  nextReady?: boolean;
  nextDisabledHint?: string;
  /** Si se define, se ejecuta antes de navegar; debe devolver true para continuar. */
  onBeforeNext?: () => Promise<boolean> | boolean;
  primaryLabel?: string;
  onPrimaryClick?: () => void;
  primaryDisabled?: boolean;
  primarySaving?: boolean;
  /** Ocultar slot primario (p. ej. Invitados: acciones en el contenido). */
  hidePrimary?: boolean;
};

function NavControls({
  previousHref,
  previousLabel,
  nextHref,
  nextLabel,
  nextReady = false,
  nextDisabledHint = 'Completa este paso para continuar',
  onBeforeNext,
  primaryLabel,
  onPrimaryClick,
  primaryDisabled = false,
  primarySaving = false,
  hidePrimary = false,
  compact = false,
}: SetupNavBarProps & { compact?: boolean }) {
  const router = useRouter();
  const blockedBannerRef = useRef<HTMLDivElement>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [blockedPulse, setBlockedPulse] = useState(false);
  const showPrimary =
    !hidePrimary && primaryLabel !== undefined && onPrimaryClick !== undefined;
  const showNext = Boolean(nextHref && nextLabel);
  const showPrevious = Boolean(previousHref && previousLabel);
  const showBlockedBanner = showNext && !nextReady && Boolean(nextDisabledHint);

  function emphasizeBlockedMessage() {
    blockedBannerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
    setBlockedPulse(true);
    window.setTimeout(() => setBlockedPulse(false), 700);
  }

  async function handleNext() {
    if (!nextHref) {
      return;
    }
    if (onBeforeNext) {
      setNextLoading(true);
      try {
        const ok = await onBeforeNext();
        if (ok) {
          router.push(nextHref);
        }
      } finally {
        setNextLoading(false);
      }
      return;
    }
    router.push(nextHref);
  }

  return (
    <div className={compact ? 'flex flex-col gap-2' : 'flex flex-col gap-3'}>
      {showBlockedBanner ? (
        <div
          ref={blockedBannerRef}
          className={
            blockedPulse
              ? 'rounded-xl ring-2 ring-error-500/40 ring-offset-2 transition-shadow'
              : undefined
          }
        >
          <Alert variant="error">{nextDisabledHint}</Alert>
        </div>
      ) : null}

      <div
        className={
          compact
            ? 'flex flex-wrap items-center gap-2'
            : 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
        }
      >
      {showPrevious ? (
        <Link
          href={previousHref!}
          className={`text-sm font-medium text-neutral-600 hover:text-primary-600 ${
            compact ? 'order-1' : ''
          }`}
        >
          ← {previousLabel}
        </Link>
      ) : (
        <span className={compact ? 'hidden' : 'hidden sm:block sm:flex-1'} />
      )}

      <div
        className={`flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end ${
          compact ? 'order-2' : ''
        }`}
      >
        {showPrimary ? (
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            disabled={primaryDisabled || primarySaving}
            onClick={onPrimaryClick}
          >
            {primarySaving ? 'Guardando…' : primaryLabel}
          </button>
        ) : null}

        {showNext ? (
          nextReady ? (
            onBeforeNext ? (
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                disabled={nextLoading}
                onClick={() => void handleNext()}
              >
                {nextLoading ? 'Guardando…' : `${nextLabel} →`}
              </button>
            ) : (
              <Link
                href={nextHref!}
                className="btn-secondary w-full text-center sm:w-auto"
              >
                {nextLabel} →
              </Link>
            )
          ) : (
            <button
              type="button"
              className="btn-secondary w-full text-center opacity-50 sm:w-auto"
              aria-disabled="true"
              onClick={emphasizeBlockedMessage}
            >
              {nextLabel} →
            </button>
          )
        ) : null}
      </div>
      </div>
    </div>
  );
}

export function SetupNavBar(props: SetupNavBarProps) {
  const { variant = 'sticky-bottom' } = props;

  if (variant === 'header') {
    return <NavControls {...props} compact />;
  }

  if (variant === 'inline') {
    return (
      <div className="mt-6 border-t border-neutral-200 pt-5">
        <NavControls {...props} />
      </div>
    );
  }

  return (
    <>
      <div className="h-28 md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-neutral-0/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur md:static md:z-auto md:mt-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
        <div className="mx-auto max-w-4xl md:border-t md:border-neutral-200 md:pt-5">
          <NavControls {...props} />
        </div>
      </div>
    </>
  );
}
