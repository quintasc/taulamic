import { ConflictException } from '@nestjs/common';
import { assertValidDraftTableInput } from '../../floor-plans/domain/draft-table.validator';
import type { TableShape } from '../../floor-plans/domain/table-shape';
import type { EventConfig } from './event-config';

export type EventTableInput = {
  label?: string;
  shape?: string;
  estimatedCapacity?: number;
};

export function assertEventTablesEditable(event: EventConfig): void {
  if (event.status === 'plan_approved') {
    throw new ConflictException({
      code: 'EVENT_PLAN_APPROVED',
      message:
        'No se pueden modificar mesas tras aprobar el plan final del evento.',
    });
  }
}

export function parseEventTableInput(input: EventTableInput): {
  label: string;
  shape: TableShape;
  capacity: number;
} {
  const validated = assertValidDraftTableInput({
    label: input.label,
    shape: input.shape,
    estimatedCapacity: input.estimatedCapacity,
  });

  return {
    label: validated.label,
    shape: validated.shape as TableShape,
    capacity: validated.estimatedCapacity,
  };
}
