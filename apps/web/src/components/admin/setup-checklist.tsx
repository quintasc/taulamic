import { IconCheck } from '@/components/icons';
import { setupSteps } from '@/lib/admin-nav';

export function SetupChecklist({ setupStatus }: { setupStatus: boolean[] }) {
  return (
    <div className="card-admin overflow-hidden p-0">
      {setupSteps.map((step, index) => (
        <SetupChecklistItem
          key={step.key}
          done={setupStatus[index]}
          label={step.label}
          isLast={index === setupSteps.length - 1}
        />
      ))}
    </div>
  );
}

function SetupChecklistItem({
  done,
  label,
  isLast,
}: {
  done: boolean;
  label: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-[11px] px-[18px] py-2.5 ${
        isLast ? '' : 'border-b border-wf-2'
      }`}
    >
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
          done ? 'bg-success-500 text-white' : 'bg-wf-3'
        }`}
      >
        {done ? (
          <IconCheck width={10} height={10} strokeWidth={3} />
        ) : null}
      </span>
      <span
        className={`text-[13px] ${
          done ? 'font-medium text-neutral-700' : 'text-neutral-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
