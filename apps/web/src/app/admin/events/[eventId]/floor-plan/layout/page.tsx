'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  FloorPlanLayoutEmpty,
  FloorPlanLayoutView,
} from '@/components/admin/floor-plan/floor-plan-layout-view';
import { Alert } from '@/components/ui';
import { ApiError, distributionApi, eventsApi, guestsApi, type DistributionProposal, type GuestView } from '@/lib/api';
import { buildDistributionTableGroups, buildUnassignedGuestOptions } from '@/lib/distribution-view';
import { useDistributionPlacementMutations } from '@/hooks/use-distribution-placement-mutations';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationWarning, setMutationWarning] = useState<string | null>(null);
  const [proposal, setProposal] = useState<DistributionProposal | null>(null);
  const [guests, setGuests] = useState<GuestView[]>([]);
  const [roomSetup, setRoomSetup] = useState<FloorPlanSetup>(
    DEFAULT_FLOOR_PLAN_SETUP,
  );

  const {
    unassigningGuestId,
    assigningGuestId,
    movingGuestId,
    unassignGuest,
    assignGuest,
    moveGuest,
    updateGuestSeat,
  } = useDistributionPlacementMutations(
    params.eventId,
    setProposal,
    setMutationWarning,
    setMutationError,
  );

  const tableGroups = useMemo(
    () => (proposal ? buildDistributionTableGroups(proposal, event) : []),
    [proposal, event],
  );

  const unassignedGuests = useMemo(
    () =>
      proposal
        ? buildUnassignedGuestOptions(proposal.unassignedGuestIds, guests)
        : [],
    [proposal, guests],
  );

  useEffect(() => {
    void guestsApi
      .list(params.eventId)
      .then((response) => setGuests(response.guests))
      .catch(() => setGuests([]));
  }, [params.eventId]);

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
        setLoadError('No se pudo cargar la distribución.');
      })
      .finally(() => setLoading(false));
  }, [params.eventId]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando plano…</p>;
  }

  if (loadError) {
    return (
      <div className="mb-6">
        <Alert variant="error">{loadError}</Alert>
      </div>
    );
  }

  if (missingDistribution) {
    return <FloorPlanLayoutEmpty distributionHref={routes.distribution} />;
  }

  return (
    <FloorPlanLayoutView
      eventId={params.eventId}
      proposal={proposal}
      tableGroups={tableGroups}
      roomSetup={roomSetup}
      distributionHref={routes.distribution}
      setupHref={routes.floorPlan}
      editable={proposal?.status === 'draft'}
      unassigningGuestId={unassigningGuestId}
      assigningGuestId={assigningGuestId}
      movingGuestId={movingGuestId}
      unassignedGuests={unassignedGuests}
      onUnassignGuest={(guestId) => void unassignGuest(guestId)}
      onAssignGuest={(tableId, guestId, seatIndex) =>
        assignGuest(tableId, guestId, seatIndex)
      }
      onMoveGuest={(guestId, tableId, seatIndex) =>
        moveGuest(guestId, tableId, seatIndex)
      }
      onUpdateGuestSeat={(guestId, seatIndex) =>
        updateGuestSeat(guestId, seatIndex)
      }
      mutationError={mutationError}
      mutationWarning={mutationWarning}
    />
  );
}
