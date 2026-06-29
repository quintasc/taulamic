import { Inject, Injectable } from '@nestjs/common';
import type { ActorRole } from '../../common/domain/actor-role';
import { AssertAdminActorUseCase } from '../../events/application/preference-permissions.use-case';
import type {
  GovernanceAuditEntry,
  RecordCompanionSeparationAuditInput,
  RecordDistributionPlacementAuditInput,
  RecordPreferenceModeAuditInput,
} from '../domain/governance-audit-entry';
import {
  EVENT_GOVERNANCE_AUDIT_REPOSITORY,
  type EventGovernanceAuditRepositoryPort,
} from '../infrastructure/persistence/event-governance-audit.repository.port';

@Injectable()
export class RecordPreferenceModeAuditUseCase {
  constructor(
    @Inject(EVENT_GOVERNANCE_AUDIT_REPOSITORY)
    private readonly repository: EventGovernanceAuditRepositoryPort,
  ) {}

  execute(
    input: RecordPreferenceModeAuditInput,
  ): Promise<GovernanceAuditEntry> {
    return this.repository.appendPreferenceModeChange(input);
  }
}

@Injectable()
export class RecordCompanionSeparationAuditUseCase {
  constructor(
    @Inject(EVENT_GOVERNANCE_AUDIT_REPOSITORY)
    private readonly repository: EventGovernanceAuditRepositoryPort,
  ) {}

  execute(
    input: RecordCompanionSeparationAuditInput,
  ): Promise<GovernanceAuditEntry> {
    return this.repository.appendCompanionSeparationChange(input);
  }
}

@Injectable()
export class RecordDistributionPlacementAuditUseCase {
  constructor(
    @Inject(EVENT_GOVERNANCE_AUDIT_REPOSITORY)
    private readonly repository: EventGovernanceAuditRepositoryPort,
  ) {}

  execute(
    input: RecordDistributionPlacementAuditInput,
  ): Promise<GovernanceAuditEntry> {
    return this.repository.appendDistributionPlacementChange(input);
  }
}

@Injectable()
export class ListEventGovernanceAuditUseCase {
  constructor(
    @Inject(EVENT_GOVERNANCE_AUDIT_REPOSITORY)
    private readonly repository: EventGovernanceAuditRepositoryPort,
    private readonly assertAdminActorUseCase: AssertAdminActorUseCase,
  ) {}

  async execute(
    eventId: string,
    actorRole: ActorRole,
  ): Promise<GovernanceAuditEntry[]> {
    this.assertAdminActorUseCase.execute(actorRole);
    return this.repository.listEntries(eventId);
  }
}
