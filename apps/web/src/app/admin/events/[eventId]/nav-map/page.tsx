'use client';

import { PageHeader } from '@/components/ui';
import { IconCheck } from '@/components/icons';

const branches: Array<{ nodes: string[]; optional?: string }> = [
  { nodes: ['Configuración evento', 'Modo afinidades'] },
  { nodes: ['Plano salón', 'Tamaño recomendado'] },
  { nodes: ['Importar Excel', 'Añadir manual', 'RSVP mock'], optional: 'errores fila si aplica' },
  { nodes: ['Configurar mesas'] },
  { nodes: ['Afinidades y reglas', 'Borrador piloto'] },
  { nodes: ['Calcular distribución', 'Confirmar'] },
];

function Box({ label, pilot = false }: { label: string; pilot?: boolean }) {
  if (pilot) {
    return (
      <span className="whitespace-nowrap rounded-[7px] border-[1.5px] border-primary-500 bg-primary-100 px-3.5 py-1.5 text-xs font-semibold text-primary-600">
        {label}
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap rounded-[7px] border border-wf-3 bg-neutral-0 px-3.5 py-1.5 text-xs font-medium text-neutral-900">
      {label}
    </span>
  );
}

function Arr({ color = 'var(--wf-4)' }: { color?: string }) {
  return (
    <span className="mx-1 shrink-0 text-sm" style={{ color }}>
      →
    </span>
  );
}

export default function NavMapPage() {
  return (
    <>
      <PageHeader
        title="Mapa de navegación"
        subtitle="Flujo completo MVP piloto julio"
      />

      <div className="mb-8 flex flex-wrap items-center gap-1">
        <Box label="Marketing landing" />
        <Arr />
        <Box label="Acceso directo piloto" pilot />
        <Arr color="#E86B4A" />
        <span className="whitespace-nowrap rounded-lg bg-primary-500 px-5 py-2 text-[13px] font-bold text-white">
          Dashboard evento
        </span>
      </div>

      <div className="flex gap-0">
        <div className="flex flex-col items-center">
          <div className="h-3 w-0.5 bg-wf-3" />
          {branches.map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-0.5 w-2.5 self-start bg-wf-3" />
              {i < branches.length - 1 ? (
                <div className="min-h-8 w-0.5 flex-1 bg-wf-3" />
              ) : (
                <div className="h-4 w-0.5 bg-transparent" />
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {branches.map((branch, i) => (
            <div
              key={i}
              className="flex min-h-12 items-center gap-1 pl-3"
            >
              {branch.nodes.map((node, j) => (
                <span key={j} className="flex items-center gap-1">
                  {j > 0 && <Arr />}
                  <Box label={node} pilot />
                  {branch.optional && j === branch.nodes.length - 1 && (
                    <span className="ml-0.5 text-[11px] italic text-neutral-500">
                      ({branch.optional})
                    </span>
                  )}
                </span>
              ))}
              <Arr />
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-[1.5px] border-success-500 bg-[#ECFDF5]">
                <IconCheck
                  width={10}
                  height={10}
                  strokeWidth={3}
                  className="text-success-500"
                />
              </span>
              <span className="ml-1.5 rounded bg-primary-500 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                Piloto jul
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-dashed border-wf-3 pt-6">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-wf-5">
            Post-piloto
          </span>
          <div className="h-px flex-1 border-t border-dashed border-wf-3" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {['Registro / Login', 'RSVP invitado', 'Top-K comparador'].map(
            (label) => (
              <span
                key={label}
                className="rounded-[7px] border-[1.5px] border-dashed border-wf-4 bg-wf-1 px-3.5 py-1.5 text-xs text-wf-5 opacity-70"
              >
                {label}
              </span>
            ),
          )}
        </div>
      </div>

      <p className="mt-7 border-l-[3px] border-wf-3 pl-2.5 text-xs text-neutral-500">
        <strong className="text-neutral-700">Auth:</strong> acceso directo en
        piloto (sin registro).
      </p>
    </>
  );
}
