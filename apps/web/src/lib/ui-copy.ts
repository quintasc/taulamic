/**
 * Copy canónico UI admin (MEJ-13 D).
 * Matriz PO: docs/agile/inventario-microcopy-ui.md
 */
export const UI_COPY = {
  saveStatus: {
    saving: 'Guardando…',
    saved: 'Guardado',
  },
  setupNav: {
    defaultBlockedHint: 'Completa este paso para continuar',
    configNameRequired: 'Indica el nombre del evento para continuar',
    guestsRequired: 'Añade al menos un invitado para continuar',
    tablesRequired: 'Añade al menos una mesa para continuar',
    floorPlanLoading: 'Espera a que cargue el plano del salón',
  },
  distribution: {
    calculate: { short: 'Calcular', full: 'Calcular distribución' },
    confirm: { short: 'Confirmar', full: 'Confirmar distribución' },
    viewFloorPlan: { short: 'Ver plano', full: 'Ver mesas en plano' },
    comparadorTopK: 'Comparador Top-K — próximamente',
    emptyStateDescription:
      'Pulsa «Calcular distribución» para asignar invitados a las mesas según afinidad.',
    calculating: 'Calculando…',
    recalculating: 'Recalculando…',
    confirming: 'Confirmando…',
    pilotAffinityLabel: 'No calculado en piloto',
    pilotAffinityShort: 'N/D piloto',
  },
  pilot: {
    collaborativeConfigNote:
      'En el piloto actual: solo anfitrión exclusivo. El modo colaborativo estará disponible más adelante.',
    collaborativePrefsNote:
      'El modo colaborativo (invitados editan sus restricciones) no está disponible en el piloto actual.',
  },
  guestPill: {
    dragTitle: 'Arrastra para mover a otra mesa',
    removeTitle: 'Quitar de la mesa',
  },
} as const;

export const {
  saveStatus: SAVE_STATUS_COPY,
  setupNav: SETUP_NAV_COPY,
  distribution: DISTRIBUTION_COPY,
  pilot: PILOT_COPY,
  guestPill: GUEST_PILL_COPY,
} = UI_COPY;
