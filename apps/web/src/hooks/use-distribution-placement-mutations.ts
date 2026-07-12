'use client';

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { ApiError, distributionApi, type DistributionProposal } from '@/lib/api';
import { notifyDistributionChanged } from '@/lib/distribution-events';
import {
  applyDistributionMutationResult,
  syncProposalAfterMutation,
} from '@/lib/distribution-mutation-feedback';

type ProposalSetter = Dispatch<SetStateAction<DistributionProposal | null>>;

/**
 * Mutaciones manuales de placements (asignar, mover, desasignar, cambiar silla).
 * Compartido entre pantalla Distribución y plano layout (ADR-021).
 */
export function useDistributionPlacementMutations(
  eventId: string | null | undefined,
  setProposal: ProposalSetter,
  setWarning: Dispatch<SetStateAction<string | null>>,
  setMutationError: Dispatch<SetStateAction<string | null>>,
) {
  const [unassigningGuestId, setUnassigningGuestId] = useState<string | null>(
    null,
  );
  const [assigningGuestId, setAssigningGuestId] = useState<string | null>(null);
  const [movingGuestId, setMovingGuestId] = useState<string | null>(null);

  const applyMutationResult = useCallback(
    async (result: DistributionProposal) => {
      if (!eventId) {
        return;
      }
      const synced = await syncProposalAfterMutation(eventId, result);
      applyDistributionMutationResult(
        (proposal) => setProposal(proposal),
        setWarning,
        setMutationError,
        synced,
      );
      notifyDistributionChanged(eventId);
    },
    [eventId, setMutationError, setProposal, setWarning],
  );

  const handleMutationFailure = useCallback(
    (err: unknown, fallbackMessage: string) => {
      setWarning(null);
      setMutationError(
        err instanceof ApiError ? err.message : fallbackMessage,
      );
    },
    [setMutationError, setWarning],
  );

  const unassignGuest = useCallback(
    async (guestId: string) => {
      if (!eventId) {
        return;
      }
      setUnassigningGuestId(guestId);
      setMutationError(null);
      try {
        const result = await distributionApi.unassignGuest(eventId, guestId);
        await applyMutationResult(result);
      } catch (err) {
        handleMutationFailure(err, 'No se pudo quitar el invitado de la mesa.');
      } finally {
        setUnassigningGuestId(null);
      }
    },
    [applyMutationResult, eventId, handleMutationFailure, setMutationError],
  );

  const assignGuest = useCallback(
    async (tableId: string, guestId: string, seatIndex?: number) => {
      if (!eventId) {
        return;
      }
      setAssigningGuestId(guestId);
      setMutationError(null);
      try {
        const result = await distributionApi.assignGuest(
          eventId,
          guestId,
          tableId,
          seatIndex,
        );
        await applyMutationResult(result);
      } catch (err) {
        handleMutationFailure(err, 'No se pudo asignar el invitado a la mesa.');
      } finally {
        setAssigningGuestId(null);
      }
    },
    [applyMutationResult, eventId, handleMutationFailure, setMutationError],
  );

  const moveGuest = useCallback(
    async (guestId: string, tableId: string, seatIndex?: number) => {
      if (!eventId) {
        return;
      }
      setMovingGuestId(guestId);
      setMutationError(null);
      try {
        const result = await distributionApi.moveGuest(
          eventId,
          guestId,
          tableId,
          seatIndex,
        );
        await applyMutationResult(result);
      } catch (err) {
        handleMutationFailure(err, 'No se pudo mover el invitado a la mesa.');
      } finally {
        setMovingGuestId(null);
      }
    },
    [applyMutationResult, eventId, handleMutationFailure, setMutationError],
  );

  const updateGuestSeat = useCallback(
    async (guestId: string, seatIndex: number) => {
      if (!eventId) {
        return;
      }
      setMovingGuestId(guestId);
      setMutationError(null);
      try {
        const result = await distributionApi.updateGuestSeat(
          eventId,
          guestId,
          seatIndex,
        );
        await applyMutationResult(result);
      } catch (err) {
        handleMutationFailure(
          err,
          'No se pudo cambiar el asiento del invitado.',
        );
      } finally {
        setMovingGuestId(null);
      }
    },
    [applyMutationResult, eventId, handleMutationFailure, setMutationError],
  );

  return {
    unassigningGuestId,
    assigningGuestId,
    movingGuestId,
    unassignGuest,
    assignGuest,
    moveGuest,
    updateGuestSeat,
  };
}
