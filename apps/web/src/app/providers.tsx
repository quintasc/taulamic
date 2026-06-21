'use client';

import { EventProvider } from '@/lib/event-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return <EventProvider>{children}</EventProvider>;
}
