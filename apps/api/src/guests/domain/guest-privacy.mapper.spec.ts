import { mapGuestToView } from './guest-privacy.mapper';
import type { Guest, GuestCategory } from '../../guest-import/domain/guest';

describe('mapGuestToView', () => {
  const guest: Guest = {
    id: 'guest-1',
    eventId: 'evt_1',
    nombre: 'Ana Garcia',
    correo: 'ana@ejemplo.com',
    telefono: '+34600111222',
    direccion: 'Calle Mayor 1',
    categoriaIds: ['cat-1'],
    observaciones: 'Intolerancia lactosa',
    acompananteKey: 'PAREJA_001',
    separarAcompanante: false,
    companionSeparationReason: null,
    companionSeparationOrigin: null,
    companionSeparationAt: null,
    preferenciaControl: null,
    restrictions: [{ id: 'r1' } as Guest['restrictions'][number]],
    createdAt: '2026-06-21T10:00:00.000Z',
    updatedAt: '2026-06-21T10:00:00.000Z',
  };

  const categories: GuestCategory[] = [
    {
      id: 'cat-1',
      eventId: 'evt_1',
      name: 'Familia novia',
      normalizedName: 'familia novia',
    },
  ];

  it('expone datos completos a admin', () => {
    const view = mapGuestToView(guest, categories, 'admin');
    expect(view.correo).toBe('ana@ejemplo.com');
    expect(view.observaciones).toContain('Intolerancia');
  });

  it('oculta datos sensibles a invitados', () => {
    const view = mapGuestToView(guest, categories, 'guest');
    expect(view.correo).toBeNull();
    expect(view.telefono).toBeNull();
    expect(view.direccion).toBeNull();
    expect(view.observaciones).toBeNull();
    expect(view.nombre).toBe('Ana Garcia');
  });
});
