'use client';

import {
  IconRsvpConfirmed,
  IconRsvpDeclined,
  IconRsvpPending,
} from '@/components/icons';
import type { GuestRsvpStatus } from '@/lib/guest-ui-meta';
import { rsvpIconClass } from '@/lib/semantic-ui';

export function GuestRsvpIcon({
  status,
  size = 18,
}: {
  status: GuestRsvpStatus;
  size?: number;
}) {
  const props = {
    width: size,
    height: size,
    className: `shrink-0 ${rsvpIconClass(status)}`,
  };
  if (status === 'confirmed') {
    return <IconRsvpConfirmed {...props} />;
  }
  if (status === 'declined') {
    return <IconRsvpDeclined {...props} />;
  }
  return <IconRsvpPending {...props} />;
}
