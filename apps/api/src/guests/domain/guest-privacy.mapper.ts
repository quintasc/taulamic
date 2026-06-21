import type { ActorRole } from '../../common/domain/actor-role';
import type { Guest, GuestCategory } from '../../guest-import/domain/guest';

export type GuestCategoryView = {
  id: string;
  name: string;
};

export type GuestView = {
  id: string;
  eventId: string;
  nombre: string;
  correo: string | null;
  telefono: string | null;
  direccion: string | null;
  categories: GuestCategoryView[];
  observaciones: string | null;
  acompananteKey: string | null;
  separarAcompanante: boolean | null;
  preferenciaControl: Guest['preferenciaControl'];
  restrictionCount: number;
  createdAt: string;
  updatedAt: string;
};

export function mapGuestToView(
  guest: Guest,
  categories: GuestCategory[],
  actorRole: ActorRole,
): GuestView {
  const categoryViews = guest.categoriaIds
    .map((categoryId) => categories.find((category) => category.id === categoryId))
    .filter((category): category is GuestCategory => Boolean(category))
    .map((category) => ({ id: category.id, name: category.name }));

  const base: GuestView = {
    id: guest.id,
    eventId: guest.eventId,
    nombre: guest.nombre,
    correo: guest.correo,
    telefono: guest.telefono,
    direccion: guest.direccion,
    categories: categoryViews,
    observaciones: guest.observaciones,
    acompananteKey: guest.acompananteKey || null,
    separarAcompanante: guest.separarAcompanante,
    preferenciaControl: guest.preferenciaControl,
    restrictionCount: guest.restrictions.length,
    createdAt: guest.createdAt,
    updatedAt: guest.updatedAt,
  };

  if (actorRole === 'admin') {
    return base;
  }

  return {
    ...base,
    correo: null,
    telefono: null,
    direccion: null,
    observaciones: null,
  };
}
