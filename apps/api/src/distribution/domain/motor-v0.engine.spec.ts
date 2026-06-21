import type { EventTable } from '../../events/domain/event-config';
import type { Guest } from '../../guest-import/domain/guest';
import { runMotorV0 } from './motor-v0.engine';

function guest(
  id: string,
  nombre: string,
  overrides: Partial<Guest> = {},
): Guest {
  return {
    id,
    eventId: 'evt_1',
    nombre,
    correo: `${id}@ejemplo.com`,
    telefono: '',
    direccion: '',
    categoriaIds: [],
    observaciones: '',
    acompananteKey: '',
    separarAcompanante: null,
    companionSeparationReason: null,
    companionSeparationOrigin: null,
    companionSeparationAt: null,
    preferenciaControl: null,
    restrictions: [],
    createdAt: '2026-06-21T10:00:00.000Z',
    updatedAt: '2026-06-21T10:00:00.000Z',
    ...overrides,
  };
}

function table(id: string, label: string, capacity: number): EventTable {
  return {
    id,
    label,
    shape: 'redonda',
    capacity,
    createdAt: '2026-06-21T10:00:00.000Z',
    updatedAt: '2026-06-21T10:00:00.000Z',
  };
}

describe('runMotorV0', () => {
  const createdAt = '2026-06-21T12:00:00.000Z';

  it('asigna invitados respetando capacidad de mesa', () => {
    const result = runMotorV0({
      eventId: 'evt_1',
      proposalId: 'dist_1',
      createdAt,
      tables: [table('t1', 'Mesa 1', 2), table('t2', 'Mesa 2', 2)],
      guests: [
        guest('g1', 'Ana'),
        guest('g2', 'Luis'),
        guest('g3', 'Maria'),
      ],
    });

    expect(result.motorVersion).toBe('v0-pilot');
    expect(result.stats.assignedCount).toBe(3);
    expect(result.unassignedGuestIds).toEqual([]);
  });

  it('mantiene acompanantes juntos cuando comparten clave', () => {
    const result = runMotorV0({
      eventId: 'evt_1',
      proposalId: 'dist_1',
      createdAt,
      tables: [table('t1', 'Mesa 1', 4), table('t2', 'Mesa 2', 2)],
      guests: [
        guest('g1', 'Ana', { acompananteKey: 'PAREJA_1' }),
        guest('g2', 'Luis', { acompananteKey: 'PAREJA_1' }),
        guest('g3', 'Maria'),
      ],
    });

    const ana = result.placements.find((item) => item.guestId === 'g1');
    const luis = result.placements.find((item) => item.guestId === 'g2');

    expect(ana?.tableId).toBe(luis?.tableId);
    expect(result.unassignedGuestIds).toEqual([]);
  });

  it('no asigna invitados incompatibles en la misma mesa', () => {
    const result = runMotorV0({
      eventId: 'evt_1',
      proposalId: 'dist_1',
      createdAt,
      tables: [table('t1', 'Mesa 1', 4)],
      guests: [
        guest('g1', 'Ana Garcia', {
          restrictions: [
            {
              id: 'r1',
              kind: 'incompatibilidad',
              targetHint: 'Luis Perez',
              description: 'Conflicto',
              origin: 'manual',
              suggestionId: null,
              createdAt,
            },
          ],
        }),
        guest('g2', 'Luis Perez'),
      ],
    });

    expect(result.stats.assignedCount).toBe(1);
    expect(result.unassignedGuestIds).toHaveLength(1);
    expect(result.hardRuleViolations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'NO_VALID_TABLE' }),
      ]),
    );
  });

  it('reporta capacidad insuficiente global', () => {
    const result = runMotorV0({
      eventId: 'evt_1',
      proposalId: 'dist_1',
      createdAt,
      tables: [table('t1', 'Mesa 1', 1)],
      guests: [guest('g1', 'Ana'), guest('g2', 'Luis')],
    });

    expect(result.hardRuleViolations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INSUFFICIENT_TOTAL_CAPACITY' }),
      ]),
    );
  });
});
