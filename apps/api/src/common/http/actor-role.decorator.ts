import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  DEFAULT_ACTOR_ROLE,
  parseActorRole,
  type ActorRole,
} from '../domain/actor-role';

export const ActorRoleHeader = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ActorRole => {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, unknown> }>();
    const raw = request.headers['x-taulamic-actor-role'];
    if (raw === undefined || raw === null || raw === '') {
      return DEFAULT_ACTOR_ROLE;
    }
    return parseActorRole(Array.isArray(raw) ? raw[0] : raw);
  },
);
