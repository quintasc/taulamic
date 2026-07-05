'use client';

import { usePathname } from 'next/navigation';
import { getCountableSetupSteps } from '@/lib/domain/setup-steps';

function getStepProgress(pathname: string) {
  const countableSteps = getCountableSetupSteps();

  let activeKey: string | null = null;
  if (pathname.endsWith('/config')) activeKey = 'config';
  else if (pathname.endsWith('/guests')) activeKey = 'guests';
  else if (pathname.endsWith('/invitations')) activeKey = 'invitations';
  else if (pathname.endsWith('/floor-plan')) activeKey = 'plano';
  else if (pathname.endsWith('/tables')) activeKey = 'tables';
  else if (pathname.endsWith('/preferences')) activeKey = 'prefs';
  else if (pathname.endsWith('/distribution')) activeKey = 'dist';

  if (!activeKey) {
    return null;
  }

  const total = countableSteps.length;
  const currentIdx = countableSteps.findIndex((step) => step.key === activeKey);

  if (currentIdx === -1) {
    return null;
  }

  return {
    stepNumber: currentIdx + 1,
    total,
  };
}

export function PageHeader({
  title,
  subtitle,
  action,
  saveStatus,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  saveStatus?: React.ReactNode;
}) {
  const pathname = usePathname();
  const stepInfo = getStepProgress(pathname);

  return (
    <div className="relative mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[17px] font-semibold text-neutral-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {stepInfo ? (
        <div
          className="hidden lg:flex absolute left-1/2 top-0 -translate-x-1/2 items-center gap-2"
          aria-label={`Paso ${stepInfo.stepNumber} de ${stepInfo.total}`}
        >
          <div className="flex gap-0.5">
            {Array.from({ length: stepInfo.total }).map((_, i) => (
              <span
                key={i}
                className={`h-[2px] w-[14px] rounded-full transition-colors duration-300 ${
                  i < stepInfo.stepNumber ? 'bg-neutral-900' : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-neutral-500 whitespace-nowrap">
            Paso {stepInfo.stepNumber} de {stepInfo.total}
          </span>
        </div>
      ) : null}
      {action || saveStatus ? (
        <div className="flex shrink-0 flex-row items-center gap-3">
          {action}
          {saveStatus}
        </div>
      ) : null}
    </div>
  );
}
