'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { Alert, PageHeader, SaveStatusIndicator, SectionLabel, useAutoSaveIndicator } from '@/components/ui';
import { preferencesApi } from '@/lib/api';
import {
  loadEventUiMeta,
  markAffinitiesDraftSaved,
  saveEventUiMeta,
  type AffinityRuleToggles,
  type PreferenceControlMode,
} from '@/lib/event-ui-meta';
import { adminRoutes } from '@/lib/routes';
import {
  PILOT_COLLABORATIVE_MODE_ENABLED,
  PILOT_PREFERENCE_MODE,
  resolvePreferenceModeForPilot,
} from '@/lib/pilot-features';
import { getSetupNav } from '@/lib/setup-flow';

const GENERIC_RULES: Array<{
  key: keyof AffinityRuleToggles;
  title: string;
  description: string;
}> = [
  {
    key: 'groupByCategory',
    title: 'Agrupar por categoría',
    description: 'Prioriza sentar juntos invitados de la misma categoría (familia, trabajo…).',
  },
  {
    key: 'keepFamiliesTogether',
    title: 'Mantener familias unidas',
    description: 'Evita separar miembros de un mismo hogar o pareja.',
  },
  {
    key: 'singlesTable',
    title: 'Mesa de solteros',
    description: 'Reserva una mesa para invitados sin pareja declarada.',
  },
  {
    key: 'separateKnownIncompatibles',
    title: 'Separar incompatibles conocidos',
    description: 'Aplica incompatibilidades marcadas como regla dura.',
  },
];

export function PreferencesAffinityView({ eventId }: { eventId: string }) {
  const routes = adminRoutes(eventId);
  const { status: saveStatus, markSaved } = useAutoSaveIndicator();
  const [mode, setMode] = useState<PreferenceControlMode>(PILOT_PREFERENCE_MODE);
  const [rules, setRules] = useState<AffinityRuleToggles>({});
  const setupNav = getSetupNav(eventId, 'prefs');

  useEffect(() => {
    const meta = loadEventUiMeta(eventId);
    if (meta.preferenceMode) {
      setMode(resolvePreferenceModeForPilot(meta.preferenceMode));
    }
    setRules(meta.affinityRules ?? {});
    markAffinitiesDraftSaved(eventId);
    void preferencesApi
      .get(eventId)
      .then((settings) =>
        setMode(resolvePreferenceModeForPilot(settings.mode)),
      )
      .catch(() => undefined);
  }, [eventId]);

  function persistRules(nextRules: AffinityRuleToggles) {
    const meta = loadEventUiMeta(eventId);
    saveEventUiMeta(eventId, {
      ...meta,
      affinityRules: nextRules,
    });
    markAffinitiesDraftSaved(eventId);
  }

  function toggleRule(key: keyof AffinityRuleToggles) {
    setRules((current) => {
      const next = { ...current, [key]: !current[key] };
      persistRules(next);
      markSaved();
      return next;
    });
  }

  const effectiveMode = resolvePreferenceModeForPilot(mode);
  const modeLabel =
    effectiveMode === 'colaborativo'
      ? 'Colaborativo — los invitados podrán enviar restricciones'
      : 'Anfitrión exclusivo — solo tú defines las restricciones (piloto julio)';

  return (
    <>
      <PageHeader
        title="Afinidades y reglas"
        subtitle="Paso 6 del setup: restricciones por persona y reglas genéricas para el motor de distribución."
        saveStatus={<SaveStatusIndicator status={saveStatus} />}
      />

      <Alert variant="info">
        <p className="font-medium">Piloto — vista previa del flujo</p>
        <p className="mt-1 text-sm">
          El motor v0 aún no consume estas reglas. Puedes dejarlas vacías: la
          distribución asignará invitados sin criterios de afinidad. El modo de
          captura se configura en{' '}
          <Link href={routes.config} className="font-medium text-primary-600">
            Configuración
          </Link>
          . Las reglas se guardan automáticamente en este dispositivo (piloto);
          no persisten en la API hasta post-piloto.
        </p>
      </Alert>

      <div className="mt-6 card-admin">
        <SectionLabel>Modo actual</SectionLabel>
        <p className="mt-2 text-sm text-neutral-700">{modeLabel}</p>
        <Link href={routes.config} className="mt-2 inline-block text-xs font-medium text-primary-600">
          Ver en configuración →
        </Link>
      </div>

      <div className="mt-6 card-admin space-y-4">
        <SectionLabel>Reglas genéricas</SectionLabel>
        <p className="text-sm text-neutral-600">
          Criterios opcionales que aplican a todo el evento. Si no marcas ninguno,
          el motor distribuirá sin reglas adicionales.
        </p>
        <div className="space-y-3">
          {GENERIC_RULES.map((rule) => {
            const active = Boolean(rules[rule.key]);
            return (
              <button
                key={rule.key}
                type="button"
                onClick={() => toggleRule(rule.key)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    active
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-neutral-300 bg-neutral-0'
                  }`}
                >
                  {active ? '✓' : ''}
                </span>
                <span>
                  <span className="block text-sm font-medium text-neutral-900">
                    {rule.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    {rule.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 card-admin space-y-4">
        <SectionLabel>Por persona — afinidades e incompatibilidades</SectionLabel>
        <p className="text-sm text-neutral-600">
          Como organizador, marcarás quién debe sentarse junto a quién y quién no.
          {!PILOT_COLLABORATIVE_MODE_ENABLED ? (
            <span className="mt-1 block text-xs text-neutral-500">
              El modo colaborativo (invitados editan sus restricciones) no está
              disponible en el piloto julio.
            </span>
          ) : null}
        </p>
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 p-6 text-center">
          <p className="text-sm font-medium text-neutral-700">
            Matriz de relaciones invitado ↔ invitado
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Próximamente — selector visual o búsqueda por nombre
          </p>
          <button
            type="button"
            disabled
            className="btn-secondary mt-4 opacity-50"
            title="No operativo en piloto"
          >
            Añadir afinidad
          </button>
        </div>
      </div>

      <SetupNavBar
        hidePrimary
        previousHref={setupNav.previous?.href}
        previousLabel={setupNav.previous?.previousLabel}
        nextHref={setupNav.next?.href}
        nextLabel={setupNav.next?.nextLabel}
        nextReady
      />
    </>
  );
}
