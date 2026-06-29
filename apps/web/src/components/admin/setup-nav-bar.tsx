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

const MAIN_SETUP_BAR_REGION_CLASS =
  'fixed left-[var(--admin-sidebar-width)] z-40 w-[calc(100%-var(--admin-sidebar-width))] px-4 md:px-8';

function useSetupNavControlState({
  previousHref,
  previousLabel,
  nextHref,
  nextLabel,
  nextReady = false,
  nextDisabledHint = 'Completa este paso para continuar',
  onBeforeNext,
  hidePrimary = false,
  primaryLabel,
  onPrimaryClick,
}: SetupNavBarProps) {
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

  return {
    blockedBannerRef,
    blockedPulse,
    emphasizeBlockedMessage,
    handleNext,
    nextLoading,
    showBlockedBanner,
    showNext,
    showPrevious,
    showPrimary,
    nextDisabledHint,
  };
}

function SetupNavBlockedBanner({
  bannerRef,
  pulse,
  hint,
}: {
  bannerRef: React.RefObject<HTMLDivElement | null>;
  pulse: boolean;
  hint: string;
}) {
  return (
    <div
      ref={bannerRef}
      className={
        pulse
          ? 'rounded-xl ring-2 ring-error-500/40 ring-offset-2 transition-shadow'
          : undefined
      }
    >
      <Alert variant="error">{hint}</Alert>
    </div>
  );
}

function SetupNavControlsRow({
  previousHref,
  previousLabel,
  nextHref,
  nextLabel,
  nextReady = false,
  primaryLabel,
  onPrimaryClick,
  primaryDisabled = false,
  primarySaving = false,
  hidePrimary = false,
  compact = false,
  dense = false,
  showPrevious,
  showNext,
  showPrimary,
  nextLoading,
  onBeforeNext,
  onEmphasizeBlocked,
  onHandleNext,
}: SetupNavBarProps & {
  compact?: boolean;
  dense?: boolean;
  showPrevious: boolean;
  showNext: boolean;
  showPrimary: boolean;
  nextLoading: boolean;
  onEmphasizeBlocked: () => void;
  onHandleNext: () => void | Promise<void>;
}) {
  const primaryBtnClass = dense ? 'btn-primary-compact' : 'btn-primary';
  const secondaryBtnClass = dense ? 'btn-secondary-compact' : 'btn-secondary';
  const previousLinkClass = dense
    ? 'text-xs font-medium text-neutral-600 hover:text-primary-600'
    : 'text-sm font-medium text-neutral-600 hover:text-primary-600';

  return (
    <div
      className={
        compact
          ? 'flex w-full flex-wrap items-center gap-2'
          : 'flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3'
      }
    >
      {showPrevious ? (
        <Link
          href={previousHref!}
          className={`${previousLinkClass} ${compact ? 'order-1' : ''}`}
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
            className={`${primaryBtnClass} w-full sm:w-auto`}
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
                className={`${secondaryBtnClass} w-full sm:w-auto`}
                disabled={nextLoading}
                onClick={() => void onHandleNext()}
              >
                {nextLoading ? 'Guardando…' : `${nextLabel} →`}
              </button>
            ) : (
              <Link
                href={nextHref!}
                className={`${secondaryBtnClass} w-full text-center sm:w-auto`}
              >
                {nextLabel} →
              </Link>
            )
          ) : (
            <button
              type="button"
              className={`${secondaryBtnClass} w-full text-center opacity-50 sm:w-auto`}
              aria-disabled="true"
              onClick={onEmphasizeBlocked}
            >
              {nextLabel} →
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}

function NavControls({
  compact = false,
  dense = false,
  ...props
}: SetupNavBarProps & { compact?: boolean; dense?: boolean }) {
  const state = useSetupNavControlState(props);

  return (
    <div
      className={`${compact || dense ? 'flex w-full flex-col gap-2' : 'flex w-full flex-col gap-3'}`}
    >
      {state.showBlockedBanner ? (
        <SetupNavBlockedBanner
          bannerRef={state.blockedBannerRef}
          pulse={state.blockedPulse}
          hint={state.nextDisabledHint}
        />
      ) : null}

      <SetupNavControlsRow
        {...props}
        compact={compact}
        dense={dense}
        showPrevious={state.showPrevious}
        showNext={state.showNext}
        showPrimary={state.showPrimary}
        nextLoading={state.nextLoading}
        onBeforeNext={props.onBeforeNext}
        onEmphasizeBlocked={state.emphasizeBlockedMessage}
        onHandleNext={state.handleNext}
      />
    </div>
  );
}

function StickySetupNavBar(props: SetupNavBarProps) {
  const state = useSetupNavControlState(props);

  return (
    <>
      <div
        className="h-[var(--admin-setup-bar-offset)]"
        aria-hidden
      />
      {state.showBlockedBanner ? (
        <div
          className={`${MAIN_SETUP_BAR_REGION_CLASS} bottom-[var(--admin-setup-bar-offset)] z-[39] border-t border-wf-3 bg-wf-1 pb-2 pt-2`}
        >
          <div className="mx-auto max-w-4xl">
            <SetupNavBlockedBanner
              bannerRef={state.blockedBannerRef}
              pulse={state.blockedPulse}
              hint={state.nextDisabledHint}
            />
          </div>
        </div>
      ) : null}
      <div
        className={`admin-setup-bar-shell ${MAIN_SETUP_BAR_REGION_CLASS} bottom-0`}
      >
        <div className="admin-setup-bar-inner mx-auto max-w-4xl">
          <SetupNavControlsRow
            {...props}
            dense
            showPrevious={state.showPrevious}
            showNext={state.showNext}
            showPrimary={state.showPrimary}
            nextLoading={state.nextLoading}
            onBeforeNext={props.onBeforeNext}
            onEmphasizeBlocked={state.emphasizeBlockedMessage}
            onHandleNext={state.handleNext}
          />
        </div>
      </div>
    </>
  );
}

export function SetupNavBar(props: SetupNavBarProps) {
  const { variant = 'sticky-bottom' } = props;

  if (variant === 'header') {
    return <NavControls {...props} compact dense />;
  }

  if (variant === 'inline') {
    return (
      <div className="mt-6 border-t border-neutral-200 pt-5">
        <NavControls {...props} />
      </div>
    );
  }

  return <StickySetupNavBar {...props} />;
}
