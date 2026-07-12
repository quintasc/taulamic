import type { GuestPlacement } from './distribution.types';
import {
  assignCompanionAwareSeatFallback,
  assignSequentialSeatFallback,
} from './seat-assignment-fallback';

describe('seat-assignment-fallback', () => {
  it('asigna S1..Sn en orden', () => {
    const placements: GuestPlacement[] = [
      { guestId: 'g1', guestName: 'Ana', tableId: 't1', tableLabel: 'M1' },
      { guestId: 'g2', guestName: 'Luis', tableId: 't1', tableLabel: 'M1' },
    ];

    assignSequentialSeatFallback(placements, ['g1', 'g2'], 8);

    expect(placements[0].seatIndex).toBe(0);
    expect(placements[0].seatLabel).toBe('S1');
    expect(placements[1].seatIndex).toBe(1);
    expect(placements[1].seatLabel).toBe('S2');
  });

  it('coloca parejas keepTogether en sillas adyacentes', () => {
    const placements: GuestPlacement[] = [
      { guestId: 'g1', guestName: 'Ana', tableId: 't1', tableLabel: 'M1' },
      { guestId: 'g2', guestName: 'Luis', tableId: 't1', tableLabel: 'M1' },
      { guestId: 'g3', guestName: 'Pau', tableId: 't1', tableLabel: 'M1' },
    ];

    assignCompanionAwareSeatFallback(
      placements,
      ['g1', 'g2', 'g3'],
      8,
      [{ leftGuestId: 'g1', rightGuestId: 'g2' }],
      [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 0, to: 7 },
      ],
    );

    const ana = placements.find((entry) => entry.guestId === 'g1');
    const luis = placements.find((entry) => entry.guestId === 'g2');
    expect(ana?.seatIndex).toBeDefined();
    expect(luis?.seatIndex).toBeDefined();

    const delta = Math.abs((ana?.seatIndex ?? 0) - (luis?.seatIndex ?? 0));
    expect(delta === 1 || delta === 7).toBe(true);
  });
});
