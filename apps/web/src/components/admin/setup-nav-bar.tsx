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

/** En footer fijo (dense), por debajo de md solo flechas; texto completo desde md. */
const DENSE_PREVIOUS_CLASS =
  'inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-xs font-medium text-neutral-600 hover:bg-wf-1 hover:text-primary-600 md:min-h-8 md:min-w-0 md:max-w-[45%] md:justify-start md:rounded-none md:px-0 md:hover:bg-transparent';

const DENSE_NEXT_CLASS =
  'min-h-11 min-w-11 shrink-0 justify-center px-3 md:min-h-0 md:min-w-0 md:px-3.5';

function SetupNavPreviousContent({ previousLabel }: { previousLabel: string }) {
  return (
    <>
      <span className="md:hidden" aria-hidden>
        ←
      </span>
      <span className="hidden truncate md:inline">← {previousLabel}</span>
    </>
  );
}

function SetupNavNextContent({
  nextLabel,
  loading = false,
}: {
  nextLabel: string;
  loading?: boolean;
}) {
  if (loading) {
    return <>Guardando…</>;
  }
  return (
    <>
      <span className="md:hidden" aria-hidden>
        →
      </span>
      <span className="hidden md:inline">{nextLabel} →</span>
    </>
  );
}

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
    ? DENSE_PREVIOUS_CLASS
    : 'text-sm font-medium text-neutral-600 hover:text-primary-600';

  const rowClass = compact
    ? 'flex w-full min-w-0 flex-wrap items-center gap-2'
    : dense
      ? 'flex h-full w-full min-w-0 flex-row items-center justify-between gap-2'
      : 'flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3';

  const actionsClass = compact
    ? 'order-2 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:justify-end'
    : dense
      ? 'flex min-w-0 shrink-0 flex-row items-center justify-end gap-2'
      : 'flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:justify-end';

  return (
    <div className={rowClass}>
      {showPrevious ? (
        <Link
          href={previousHref!}
          className={`${previousLinkClass} ${compact ? 'order-1' : ''}`}
          aria-label={dense ? previousLabel : undefined}
          title={dense ? previousLabel : undefined}
        >
          {dense ? (
            <SetupNavPreviousContent previousLabel={previousLabel!} />
          ) : (
            <>← {previousLabel}</>
          )}
        </Link>
      ) : (
        <span className={compact ? 'hidden' : dense ? 'hidden' : 'hidden sm:block sm:flex-1'} />
      )}

      <div className={actionsClass}>
        {showPrimary ? (
          <button
            type="button"
            className={`${primaryBtnClass} ${dense ? 'shrink-0' : 'w-full min-w-0 sm:w-auto'}`}
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
                className={`${secondaryBtnClass} ${dense ? DENSE_NEXT_CLASS : 'w-full min-w-0 sm:w-auto'}`}
                disabled={nextLoading}
                aria-label={dense && nextLabel ? nextLabel : undefined}
                title={dense && nextLabel ? nextLabel : undefined}
                onClick={() => void onHandleNext()}
              >
                {dense && nextLabel ? (
                  <SetupNavNextContent nextLabel={nextLabel} loading={nextLoading} />
                ) : (
                  <>{nextLoading ? 'Guardando…' : `${nextLabel} →`}</>
                )}
              </button>
            ) : (
              <Link
                href={nextHref!}
                className={`${secondaryBtnClass} ${dense ? `${DENSE_NEXT_CLASS} whitespace-nowrap` : 'w-full min-w-0 text-center sm:w-auto'}`}
                aria-label={dense && nextLabel ? nextLabel : undefined}
                title={dense && nextLabel ? nextLabel : undefined}
              >
                {dense && nextLabel ? (
                  <SetupNavNextContent nextLabel={nextLabel} />
                ) : (
                  <>{nextLabel} →</>
                )}
              </Link>
            )
          ) : (
            <button
              type="button"
              className={`${secondaryBtnClass} ${dense ? `${DENSE_NEXT_CLASS} whitespace-nowrap` : 'w-full min-w-0 text-center sm:w-auto'}`}
              aria-label={dense && nextLabel ? nextLabel : undefined}
              title={dense && nextLabel ? nextLabel : undefined}
              aria-disabled="true"
              onClick={onEmphasizeBlocked}
            >
              {dense && nextLabel ? (
                <SetupNavNextContent nextLabel={nextLabel} />
              ) : (
                <>{nextLabel} →</>
              )}
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
        <div className="admin-setup-bar-inner mx-auto max-w-4xl min-w-0 overflow-hidden">
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
