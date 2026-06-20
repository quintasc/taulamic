import {
  canActorEditGuestPreferences,
  preferenceEditFeedbackMessage,
} from './preference-edit.policy';

describe('preference-edit.policy', () => {
  it('permite editar a admin en cualquier modo', () => {
    expect(canActorEditGuestPreferences('colaborativo', 'admin')).toBe(true);
    expect(canActorEditGuestPreferences('anfitrion_exclusivo', 'admin')).toBe(
      true,
    );
  });

  it('permite editar a invitado solo en modo colaborativo', () => {
    expect(canActorEditGuestPreferences('colaborativo', 'guest')).toBe(true);
    expect(canActorEditGuestPreferences('anfitrion_exclusivo', 'guest')).toBe(
      false,
    );
  });

  it('devuelve mensaje claro cuando invitado no puede editar', () => {
    expect(
      preferenceEditFeedbackMessage('anfitrion_exclusivo', 'guest'),
    ).toContain('anfitrion');
    expect(preferenceEditFeedbackMessage('colaborativo', 'guest')).toBeNull();
  });
});
