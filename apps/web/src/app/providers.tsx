'use client';

import { ToastProvider } from '@/components/ui';
import { EventProvider } from '@/lib/event-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <EventProvider>{children}</EventProvider>
    </ToastProvider>
  );
}
