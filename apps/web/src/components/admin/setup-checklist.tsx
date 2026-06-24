import { IconCheck, IconLock } from '@/components/icons';
import { setupSteps } from '@/lib/domain/setup-steps';

export function SetupChecklist({
  setupStatus,
}: {
  setupStatus: boolean[];
}) {
  return (
    <div className="card-admin overflow-hidden p-0">
      {setupSteps.map((step, index) => (
        <SetupChecklistItem
          key={step.key}
          done={setupStatus[index] ?? false}
          label={step.label}
          locked={step.locked}
          lockedHint={step.lockedHint}
          isLast={index === setupSteps.length - 1}
        />
      ))}
    </div>
  );
}

function SetupChecklistItem({
  done,
  label,
  locked,
  lockedHint,
  isLast,
}: {
  done: boolean;
  label: string;
  locked?: boolean;
  lockedHint?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[11px] px-[18px] py-2.5 ${
        isLast ? '' : 'border-b border-wf-2'
      } ${locked ? 'bg-neutral-50/80' : ''}`}
      title={locked ? lockedHint : undefined}
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
          locked
            ? 'bg-wf-3 text-neutral-500'
            : done
              ? 'bg-success-500 text-white'
              : 'bg-wf-3'
        }`}
      >
        {locked ? (
          <IconLock width={10} height={10} strokeWidth={2.5} />
        ) : done ? (
          <IconCheck width={10} height={10} strokeWidth={3} />
        ) : null}
      </span>
      <span
        className={`text-[13px] ${
          locked
            ? 'text-neutral-400'
            : done
              ? 'font-medium text-neutral-700'
              : 'text-neutral-500'
        }`}
      >
        {label}
      </span>
      {locked ? (
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          Próximamente
        </span>
      ) : null}
    </div>
  );
}
