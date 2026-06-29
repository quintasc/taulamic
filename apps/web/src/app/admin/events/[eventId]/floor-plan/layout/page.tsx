'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  FloorPlanLayoutEmpty,
  FloorPlanLayoutView,
} from '@/components/admin/floor-plan/floor-plan-layout-view';
import { Alert } from '@/components/ui';
import { ApiError, distributionApi, eventsApi, type DistributionProposal } from '@/lib/api';
import { buildDistributionTableGroups } from '@/lib/distribution-view';
import {
  DEFAULT_FLOOR_PLAN_SETUP,
  loadFloorPlanSetup,
  normalizeSetupForShape,
  saveFloorPlanSetup,
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
  const [unassigningGuestId, setUnassigningGuestId] = useState<string | null>(
    null,
  );
  const [roomSetup, setRoomSetup] = useState<FloorPlanSetup>(
    DEFAULT_FLOOR_PLAN_SETUP,
  );

  const tableGroups = useMemo(
    () => (proposal ? buildDistributionTableGroups(proposal, event) : []),
    [proposal, event],
  );

  useEffect(() => {
    let cancelled = false;
    setRoomSetup(loadFloorPlanSetup(params.eventId));

    void eventsApi
      .getRoomSetup(params.eventId)
      .then((remote) => {
        if (cancelled) {
          return;
        }
        const fromApi = normalizeSetupForShape({
          shape: remote.shape,
          widthM: remote.widthM,
          lengthM: remote.lengthM,
          radiusM: remote.radiusM,
          placedAccessories: remote.placedAccessories,
        });
        setRoomSetup(fromApi);
        saveFloorPlanSetup(params.eventId, fromApi);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          return;
        }
      });

    return () => {
      cancelled = true;
    };
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

  async function unassignGuest(guestId: string) {
    setUnassigningGuestId(guestId);
    setError(null);
    try {
      const result = await distributionApi.unassignGuest(params.eventId, guestId);
      setProposal(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo quitar el invitado de la mesa.',
      );
    } finally {
      setUnassigningGuestId(null);
    }
  }

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
      editable={proposal?.status === 'draft'}
      unassigningGuestId={unassigningGuestId}
      onUnassignGuest={(guestId) => void unassignGuest(guestId)}
    />
  );
}
