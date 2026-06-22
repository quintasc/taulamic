'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-0 px-6 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">
        Algo ha fallado al cargar la página
      </h1>
      <p className="max-w-md text-sm text-neutral-500">
        Si ves «Internal Server Error», suele deberse a la caché de Next.js
        corrupta. Para el servidor, ejecuta{' '}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
          npm run dev:clean
        </code>{' '}
        en <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">apps/web</code>{' '}
        y recarga con Ctrl+Shift+R.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={() => reset()}>
          Reintentar
        </button>
        <Link href="/" className="btn-secondary">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
