'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, PageHeader } from '@/components/ui';
import type { ImportValidation } from '@/lib/api';
import { adminRoutes } from '@/lib/routes';

export default function GuestImportErrorsPage() {
  const params = useParams<{ eventId: string }>();
  const routes = adminRoutes(params.eventId);
  const [validation, setValidation] = useState<ImportValidation | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('taulamic:importErrors');
    if (raw) {
      setValidation(JSON.parse(raw) as ImportValidation);
    }
  }, []);

  return (
    <>
      <PageHeader
        title="Errores en el Excel"
        subtitle="Corrige las filas indicadas y vuelve a importar."
      />

      {validation ? (
        <>
          <Alert variant="error">
            {validation.invalidRows} filas con errores — {validation.validRows}{' '}
            invitados válidos de {validation.totalRows}
          </Alert>

          <div className="card-admin mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                  <th className="pb-3 pr-4">Fila</th>
                  <th className="pb-3 pr-4">Campo</th>
                  <th className="pb-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {validation.errors.map((row, index) => (
                  <tr
                    key={`${row.row}-${row.field}-${index}`}
                    className="border-b border-error-500/10 bg-error-500/5"
                  >
                    <td className="py-3 pr-4">{row.row}</td>
                    <td className="py-3 pr-4">{row.field}</td>
                    <td className="py-3">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Alert variant="info">
          No hay errores recientes. Importa un Excel desde la pantalla de
          invitados.
        </Alert>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={routes.guests} className="btn-primary">
          Volver a invitados
        </Link>
        <Link href={routes.dashboard} className="btn-secondary">
          Ir al dashboard
        </Link>
      </div>
    </>
  );
}
