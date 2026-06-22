import Link from 'next/link';
import type { ReactNode } from 'react';

export function QuickAccessCard({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2.5 rounded-lg border border-wf-3 bg-neutral-0 p-4 text-left transition hover:border-wf-4"
    >
      <span className="text-wf-4">{icon}</span>
      <span className="text-xs font-medium text-neutral-700">{label}</span>
    </Link>
  );
}
