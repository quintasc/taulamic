import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="section-label mb-2.5">{children}</h2>;
}
