'use client';

import Link from 'next/link';

import { IconCheck, IconLock } from '@/components/icons';
import { setupSteps } from '@/lib/domain/setup-steps';
import {
  getSetupStepHref,
  getSetupStepJourneyLabel,
  type SetupFlowKey,
} from '@/lib/setup-flow';

export function SetupJourney({
  eventId,
  setupStatus,
}: {
  eventId: string;
  setupStatus: boolean[];
}) {
  return (
    <div className="card-admin px-4 py-5">
      <ol className="m-0 list-none p-0">
        {setupSteps.map((step, index) => {
          const done = setupStatus[index] ?? false;
          const isLast = index === setupSteps.length - 1;
          const href = step.locked
            ? undefined
            : getSetupStepHref(eventId, step.key as SetupFlowKey);
          const shortLabel = getSetupStepJourneyLabel(
            step.key as SetupFlowKey,
            index,
          );

          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex w-5 shrink-0 flex-col items-center">
                <SetupJourneyNode done={done} locked={step.locked} />
                {!isLast ? (
                  <span
                    aria-hidden
                    className={`my-1 w-px flex-1 min-h-[20px] ${
                      done ? 'bg-success-500/40' : 'bg-neutral-200'
                    }`}
                  />
                ) : null}
              </div>

              <SetupJourneyRow
                href={href}
                done={done}
                locked={step.locked}
                lockedHint={step.lockedHint}
                isLast={isLast}
                label={shortLabel}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SetupJourneyNode({
  done,
  locked,
}: {
  done: boolean;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-400">
        <IconLock width={10} height={10} strokeWidth={2.5} />
      </span>
    );
  }

  if (done) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-500 text-white">
        <IconCheck width={11} height={11} strokeWidth={3} />
      </span>
    );
  }

  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 bg-neutral-0" />
  );
}

function SetupJourneyRow({
  href,
  done,
  locked,
  lockedHint,
  isLast,
  label,
}: {
  href?: string;
  done: boolean;
  locked?: boolean;
  lockedHint?: string;
  isLast?: boolean;
  label: string;
}) {
  const rowClass = `group block min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-4'}`;
  const textClass = locked
    ? 'text-neutral-400'
    : done
      ? 'font-medium text-neutral-700'
      : 'text-neutral-600 group-hover:text-neutral-800';

  const content = (
    <div className="flex min-w-0 items-center gap-2">
      <p className={`text-sm leading-tight ${textClass}`}>{label}</p>
      {locked ? (
        <span className="text-[8px] font-medium uppercase tracking-wide text-neutral-400">
          Próximamente
        </span>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${rowClass} rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40`}
        title={`Ir a ${label}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={rowClass} title={locked ? lockedHint : undefined}>
      {content}
    </div>
  );
}
