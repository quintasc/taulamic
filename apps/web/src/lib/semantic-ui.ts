import type { TableOccupancyStatus } from '@/lib/distribution-view';
import type { GuestRsvpStatus } from '@/lib/guest-ui-meta';

/** Colores semánticos alineados con design-tokens-mvp.md */

export function tableStatusCardClass(status: TableOccupancyStatus): string {
  switch (status) {
    case 'full':
      return 'border-success-500/40 bg-success-500/5 text-success-500';
    case 'in-use':
      return 'border-warning-500/40 bg-warning-500/5 text-warning-500';
    case 'empty':
      return 'border-neutral-200 bg-neutral-50 text-neutral-500';
  }
}

export function tableStatusDotClass(status: TableOccupancyStatus): string {
  switch (status) {
    case 'full':
      return 'bg-success-500';
    case 'in-use':
      return 'bg-warning-500';
    case 'empty':
      return 'bg-neutral-300';
  }
}

export function tableStatusBarClass(status: TableOccupancyStatus): string {
  switch (status) {
    case 'full':
      return 'bg-success-500';
    case 'in-use':
      return 'bg-warning-500';
    case 'empty':
      return 'bg-wf-3';
  }
}

export function tableStatusBadgeClass(status: TableOccupancyStatus): string {
  switch (status) {
    case 'full':
      return 'border-success-500/30 bg-success-500/10 text-success-500';
    case 'in-use':
      return 'border-warning-500/30 bg-warning-500/10 text-warning-500';
    case 'empty':
      return 'border-neutral-200 bg-neutral-100 text-neutral-500';
  }
}

export function filterChipClass(active: boolean): string {
  return active
    ? 'bg-primary-500 text-white'
    : 'border border-neutral-200 bg-neutral-0 text-neutral-700 hover:bg-neutral-50';
}

export function filterChipCountClass(active: boolean): string {
  return active ? 'text-primary-100' : 'text-neutral-500';
}

export function rsvpIconClass(status: GuestRsvpStatus): string {
  switch (status) {
    case 'confirmed':
      return 'text-success-500';
    case 'declined':
      return 'text-error-500';
    case 'pending':
      return 'text-neutral-400';
  }
}

export function invitationSentBadgeClass(sent: boolean): string {
  return sent
    ? 'border-primary-500/40 bg-primary-500/10 text-primary-600'
    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300';
}
