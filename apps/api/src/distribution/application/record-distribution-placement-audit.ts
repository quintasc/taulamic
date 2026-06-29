import type { ActorRole } from '../../common/domain/actor-role';
import type { DistributionPlacementAuditSnapshot } from '../../event-governance-audit/domain/governance-audit-entry';
import { RecordDistributionPlacementAuditUseCase } from '../../event-governance-audit/application/governance-audit.use-case';
import type { DistributionProposal } from '../domain/distribution.types';

type PlacementRef = {
  tableId: string;
  tableLabel: string;
};

export async function recordDistributionPlacementAudit(
  recorder: RecordDistributionPlacementAuditUseCase,
  input: {
    eventId: string;
    actorRole: ActorRole;
    guestId: string;
    action: DistributionPlacementAuditSnapshot['action'];
    from: PlacementRef | null;
    to: PlacementRef | null;
    companionSeparationWarning?: boolean;
  },
): Promise<void> {
  await recorder.execute({
    eventId: input.eventId,
    actorRole: input.actorRole,
    before: null,
    after: {
      action: input.action,
      guestId: input.guestId,
      fromTableId: input.from?.tableId ?? null,
      fromTableLabel: input.from?.tableLabel ?? null,
      toTableId: input.to?.tableId ?? null,
      toTableLabel: input.to?.tableLabel ?? null,
      companionSeparationWarning: input.companionSeparationWarning ?? false,
    },
  });
}

export function findGuestPlacement(
  proposal: DistributionProposal,
  guestId: string,
): PlacementRef | null {
  const placement = proposal.placements.find((item) => item.guestId === guestId);
  if (!placement) {
    return null;
  }

  return {
    tableId: placement.tableId,
    tableLabel: placement.tableLabel,
  };
}

export function findTableRef(
  tables: Array<{ id: string; label: string }>,
  tableId: string,
): PlacementRef | null {
  const table = tables.find((item) => item.id === tableId);
  if (!table) {
    return null;
  }

  return {
    tableId: table.id,
    tableLabel: table.label,
  };
}
