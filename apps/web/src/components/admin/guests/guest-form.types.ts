import type { GuestV2DetailMeta } from '@/lib/guest-v2-detail-meta';

export type GuestFormInput = {
  nombre: string;
  correo: string;
  telefono: string;
  categoryNames?: string[];
};

/** Payload del drawer v2: datos API + meta local (alertas, notas). */
export type GuestDrawerSubmit = {
  input: GuestFormInput;
  detailMeta: Pick<
    GuestV2DetailMeta,
    'dietaryAlert' | 'mobilityAlert' | 'notes' | 'companionGroup'
  >;
};
