'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import {
  countTablesByStatus,
  filterDistributionTableGroups,
  type DistributionTableFilter,
  type DistributionTableGroup,
  type TableOccupancyStatus,
} from '@/lib/distribution-view';

const STATUS_FILTER_OPTIONS: Array<{
  id: DistributionTableFilter;
  label: string;
  countKey: keyof ReturnType<typeof countTablesByStatus>;
}> = [
  { id: 'all', label: 'Todas', countKey: 'all' },
  { id: 'full', label: 'Llenas', countKey: 'full' },
  { id: 'in-use', label: 'En uso', countKey: 'inUse' },
  { id: 'empty', label: 'Vacías', countKey: 'empty' },
];

function tableCardClass(status: TableOccupancyStatus): string {
  switch (status) {
    case 'full':
      return 'border-success-500/40 bg-success-500/5 text-success-500';
    case 'in-use':
      return 'border-warning-500/40 bg-warning-500/5 text-warning-500';
    case 'empty':
      return 'border-neutral-200 bg-neutral-50 text-neutral-500';
  }
}

function TablePreviewCard({ group }: { group: DistributionTableGroup }) {
  const isRound =
    group.shapeLabel === 'Redonda' || group.shapeLabel === 'Ovalada';

  return (
    <div
      className={`flex flex-col items-center justify-center border-2 px-3 py-4 ${tableCardClass(group.status)} ${
        isRound ? 'aspect-square min-w-[88px] rounded-full' : 'min-w-[100px] rounded-xl'
      }`}
    >
      <span className="text-sm font-bold">{group.tableLabel}</span>
      <span className="mt-1 text-xs font-medium">
        {group.assignedCount}/{group.capacity}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  count,
  status,
}: {
  label: string;
  count: number;
  status: TableOccupancyStatus;
}) {
  const dotClass =
    status === 'full'
      ? 'bg-success-500'
      : status === 'in-use'
        ? 'bg-warning-500'
        : 'bg-neutral-500';

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-neutral-700">
        <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />
        {label}
      </span>
      <span className="font-semibold text-neutral-900">{count}</span>
    </div>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-neutral-900 text-white'
          : 'border border-neutral-200 bg-neutral-0 text-neutral-700 hover:bg-neutral-50'
      }`}
      onClick={onClick}
    >
      {label}
      <span className={active ? 'text-neutral-300' : 'text-neutral-500'}>
        {count}
      </span>
    </button>
  );
}

export function FloorPlanLayoutView({
  tableGroups,
  distributionHref,
  setupHref,
}: {
  tableGroups: DistributionTableGroup[];
  distributionHref: string;
  setupHref: string;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<DistributionTableFilter>('all');
  const [shapeFilter, setShapeFilter] = useState<string | 'all'>('all');

  const statusCounts = useMemo(
    () => countTablesByStatus(tableGroups),
    [tableGroups],
  );

  const shapeOptions = useMemo(() => {
    const labels = [...new Set(tableGroups.map((group) => group.shapeLabel))].sort(
      (a, b) => a.localeCompare(b, 'es'),
    );

    return [
      { id: 'all' as const, label: 'Todas', count: tableGroups.length },
      ...labels.map((label) => ({
        id: label,
        label,
        count: tableGroups.filter((group) => group.shapeLabel === label).length,
      })),
    ];
  }, [tableGroups]);

  const filteredGroups = useMemo(
    () =>
      filterDistributionTableGroups(
        tableGroups,
        statusFilter,
        search,
        shapeFilter,
      ),
    [tableGroups, statusFilter, search, shapeFilter],
  );

  const counts = statusCounts;

  return (
    <>
      <PageHeader
        title="Plano del salón"
        subtitle="Arrastra las mesas para posicionarlas. Las formas reflejan la distribución calculada."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled>
              Restablecer
            </button>
            <button type="button" className="btn-primary" disabled>
              Guardar posiciones
            </button>
          </div>
        }
      />

      <div className="mb-6">
        <Alert variant="info">
          Arrastrar y guardar posiciones en el canvas — disponible post-MVP.
          Vista previa de la distribución calculada.
        </Alert>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="card-admin min-h-[480px] border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-6">
          {filteredGroups.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {filteredGroups.map((group) => (
                <TablePreviewCard key={group.tableId} group={group} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-neutral-700">
                Ninguna mesa coincide con los filtros
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Prueba otro nombre o cambia estado / forma
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card-admin">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
              Resumen
            </h2>
            <div className="mt-4 space-y-3">
              <SummaryRow label="Llenas" count={counts.full} status="full" />
              <SummaryRow
                label="En uso"
                count={counts.inUse}
                status="in-use"
              />
              <SummaryRow label="Vacías" count={counts.empty} status="empty" />
            </div>
          </div>

          <div className="card-admin space-y-4">
            <div>
              <label
                htmlFor="floor-plan-table-search"
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5"
              >
                Buscar mesa
              </label>
              <input
                id="floor-plan-table-search"
                type="search"
                className="input-field mt-2 w-full py-2 text-sm"
                placeholder="Ej. M1, M12…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
                Estado
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.id}
                    active={statusFilter === option.id}
                    label={option.label}
                    count={statusCounts[option.countKey]}
                    onClick={() => setStatusFilter(option.id)}
                  />
                ))}
              </div>
            </div>

            {shapeOptions.length > 1 ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
                  Forma
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shapeOptions.map((option) => (
                    <FilterChip
                      key={option.id}
                      active={shapeFilter === option.id}
                      label={option.label}
                      count={option.count}
                      onClick={() => setShapeFilter(option.id)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <p className="text-xs text-neutral-500">
              {filteredGroups.length} de {tableGroups.length}{' '}
              {tableGroups.length === 1 ? 'mesa visible' : 'mesas visibles'}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <Link href={distributionHref} className="btn-secondary text-center">
              Volver a distribución
            </Link>
            <Link
              href={setupHref}
              className="text-center text-neutral-500 hover:text-neutral-700"
            >
              Configurar plano del salón
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}

export function FloorPlanLayoutEmpty({
  distributionHref,
}: {
  distributionHref: string;
}) {
  return (
    <EmptyState
      title="Sin distribución calculada"
      description="Calcula la distribución antes de visualizar las mesas en el plano."
      action={
        <Link href={distributionHref} className="btn-primary">
          Ir a distribución
        </Link>
      }
    />
  );
}
