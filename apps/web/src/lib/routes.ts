export function eventBasePath(eventId: string): string {
  return `/admin/events/${eventId}`;
}

export function adminRoutes(eventId: string) {
  const base = eventBasePath(eventId);
  return {
    dashboard: base,
    config: `${base}/config`,
    floorPlan: `${base}/floor-plan`,
    floorPlanLayout: `${base}/floor-plan/layout`,
    guests: `${base}/guests`,
    guestErrors: `${base}/guests/errors`,
    preferences: `${base}/preferences`,
    tables: `${base}/tables`,
    distribution: `${base}/distribution`,
    navMap: `${base}/nav-map`,
  } as const;
}

export const adminEntryPaths = {
  root: '/admin',
  newEvent: '/admin/events/new',
} as const;
