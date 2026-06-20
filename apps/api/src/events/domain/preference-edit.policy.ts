import type { ActorRole } from '../../common/domain/actor-role';
import type { PreferenceControlMode } from './preference-control-mode';

export function canActorEditGuestPreferences(
  mode: PreferenceControlMode,
  actorRole: ActorRole,
): boolean {
  if (actorRole === 'admin') {
    return true;
  }
  return mode === 'colaborativo';
}

export function preferenceEditFeedbackMessage(
  mode: PreferenceControlMode,
  actorRole: ActorRole,
): string | null {
  if (canActorEditGuestPreferences(mode, actorRole)) {
    return null;
  }

  if (actorRole === 'guest' && mode === 'anfitrion_exclusivo') {
    return 'Las preferencias de asiento solo las gestiona el anfitrion en este evento.';
  }

  return 'No tienes permiso para editar preferencias en este evento.';
}
