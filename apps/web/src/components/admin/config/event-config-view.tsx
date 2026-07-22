'use client';

import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import {
  Alert,
  DatePicker,
  FormField,
  PageHeader,
  PreferenceOption,
  SaveStatusIndicator,
} from '@/components/ui';
import { useEventConfig } from '@/hooks/use-event-config';
import {
  EVENT_NAME_INPUT_PLACEHOLDER,
  getMinEventDateIso,
} from '@/lib/event-ui-meta';
import { PILOT_COLLABORATIVE_MODE_ENABLED } from '@/lib/pilot-features';
import { PILOT_COPY, SETUP_NAV_COPY } from '@/lib/ui-copy';


export function EventConfigView() {
  const {
    eventId,
    setupNav,
    saveStatus,
    name,
    setName,
    date,
    dateError,
    handleDateChange,
    approximateGuests,
    setApproximateGuests,
    location,
    setLocation,
    notes,
    setNotes,
    preferenceMode,
    setPreferenceMode,
    message,
    canAdvance,
    handleBeforeNext,
  } = useEventConfig();

  return (
    <>
      <PageHeader
        title="Configuración del evento"
        subtitle="Nombre, volumen esperado y modo de captura de afinidades."
        saveStatus={<SaveStatusIndicator status={saveStatus} />}
      />

      {message ? (
        <div className="mb-6">
          <Alert variant="error">{message}</Alert>
        </div>
      ) : null}

      <div className="card-admin max-w-2xl space-y-5">
        <FormField id="event-name" label="Nombre del evento">
          <input
            id="event-name"
            className="input-field"
            value={name}
            placeholder={EVENT_NAME_INPUT_PLACEHOLDER}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <FormField
            id="event-date"
            label="Fecha"
            hint="Debe ser hoy o una fecha futura."
          >
            <DatePicker
              id="event-date"
              value={date}
              min={getMinEventDateIso()}
              onChange={handleDateChange}
            />
            {dateError ? (
              <p className="mt-1 text-xs text-error-500" role="alert">
                {dateError}
              </p>
            ) : null}
          </FormField>
          <FormField id="event-guests-approx" label="Invitados aproximados">
            <input
              id="event-guests-approx"
              type="number"
              min={0}
              className="input-field"
              placeholder="Ej. 120"
              value={approximateGuests}
              onChange={(e) => setApproximateGuests(e.target.value)}
            />
          </FormField>
        </div>

        <FormField id="event-location" label="Lugar">
          <input
            id="event-location"
            className="input-field"
            placeholder="Mas Oms, Girona"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </FormField>

        <FormField id="event-notes" label="Notas">
          <textarea
            id="event-notes"
            className="input-field min-h-[100px] resize-y"
            placeholder="Notas adicionales…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>

        <div className="space-y-3 border-t border-neutral-200 pt-5">
          <p className="text-sm font-medium text-neutral-900">
            Modo de preferencias
          </p>
          <p className="text-xs text-neutral-500">
            Define quién podrá indicar afinidades e incompatibilidades en el
            paso de Afinidades.
            {!PILOT_COLLABORATIVE_MODE_ENABLED ? (
              <span className="mt-1 block text-neutral-600">
                {PILOT_COPY.collaborativeConfigNote}
              </span>
            ) : null}
          </p>
          <PreferenceOption
            selected={preferenceMode === 'colaborativo'}
            title="Colaborativo"
            description="Los invitados podrán enviar sus restricciones (cuando el RSVP esté operativo)."
            disabled={!PILOT_COLLABORATIVE_MODE_ENABLED}
            badge={!PILOT_COLLABORATIVE_MODE_ENABLED ? 'Post-piloto' : undefined}
            onSelect={() => setPreferenceMode('colaborativo')}
          />
          <PreferenceOption
            selected={preferenceMode === 'anfitrion_exclusivo'}
            title="Anfitrión exclusivo"
            description="Solo el organizador define afinidades y reglas en Afinidades."
            onSelect={() => setPreferenceMode('anfitrion_exclusivo')}
          />
        </div>
      </div>

      {eventId ? (
        <SetupNavBar
          hidePrimary
          nextHref={setupNav?.next?.href}
          nextLabel={setupNav?.next?.nextLabel}
          nextReady={canAdvance}
          nextDisabledHint={SETUP_NAV_COPY.configNameRequired}
          onBeforeNext={handleBeforeNext}
        />
      ) : null}
    </>
  );
}
