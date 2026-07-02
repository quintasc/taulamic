'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { IconCheck } from '@/components/icons';
import { SAVE_STATUS_COPY } from '@/lib/ui-copy';

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved';

export function useAutoSaveIndicator() {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const savedTimerRef = useRef<number | null>(null);

  const clearSavedTimer = useCallback(() => {
    if (savedTimerRef.current) {
      window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  }, []);

  const markPending = useCallback(() => {
    clearSavedTimer();
    setStatus((current) => (current === 'saving' ? 'saving' : 'pending'));
  }, [clearSavedTimer]);

  const markSaving = useCallback(() => {
    clearSavedTimer();
    setStatus('saving');
  }, [clearSavedTimer]);

  const markSaved = useCallback(() => {
    clearSavedTimer();
    setStatus('saved');
    savedTimerRef.current = window.setTimeout(() => {
      setStatus((current) => (current === 'saved' ? 'idle' : current));
    }, 3000);
  }, [clearSavedTimer]);

  const markIdle = useCallback(() => {
    clearSavedTimer();
    setStatus('idle');
  }, [clearSavedTimer]);

  useEffect(() => () => clearSavedTimer(), [clearSavedTimer]);

  return { status, markPending, markSaving, markSaved, markIdle };
}

export function SaveStatusIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === 'idle') {
    return null;
  }

  if (status === 'pending' || status === 'saving') {
    return (
      <p className="whitespace-nowrap text-xs font-medium text-neutral-500" aria-live="polite">
        {SAVE_STATUS_COPY.saving}
      </p>
    );
  }

  return (
    <p
      className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-success-600"
      aria-live="polite"
    >
      <IconCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {SAVE_STATUS_COPY.saved}
    </p>
  );
}
