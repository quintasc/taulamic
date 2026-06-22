import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { reconcileProposalAfterTableRemoved } from '../../distribution/domain/reconcile-proposal-after-table-removed';
import {
  DISTRIBUTION_REPOSITORY,
  type DistributionRepositoryPort,
} from '../../distribution/infrastructure/persistence/distribution.repository.port';
import {
  EventConfig,
  summarizeEventCapacity,
} from '../domain/event-config';
import {
  assertEventTablesEditable,
  parseEventTableInput,
} from '../domain/event-table.validator';
import {
  EVENT_CONFIG_REPOSITORY,
  type EventConfigRepositoryPort,
} from '../infrastructure/persistence/event-config.repository.port';

export type EventDetail = EventConfig & {
  capacitySummary: ReturnType<typeof summarizeEventCapacity>;
};

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly repository: EventConfigRepositoryPort,
  ) {}

  async execute(name: string): Promise<EventDetail> {
    const trimmed = name?.trim();
    if (!trimmed) {
      throw new BadRequestException({
        code: 'INVALID_EVENT_NAME',
        message: 'El nombre del evento es obligatorio.',
      });
    }

    const event = await this.repository.create({ name: trimmed });
    return toEventDetail(event);
  }
}

@Injectable()
export class GetEventUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly repository: EventConfigRepositoryPort,
  ) {}

  async execute(eventId: string): Promise<EventDetail> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    return toEventDetail(event);
  }
}

@Injectable()
export class UpdateEventUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly repository: EventConfigRepositoryPort,
  ) {}

  async execute(eventId: string, name?: string): Promise<EventDetail> {
    if (name !== undefined && !name.trim()) {
      throw new BadRequestException({
        code: 'INVALID_EVENT_NAME',
        message: 'El nombre del evento es obligatorio.',
      });
    }

    const event = await this.repository.update(eventId, { name });
    return toEventDetail(event);
  }
}

@Injectable()
export class AddEventTableUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly repository: EventConfigRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    input: { label?: string; shape?: string; estimatedCapacity?: number },
  ): Promise<EventDetail> {
    await this.requireEditableEvent(eventId);
    const parsed = parseEventTableInput(input);

    const updated = await this.repository.addTable(eventId, {
      label: parsed.label,
      shape: parsed.shape,
      capacity: parsed.capacity,
    });

    return toEventDetail(updated);
  }

  private async requireEditableEvent(eventId: string): Promise<EventConfig> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    assertEventTablesEditable(event);
    return event;
  }
}

@Injectable()
export class UpdateEventTableUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly repository: EventConfigRepositoryPort,
  ) {}

  async execute(
    eventId: string,
    tableId: string,
    input: { label?: string; shape?: string; estimatedCapacity?: number },
  ): Promise<EventDetail> {
    const event = await this.requireEditableEvent(eventId);
    const current = event.tables.find((table) => table.id === tableId);

    if (!current) {
      throw new NotFoundException({
        code: 'EVENT_TABLE_NOT_FOUND',
        message: 'No se encontro la mesa indicada en el evento.',
        details: { tableId },
      });
    }

    const parsed = parseEventTableInput({
      label: input.label ?? current.label,
      shape: input.shape ?? current.shape,
      estimatedCapacity: input.estimatedCapacity ?? current.capacity,
    });

    const updated = await this.repository.updateTable(eventId, tableId, {
      label: parsed.label,
      shape: parsed.shape,
      capacity: parsed.capacity,
    });

    return toEventDetail(updated);
  }

  private async requireEditableEvent(eventId: string): Promise<EventConfig> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    assertEventTablesEditable(event);
    return event;
  }
}

@Injectable()
export class RemoveEventTableUseCase {
  constructor(
    @Inject(EVENT_CONFIG_REPOSITORY)
    private readonly repository: EventConfigRepositoryPort,
    @Inject(DISTRIBUTION_REPOSITORY)
    private readonly distributionRepository: DistributionRepositoryPort,
  ) {}

  async execute(eventId: string, tableId: string): Promise<EventDetail> {
    await this.requireEditableEvent(eventId);
    const updated = await this.repository.removeTable(eventId, tableId);

    const proposal =
      await this.distributionRepository.findLatestByEventId(eventId);
    if (proposal) {
      const reconciled = reconcileProposalAfterTableRemoved(
        proposal,
        tableId,
        updated.tables.map((table) => ({
          id: table.id,
          capacity: table.capacity,
        })),
      );
      if (reconciled) {
        await this.distributionRepository.save(reconciled);
      }
    }

    return toEventDetail(updated);
  }

  private async requireEditableEvent(eventId: string): Promise<EventConfig> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'No se encontro el evento indicado.',
        details: { eventId },
      });
    }

    assertEventTablesEditable(event);
    return event;
  }
}

function toEventDetail(event: EventConfig): EventDetail {
  return {
    ...event,
    capacitySummary: summarizeEventCapacity(event.tables),
  };
}
