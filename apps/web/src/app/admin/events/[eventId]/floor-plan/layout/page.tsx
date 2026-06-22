'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FloorPlanLayoutEmpty,
  FloorPlanLayoutView,
} from '@/components/admin/floor-plan/floor-plan-layout-view';
import { Alert } from '@/components/ui';
import { ApiError, distributionApi } from '@/lib/api';
import {
  buildDistributionTableGroups,
  type DistributionTableGroup,
} from '@/lib/distribution-view';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

export default function FloorPlanLayoutPage() {
  const params = useParams<{ eventId: string }>();
  const routes = adminRoutes(params.eventId);
  const { event } = useEvent();
  const [loading, setLoading] = useState(true);
  const [missingDistribution, setMissingDistribution] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableGroups, setTableGroups] = useState<DistributionTableGroup[]>([]);

  useEffect(() => {
    void distributionApi
      .get(params.eventId)
      .then((proposal) => {
        setTableGroups(buildDistributionTableGroups(proposal, event));
        setMissingDistribution(false);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setMissingDistribution(true);
          return;
        }
        setError('No se pudo cargar la distribución.');
      })
      .finally(() => setLoading(false));
  }, [params.eventId, event]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando plano…</p>;
  }

  if (error) {
    return (
      <div className="mb-6">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (missingDistribution) {
    return <FloorPlanLayoutEmpty distributionHref={routes.distribution} />;
  }

  return (
    <FloorPlanLayoutView
      tableGroups={tableGroups}
      distributionHref={routes.distribution}
      setupHref={routes.floorPlan}
    />
  );
}
