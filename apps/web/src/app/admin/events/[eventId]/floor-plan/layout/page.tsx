'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  FloorPlanLayoutEmpty,
  FloorPlanLayoutView,
} from '@/components/admin/floor-plan/floor-plan-layout-view';
import { Alert } from '@/components/ui';
import { ApiError, distributionApi, type DistributionProposal } from '@/lib/api';
import { buildDistributionTableGroups } from '@/lib/distribution-view';
import {
  DEFAULT_FLOOR_PLAN_SETUP,
  loadFloorPlanSetup,
  type FloorPlanSetup,
} from '@/lib/floor-plan-setup';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

export default function FloorPlanLayoutPage() {
  const params = useParams<{ eventId: string }>();
  const routes = adminRoutes(params.eventId);
  const { event } = useEvent();
  const [loading, setLoading] = useState(true);
  const [missingDistribution, setMissingDistribution] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<DistributionProposal | null>(null);
  const [roomSetup, setRoomSetup] = useState<FloorPlanSetup>(
    DEFAULT_FLOOR_PLAN_SETUP,
  );

  const tableGroups = useMemo(
    () => (proposal ? buildDistributionTableGroups(proposal, event) : []),
    [proposal, event],
  );

  useEffect(() => {
    setRoomSetup(loadFloorPlanSetup(params.eventId));
  }, [params.eventId]);

  useEffect(() => {
    void distributionApi
      .get(params.eventId)
      .then((loaded) => {
        setProposal(loaded);
        setMissingDistribution(false);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setMissingDistribution(true);
          setProposal(null);
          return;
        }
        setError('No se pudo cargar la distribución.');
      })
      .finally(() => setLoading(false));
  }, [params.eventId]);

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
      roomSetup={roomSetup}
      distributionHref={routes.distribution}
      setupHref={routes.floorPlan}
    />
  );
}
