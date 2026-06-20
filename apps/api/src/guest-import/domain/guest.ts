import type { GuestRestriction } from './restriction-suggestion';

export type GuestPreferenceControl = 'colaborativo' | 'anfitrion_exclusivo';

export type Guest = {
  id: string;
  eventId: string;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  categoriaIds: string[];
  observaciones: string;
  acompananteKey: string;
  separarAcompanante: boolean | null;
  preferenciaControl: GuestPreferenceControl | null;
  restrictions: GuestRestriction[];
  createdAt: string;
  updatedAt: string;
};

export type GuestCategory = {
  id: string;
  eventId: string;
  name: string;
  normalizedName: string;
};
