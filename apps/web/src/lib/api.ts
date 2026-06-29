export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { code?: string; message?: string },
  ) {
    super(body.message ?? `Error API ${status}`);
    this.name = 'ApiError';
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('x-taulamic-actor-role', 'admin');

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api/v1${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body);
  }

  return parseJson<T>(response);
}

export type EventDetail = {
  id: string;
  name: string;
  status: 'configuring' | 'plan_approved';
  tables: Array<{
    id: string;
    label: string;
    shape: string;
    capacity: number;
  }>;
  capacitySummary: {
    tableCount: number;
    totalCapacity: number;
  };
};

export type GuestView = {
  id: string;
  nombre: string;
  correo: string | null;
  telefono?: string | null;
  categories: Array<{ name: string }>;
  /** Notas internas (solo admin). */
  observaciones?: string | null;
};

export type GuestListResponse = {
  total: number;
  guests: GuestView[];
};

export type DistributionProposal = {
  id: string;
  motorVersion: string;
  status: 'draft' | 'confirmed';
  placements: Array<{
    guestId: string;
    guestName: string;
    tableId: string;
    tableLabel: string;
  }>;
  unassignedGuestIds: string[];
  stats: {
    assignedCount: number;
    unassignedCount: number;
    tableCount: number;
    totalCapacity: number;
  };
  confirmedAt: string | null;
};

export type PreferenceMode = {
  mode: 'colaborativo' | 'anfitrion_exclusivo';
  version: number;
};

export type TableShapeCatalog = {
  shapes: Array<{
    id: string;
    label: string;
  }>;
};

export type SeatTopology = {
  capacity: number;
  seats: Array<{ index: number; label: string }>;
};

export type ImportValidation = {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    field: string;
    code: string;
    message: string;
  }>;
};

export type ImportBatchResult = {
  eventId: string;
  totalRows: number;
  created: number;
  updated: number;
  rejected: number;
  categoriesEnsured: number;
  suggestionsGenerated: number;
  errors: ImportValidation['errors'];
  detailMetaByCorreo: Record<
    string,
    {
      dietaryAlert: boolean;
      mobilityAlert: boolean;
      notes: string;
    }
  >;
};

export const eventsApi = {
  create: (name: string) =>
    apiFetch<EventDetail>('/events', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  get: (eventId: string) => apiFetch<EventDetail>(`/events/${eventId}`),
  update: (eventId: string, name: string) =>
    apiFetch<EventDetail>(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),
  addTable: (
    eventId: string,
    input: { label: string; shape: string; estimatedCapacity: number },
  ) =>
    apiFetch<EventDetail>(`/events/${eventId}/tables`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTable: (
    eventId: string,
    tableId: string,
    input: { label: string; shape: string; estimatedCapacity: number },
  ) =>
    apiFetch<EventDetail>(`/events/${eventId}/tables/${tableId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  removeTable: (eventId: string, tableId: string) =>
    apiFetch<EventDetail>(`/events/${eventId}/tables/${tableId}`, {
      method: 'DELETE',
    }),
  getRoomSetup: (eventId: string) =>
    apiFetch<RoomSetupResponse>(`/events/${eventId}/room-setup`),
  saveRoomSetup: (eventId: string, setup: RoomSetupPayload) =>
    apiFetch<RoomSetupResponse>(`/events/${eventId}/room-setup`, {
      method: 'PUT',
      body: JSON.stringify(setup),
    }),
};

export type RoomSetupPayload = {
  shape: 'rectangular' | 'round' | 'oval';
  widthM: number;
  lengthM: number;
  radiusM: number;
  placedAccessories: string[];
};

export type RoomSetupResponse = RoomSetupPayload & {
  updatedAt: string;
};

export const guestsApi = {
  list: (eventId: string) =>
    apiFetch<GuestListResponse>(
      `/events/${eventId}/guests?actorRole=admin`,
    ),
  downloadTemplate: async (eventId: string) => {
    const response = await fetch(`/api/v1/events/${eventId}/guest-import/template`, {
      headers: { 'x-taulamic-actor-role': 'admin' },
    });
    if (!response.ok) {
      throw new ApiError(response.status, {});
    }
    return response.blob();
  },
  validate: async (eventId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(
      `/api/v1/events/${eventId}/guest-import/validate`,
      {
        method: 'POST',
        headers: { 'x-taulamic-actor-role': 'admin' },
        body: form,
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(response.status, body);
    }
    return response.json() as Promise<ImportValidation>;
  },
  import: async (eventId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(
      `/api/v1/events/${eventId}/guest-import/import`,
      {
        method: 'POST',
        headers: { 'x-taulamic-actor-role': 'admin' },
        body: form,
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(response.status, body);
    }
    return response.json() as Promise<ImportBatchResult>;
  },
  create: (
    eventId: string,
    input: {
      nombre: string;
      correo: string;
      telefono: string;
      categoryNames?: string[];
      observaciones?: string;
    },
  ) =>
    apiFetch<GuestView>(`/events/${eventId}/guests`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (
    eventId: string,
    guestId: string,
    input: {
      nombre: string;
      correo: string;
      telefono: string;
      categoryNames?: string[];
      observaciones?: string;
    },
  ) =>
    apiFetch<GuestView>(`/events/${eventId}/guests/${guestId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  remove: (eventId: string, guestId: string) =>
    apiFetch<void>(`/events/${eventId}/guests/${guestId}`, {
      method: 'DELETE',
    }),
};

export const preferencesApi = {
  get: (eventId: string) =>
    apiFetch<PreferenceMode & { eventId: string }>(
      `/events/${eventId}/preference-control-mode`,
    ),
  update: (eventId: string, mode: PreferenceMode['mode']) =>
    apiFetch<PreferenceMode & { eventId: string }>(
      `/events/${eventId}/preference-control-mode`,
      {
        method: 'PUT',
        body: JSON.stringify({ mode }),
      },
    ),
};

export const distributionApi = {
  run: (eventId: string) =>
    apiFetch<DistributionProposal>(`/events/${eventId}/distribution/run`, {
      method: 'POST',
    }),
  get: (eventId: string) =>
    apiFetch<DistributionProposal>(`/events/${eventId}/distribution`),
  confirm: (eventId: string) =>
    apiFetch<DistributionProposal>(`/events/${eventId}/distribution/confirm`, {
      method: 'POST',
    }),
  unassignGuest: (eventId: string, guestId: string) =>
    apiFetch<DistributionProposal>(
      `/events/${eventId}/distribution/placements/${guestId}/unassign`,
      { method: 'POST' },
    ),
};

export const tableShapesApi = {
  catalog: (eventId: string) =>
    apiFetch<TableShapeCatalog>(`/events/${eventId}/table-shapes`),
  topology: (eventId: string, shape: string, capacity: number) =>
    apiFetch<SeatTopology>(
      `/events/${eventId}/table-shapes/${shape}/seat-topology?capacity=${capacity}`,
    ),
};
