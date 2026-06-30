'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { feedbackSurfaceClass } from '@/lib/feedback-surface';
import { SETUP_NAV_COPY } from '@/lib/ui-copy';

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
  'fixed left-0 z-50 w-full px-4 md:px-8 lg:left-[var(--admin-sidebar-width)] lg:w-[calc(100%-var(--admin-sidebar-width))]';

function SetupNavStickyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}

/**
 * Aviso de bloqueo dentro del mismo footer sticky (sin franja doble).
 * Revertir al diseño anterior: poner `false` y commitear.
 */
export const SETUP_NAV_UNIFIED_BLOCKED_SHELL = false;

/**
 * Aviso justo encima del footer, sin franja gris intermedia (split bands).
 * Revertir: poner `false` y commitear.
 */
export const SETUP_NAV_HINT_FLUSH_ABOVE_FOOTER = true;

/** En footer fijo (dense), por debajo de md: misma píldora que «Siguiente»; desde md: enlace texto. */
const DENSE_PREVIOUS_CLASS =
  'btn-secondary-compact inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center px-3 md:min-h-8 md:min-w-0 md:max-w-[45%] md:justify-start md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-xs md:font-medium md:text-neutral-600 md:hover:bg-transparent md:hover:text-primary-600';

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
  nextDisabledHint = SETUP_NAV_COPY.defaultBlockedHint,
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

const SETUP_NAV_HINT_INNER_CLASS =
  'mx-auto flex max-w-4xl min-w-0 justify-end';

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
          ? 'rounded-lg ring-2 ring-error-500/40 ring-offset-1 transition-shadow'
          : 'max-w-full'
      }
    >
      <div
        className={`setup-nav-blocked-hint ${feedbackSurfaceClass.error}`}
        role="alert"
      >
        {hint}
      </div>
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
      ? `flex h-full w-full min-w-0 flex-row items-center gap-2 ${
          showPrevious ? 'justify-between' : 'justify-end'
        }`
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
        <span
          className={
            compact
              ? 'hidden'
              : dense
                ? 'hidden'
                : 'hidden sm:block sm:flex-1'
          }
          aria-hidden
        />
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
      className={`${compact || dense ? 'flex w-full flex-col gap-1.5' : 'flex w-full flex-col gap-2'}`}
    >
      {state.showBlockedBanner ? (
        <div className={SETUP_NAV_HINT_INNER_CLASS}>
          <SetupNavBlockedBanner
            bannerRef={state.blockedBannerRef}
            pulse={state.blockedPulse}
            hint={state.nextDisabledHint}
          />
        </div>
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

function StickySetupNavBarSplitBands(props: SetupNavBarProps) {
  const state = useSetupNavControlState(props);
  const spacerClass =
    SETUP_NAV_HINT_FLUSH_ABOVE_FOOTER && state.showBlockedBanner
      ? 'h-[var(--admin-setup-bar-offset-with-hint)]'
      : 'h-[var(--admin-setup-bar-offset)]';
  const hintBandClass = SETUP_NAV_HINT_FLUSH_ABOVE_FOOTER
    ? `${MAIN_SETUP_BAR_REGION_CLASS} bottom-[var(--admin-setup-bar-offset)] z-[39] pb-[var(--admin-setup-bar-hint-gap)]`
    : `${MAIN_SETUP_BAR_REGION_CLASS} bottom-[var(--admin-setup-bar-offset)] z-[39] flex h-[var(--admin-setup-bar-hint-extra)] items-center border-t border-wf-3 bg-wf-1`;

  return (
    <>
      <div className={spacerClass} aria-hidden />
      <SetupNavStickyPortal>
        {state.showBlockedBanner ? (
          <div className={hintBandClass}>
            <div className={SETUP_NAV_HINT_INNER_CLASS}>
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
          <div className="admin-setup-bar-inner mx-auto max-w-4xl min-w-0">
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
      </SetupNavStickyPortal>
    </>
  );
}

function StickySetupNavBarUnified(props: SetupNavBarProps) {
  const state = useSetupNavControlState(props);
  const spacerClass = state.showBlockedBanner
    ? 'h-[var(--admin-setup-bar-offset-with-hint)]'
    : 'h-[var(--admin-setup-bar-offset)]';

  return (
    <>
      <div className={spacerClass} aria-hidden />
      <SetupNavStickyPortal>
        <div
          className={`admin-setup-bar-shell ${MAIN_SETUP_BAR_REGION_CLASS} bottom-0`}
        >
          <div className="mx-auto flex max-w-4xl min-w-0 flex-col gap-[var(--admin-setup-bar-hint-gap)] px-0 pt-[var(--admin-setup-bar-hint-gap)]">
            {state.showBlockedBanner ? (
              <div className={SETUP_NAV_HINT_INNER_CLASS}>
                <SetupNavBlockedBanner
                  bannerRef={state.blockedBannerRef}
                  pulse={state.blockedPulse}
                  hint={state.nextDisabledHint}
                />
              </div>
            ) : null}
            <div className="admin-setup-bar-inner !h-auto min-h-[var(--admin-setup-bar-height)]">
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
        </div>
      </SetupNavStickyPortal>
    </>
  );
}

function StickySetupNavBar(props: SetupNavBarProps) {
  if (SETUP_NAV_UNIFIED_BLOCKED_SHELL) {
    return <StickySetupNavBarUnified {...props} />;
  }
  return <StickySetupNavBarSplitBands {...props} />;
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
