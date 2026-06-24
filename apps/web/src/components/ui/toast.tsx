'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  push: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

const toastStyles: Record<ToastVariant, string> = {
  success: 'border-success-500/30 bg-success-500/10 text-neutral-900',
  error: 'border-error-500/30 bg-error-500/10 text-neutral-900',
  info: 'border-info-500/30 bg-info-500/10 text-neutral-900',
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full max-w-md rounded-xl border px-4 py-3 text-sm shadow-lg ${toastStyles[toast.variant]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p>{toast.message}</p>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          aria-label="Cerrar aviso"
          onClick={() => onDismiss(toast.id)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, variant }]);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }

  return {
    success: (message: string) => context.push(message, 'success'),
    error: (message: string) => context.push(message, 'error'),
    info: (message: string) => context.push(message, 'info'),
  };
}
