export type GuestFilterChip =
  | 'all'
  | 'pending-rsvp'
  | 'confirmed'
  | 'declined'
  | 'dietary'
  | 'mobility'
  | 'no-category';

export const GUEST_FILTER_CHIPS: { id: GuestFilterChip; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'pending-rsvp', label: 'Pendientes de confirmar' },
  { id: 'declined', label: 'Invitación rechazada' },
  { id: 'dietary', label: 'Menú especial' },
  { id: 'mobility', label: 'Movilidad reducida' },
  { id: 'no-category', label: 'Sin categoría' },
];

export function guestFilterLabel(filter: GuestFilterChip): string {
  return GUEST_FILTER_CHIPS.find((chip) => chip.id === filter)?.label ?? 'Todos';
}
