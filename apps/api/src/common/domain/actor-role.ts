export const ACTOR_ROLES = ['admin', 'guest'] as const;

export type ActorRole = (typeof ACTOR_ROLES)[number];

export const DEFAULT_ACTOR_ROLE: ActorRole = 'admin';

export function parseActorRole(raw: unknown): ActorRole {
  if (raw === 'guest') {
    return 'guest';
  }
  return 'admin';
}
