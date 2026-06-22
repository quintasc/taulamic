import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.08em] text-wf-5">
      {children}
    </h2>
  );
}
