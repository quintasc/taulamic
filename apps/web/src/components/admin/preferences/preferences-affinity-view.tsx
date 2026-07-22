'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { PageHeader, SaveStatusIndicator, SectionLabel, useAutoSaveIndicator } from '@/components/ui';
import { CustomSelect } from '@/components/ui/custom-select';
import { preferencesApi, guestsApi, companionGroupsApi } from '@/lib/api';
import { IconSliders, IconClose, IconChevronDown, IconChevronUp, IconLink, IconLinkOff, IconLock } from '@/components/icons';
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
import { PILOT_COPY } from '@/lib/ui-copy';
import { getSetupNav } from '@/lib/setup-flow';
import { getGuestV2DetailMeta } from '@/lib/guest-v2-detail-meta';

const GENERIC_RULES: Array<{
  key: keyof AffinityRuleToggles;
  title: string;
  description: string;
  disabled?: boolean;
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
  {
    key: 'groupByAge',
    title: 'Agrupar por edades',
    description: 'Prioriza juntar personas de rangos de edad similares (requiere el dato de edad, no disponible en piloto).',
    disabled: true,
  },
  {
    key: 'alternateGender',
    title: 'Intercalar hombre-mujer',
    description: 'Distribuye alternando géneros alrededor de las mesas siempre que sea posible.',
  },
];

function IconDragHandle(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="12"
      height="18"
      viewBox="0 0 12 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <circle cx="2" cy="3" r="1" fill="currentColor" />
      <circle cx="2" cy="9" r="1" fill="currentColor" />
      <circle cx="2" cy="15" r="1" fill="currentColor" />
      <circle cx="10" cy="3" r="1" fill="currentColor" />
      <circle cx="10" cy="9" r="1" fill="currentColor" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

function IconPlus(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type RelationType = 'afinidad' | 'incompatibilidad';
type AffinityTargetMode = 'guests' | 'categories';

type GuestAffinityRelation = {
  id: string;
  guestA: string;
  guestB: string;
  type: RelationType;
  /** Regla dura D3 (Excel / acompañante). No usa verde/rojo de afinidad. */
  keepTogether?: boolean;
};

function guestPairKey(nameA: string, nameB: string): string {
  return [nameA.trim().toLowerCase(), nameB.trim().toLowerCase()]
    .sort()
    .join('|');
}

type CategoryAffinityRelation = {
  id: string;
  categoryA: string;
  categoryB: string;
  type: RelationType;
};

function deduplicateGuestRelations(list: GuestAffinityRelation[]) {
  const seen = new Set<string>();
  return list.filter((r) => {
    const key = [r.guestA.toLowerCase(), r.guestB.toLowerCase()].sort().join(' ↔ ');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function deduplicateCategoryRelations(list: CategoryAffinityRelation[]) {
  const seen = new Set<string>();
  return list.filter((r) => {
    const key = [r.categoryA.toLowerCase(), r.categoryB.toLowerCase()]
      .sort()
      .join(' ↔ ');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const DEFAULT_GUEST_RELATIONS: GuestAffinityRelation[] = [];
const DEFAULT_CATEGORY_RELATIONS: CategoryAffinityRelation[] = [];

function Toggle({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        disabled
          ? 'bg-neutral-100 opacity-60'
          : checked
          ? 'bg-primary-500'
          : 'bg-neutral-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-neutral-0 shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </div>
  );
}

export function PreferencesAffinityView({ eventId }: { eventId: string }) {
  const routes = adminRoutes(eventId);
  const { status: saveStatus, markSaved } = useAutoSaveIndicator();
  const [mode, setMode] = useState<PreferenceControlMode>(PILOT_PREFERENCE_MODE);
  const [rules, setRules] = useState<AffinityRuleToggles>({});
  const [rulesOrder, setRulesOrder] = useState<Array<keyof AffinityRuleToggles>>([
    'groupByCategory',
    'keepFamiliesTogether',
    'singlesTable',
    'separateKnownIncompatibles',
    'groupByAge',
    'alternateGender',
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragSourceRef = useRef<number | null>(null);

  // Relations state
  const [guestRelations, setGuestRelations] = useState<GuestAffinityRelation[]>(
    [],
  );
  const [categoryRelations, setCategoryRelations] = useState<
    CategoryAffinityRelation[]
  >([]);
  const [affinityTargetMode, setAffinityTargetMode] =
    useState<AffinityTargetMode>('guests');
  const [guestList, setGuestList] = useState<Array<{ id: string; name: string; category?: string }>>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Click outside to close custom select dropdowns
  useEffect(() => {
    if (!activeDropdownId) return;
    function handleGlobalClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.relation-select-container')) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [activeDropdownId]);

  // Creation form state
  const [isAdding, setIsAdding] = useState(false);
  const [newEntityA, setNewEntityA] = useState('');
  const [newEntityB, setNewEntityB] = useState('');
  const [newType, setNewType] = useState<RelationType>('afinidad');

  const setupNav = getSetupNav(eventId, 'prefs');

  useEffect(() => {
    const meta = loadEventUiMeta(eventId);
    if (meta.preferenceMode) {
      setMode(resolvePreferenceModeForPilot(meta.preferenceMode));
    }
    setRules(meta.affinityRules ?? {});
    if (meta.affinityRulesOrder) {
      const loadedOrder = meta.affinityRulesOrder as Array<keyof AffinityRuleToggles>;
      const allKeys: Array<keyof AffinityRuleToggles> = [
        'groupByCategory',
        'keepFamiliesTogether',
        'singlesTable',
        'separateKnownIncompatibles',
        'groupByAge',
        'alternateGender',
      ];
      const mergedOrder = [
        ...loadedOrder.filter((k) => allKeys.includes(k)),
        ...allKeys.filter((k) => !loadedOrder.includes(k)),
      ];
      const activeRules = meta.affinityRules ?? {};
      const sortedOrder = [
        ...mergedOrder.filter((k) => activeRules[k]),
        ...mergedOrder.filter((k) => !activeRules[k]),
      ];
      setRulesOrder(sortedOrder);
    } else {
      const activeRules = meta.affinityRules ?? {};
      const defaultKeys: Array<keyof AffinityRuleToggles> = [
        'groupByCategory',
        'keepFamiliesTogether',
        'singlesTable',
        'separateKnownIncompatibles',
        'groupByAge',
        'alternateGender',
      ];
      const sortedOrder = [
        ...defaultKeys.filter((k) => activeRules[k]),
        ...defaultKeys.filter((k) => !activeRules[k]),
      ];
      setRulesOrder(sortedOrder);
    }

    const normalizedGuestRelations = meta.affinityRelations
      ? deduplicateGuestRelations(meta.affinityRelations)
      : DEFAULT_GUEST_RELATIONS;
    const normalizedCategoryRelations = meta.categoryAffinityRelations
      ? deduplicateCategoryRelations(meta.categoryAffinityRelations)
      : DEFAULT_CATEGORY_RELATIONS;
    setGuestRelations(normalizedGuestRelations);
    setCategoryRelations(normalizedCategoryRelations);
    const shouldNormalizePersist =
      !meta.affinityRelations ||
      !meta.categoryAffinityRelations ||
      normalizedGuestRelations.length !== meta.affinityRelations.length ||
      normalizedCategoryRelations.length !== meta.categoryAffinityRelations.length;
    if (shouldNormalizePersist) {
      saveEventUiMeta(eventId, {
        ...meta,
        affinityRelations: normalizedGuestRelations,
        categoryAffinityRelations: normalizedCategoryRelations,
      });
    }

    markAffinitiesDraftSaved(eventId);

    // Load actual guests and companion groups (couples/families) from database
    Promise.all([
      guestsApi.list(eventId),
      companionGroupsApi.list(eventId),
    ])
      .then(([guestsRes, companionGroupsRes]) => {
        const guests = guestsRes?.guests || [];
        setGuestList(guests.map((g) => ({
          id: g.id,
          name: g.nombre,
          category: g.categories?.[0]?.name,
        })));
        const categories = Array.from(
          new Set(
            guests.flatMap((guest) =>
              (guest.categories ?? [])
                .map((category) => category.name.trim())
                .filter((name) => name.length > 0),
            ),
          ),
        ).sort((left, right) => left.localeCompare(right, 'es'));
        setCategoryList(categories);

        // 1. Auto-generate companion/family relations from local metadata companionGroup
        const guestMetaList = guests.map((g) => {
          const metaV2 = getGuestV2DetailMeta(eventId, g.id);
          return {
            id: g.id,
            name: g.nombre,
            companionGroup: metaV2.companionGroup?.trim(),
          };
        });

        const groups: Record<string, typeof guestMetaList> = {};
        for (const g of guestMetaList) {
          if (g.companionGroup) {
            if (!groups[g.companionGroup]) {
              groups[g.companionGroup] = [];
            }
            groups[g.companionGroup].push(g);
          }
        }

        const autoRelations: GuestAffinityRelation[] = [];

        for (const groupName of Object.keys(groups)) {
          const members = groups[groupName];
          if (members.length < 2) continue;
          for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
              autoRelations.push({
                id: `auto-local-${members[i].id}-${members[j].id}`,
                guestA: members[i].name,
                guestB: members[j].name,
                type: 'afinidad',
                // Meta local: aún no es keepTogether duro (falta acompananteKey en API).
                keepTogether: false,
              });
            }
          }
        }

        // 2. Auto-generate companion/family relations from pre-seeded backend companion groups
        const apiGroups = companionGroupsRes?.groups || [];
        const hardKeepTogetherKeys = new Set<string>();
        for (const group of apiGroups) {
          const names = group.guestNames || [];
          if (names.length < 2) continue;
          const isHard = group.keepTogether !== false;
          for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
              if (isHard) {
                hardKeepTogetherKeys.add(guestPairKey(names[i], names[j]));
              }
              autoRelations.push({
                id: `auto-api-${group.key}-${i}-${j}`,
                guestA: names[i],
                guestB: names[j],
                type: 'afinidad',
                keepTogether: isHard,
              });
            }
          }
        }

        // Merge autoRelations with existing ones
        setGuestRelations((current) => {
          const existing = [...current];
          let updated = false;
          for (const auto of autoRelations) {
            const existsIndex = existing.findIndex(
              (r) =>
                (r.guestA.toLowerCase() === auto.guestA.toLowerCase() &&
                  r.guestB.toLowerCase() === auto.guestB.toLowerCase()) ||
                (r.guestA.toLowerCase() === auto.guestB.toLowerCase() &&
                  r.guestB.toLowerCase() === auto.guestA.toLowerCase()),
            );
            if (existsIndex < 0) {
              existing.push(auto);
              updated = true;
            } else if (
              auto.keepTogether &&
              !existing[existsIndex].keepTogether
            ) {
              existing[existsIndex] = {
                ...existing[existsIndex],
                keepTogether: true,
              };
              updated = true;
            }
          }
          // Marca keepTogether en relaciones ya guardadas que coinciden con pares duros del API.
          for (let i = 0; i < existing.length; i += 1) {
            const key = guestPairKey(existing[i].guestA, existing[i].guestB);
            if (hardKeepTogetherKeys.has(key) && !existing[i].keepTogether) {
              existing[i] = { ...existing[i], keepTogether: true };
              updated = true;
            }
          }
          const unique = deduplicateGuestRelations(existing);
          if (unique.length !== existing.length) {
            updated = true;
          }
          if (updated) {
            const currentMeta = loadEventUiMeta(eventId);
            saveEventUiMeta(eventId, {
              ...currentMeta,
              affinityRelations: unique,
            });
          }
          return unique;
        });
      })
      .catch(() => undefined);

    void preferencesApi
      .get(eventId)
      .then((settings) =>
        setMode(resolvePreferenceModeForPilot(settings.mode)),
      )
      .catch(() => undefined);
  }, [eventId]);

  function persistRules(nextRules: AffinityRuleToggles, nextOrder?: Array<keyof AffinityRuleToggles>) {
    const meta = loadEventUiMeta(eventId);
    const orderToSave = nextOrder ?? rulesOrder;
    saveEventUiMeta(eventId, {
      ...meta,
      affinityRules: nextRules,
      affinityRulesOrder: orderToSave,
    });
    markAffinitiesDraftSaved(eventId);
  }

  function persistGuestRelations(nextRelations: GuestAffinityRelation[]) {
    const meta = loadEventUiMeta(eventId);
    saveEventUiMeta(eventId, {
      ...meta,
      affinityRelations: nextRelations,
    });
    markAffinitiesDraftSaved(eventId);
  }

  function persistCategoryRelations(nextRelations: CategoryAffinityRelation[]) {
    const meta = loadEventUiMeta(eventId);
    saveEventUiMeta(eventId, {
      ...meta,
      categoryAffinityRelations: nextRelations,
    });
    markAffinitiesDraftSaved(eventId);
  }

  function toggleRule(key: keyof AffinityRuleToggles) {
    setRules((current) => {
      const next = { ...current, [key]: !current[key] };
      let nextOrder = [...rulesOrder];
      if (next[key]) {
        const activeKeys = nextOrder.filter(k => next[k] && k !== key);
        const inactiveKeys = nextOrder.filter(k => !next[k] && k !== key);
        nextOrder = [...activeKeys, key, ...inactiveKeys];
      } else {
        const activeKeys = nextOrder.filter(k => next[k]);
        const inactiveKeys = nextOrder.filter(k => !next[k] && k !== key);
        nextOrder = [...activeKeys, ...inactiveKeys, key];
      }
      setRulesOrder(nextOrder);
      persistRules(next, nextOrder);
      markSaved();
      return next;
    });
  }

  function moveActiveRule(fromIndex: number, toIndex: number) {
    const activeCount = rulesOrder.filter((k) => rules[k]).length;
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= activeCount ||
      toIndex >= activeCount ||
      fromIndex === toIndex
    ) {
      return;
    }

    const nextOrder = [...rulesOrder];
    const [draggedKey] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, draggedKey);

    setRulesOrder(nextOrder);
    persistRules(rules, nextOrder);
    markSaved();
  }

  function clearRuleDragState() {
    dragSourceRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleRulePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragSourceRef.current = index;
    setDraggedIndex(index);
    setDragOverIndex(index);
  }

  function handleRulePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (dragSourceRef.current === null) {
      return;
    }
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-rule-index]');
    if (!target) {
      return;
    }
    const nextIndex = Number(target.dataset.ruleIndex);
    const activeCount = rulesOrder.filter((k) => rules[k]).length;
    if (
      Number.isInteger(nextIndex) &&
      nextIndex >= 0 &&
      nextIndex < activeCount
    ) {
      setDragOverIndex(nextIndex);
    }
  }

  function handleRulePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const fromIndex = dragSourceRef.current;
    const toIndex = dragOverIndex;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    clearRuleDragState();
    if (fromIndex !== null && toIndex !== null) {
      moveActiveRule(fromIndex, toIndex);
    }
  }

  useEffect(() => {
    if (draggedIndex === null) {
      return;
    }
    const cancelDrag = () => clearRuleDragState();
    window.addEventListener('blur', cancelDrag);
    document.addEventListener('visibilitychange', cancelDrag);
    return () => {
      window.removeEventListener('blur', cancelDrag);
      document.removeEventListener('visibilitychange', cancelDrag);
    };
  }, [draggedIndex]);

  // keepTogether: bloqueado a propósito. Baja real (API/acompananteKey) + alta
  // desde entrada manual → misma entrega diferida (CONTEXTO-EJECUCION).
  function removeRelation(id: string) {
    if (affinityTargetMode === 'guests') {
      const target = guestRelations.find((relation) => relation.id === id);
      if (target?.keepTogether) {
        return;
      }
      setGuestRelations((current) => {
        const next = current.filter((relation) => relation.id !== id);
        persistGuestRelations(next);
        markSaved();
        return next;
      });
      return;
    }
    setCategoryRelations((current) => {
      const next = current.filter((relation) => relation.id !== id);
      persistCategoryRelations(next);
      markSaved();
      return next;
    });
  }

  function updateRelationType(id: string, type: RelationType) {
    if (affinityTargetMode === 'guests') {
      const target = guestRelations.find((relation) => relation.id === id);
      if (target?.keepTogether) {
        return;
      }
      setGuestRelations((current) => {
        const next = current.map((relation) =>
          relation.id === id ? { ...relation, type } : relation,
        );
        persistGuestRelations(next);
        markSaved();
        return next;
      });
      return;
    }
    setCategoryRelations((current) => {
      const next = current.map((relation) =>
        relation.id === id ? { ...relation, type } : relation,
      );
      persistCategoryRelations(next);
      markSaved();
      return next;
    });
  }

  function addRelation() {
    if (!newEntityA || !newEntityB) return;
    if (newEntityA === newEntityB) return;

    if (affinityTargetMode === 'guests') {
      const newRelation: GuestAffinityRelation = {
        id: String(Date.now()),
        guestA: newEntityA,
        guestB: newEntityB,
        type: newType,
      };
      setGuestRelations((current) => {
        const next = [...current, newRelation];
        persistGuestRelations(next);
        markSaved();
        return next;
      });
    } else {
      const newRelation: CategoryAffinityRelation = {
        id: String(Date.now()),
        categoryA: newEntityA,
        categoryB: newEntityB,
        type: newType,
      };
      setCategoryRelations((current) => {
        const next = [...current, newRelation];
        persistCategoryRelations(next);
        markSaved();
        return next;
      });
    }

    setNewEntityA('');
    setNewEntityB('');
    setNewType('afinidad');
    setIsAdding(false);
  }

  function switchAffinityTargetMode(nextMode: AffinityTargetMode) {
    setAffinityTargetMode(nextMode);
    setNewEntityA('');
    setNewEntityB('');
    setNewType('afinidad');
    setActiveDropdownId(null);
  }

  const effectiveMode = resolvePreferenceModeForPilot(mode);
  const modeLabel =
    effectiveMode === 'colaborativo'
      ? 'Colaborativo — los invitados podrán enviar restricciones'
      : 'Anfitrión exclusivo — solo tú defines las restricciones';

  const activeCount = rulesOrder.filter(k => rules[k]).length;
  const totalCount = rulesOrder.length;

  const displayedRelations = useMemo(
    () =>
      affinityTargetMode === 'guests'
        ? guestRelations.map((relation) => ({
            id: relation.id,
            leftName: relation.guestA,
            rightName: relation.guestB,
            type: relation.type,
            keepTogether: Boolean(relation.keepTogether),
            leftHint: guestList.find((guest) => guest.name === relation.guestA)
              ?.category,
            rightHint: guestList.find((guest) => guest.name === relation.guestB)
              ?.category,
          }))
        : categoryRelations.map((relation) => ({
            id: relation.id,
            leftName: relation.categoryA,
            rightName: relation.categoryB,
            type: relation.type,
            keepTogether: false,
            leftHint: undefined,
            rightHint: undefined,
          })),
    [affinityTargetMode, categoryRelations, guestList, guestRelations],
  );
  const relationExists =
    affinityTargetMode === 'guests'
      ? guestRelations.some(
          (relation) =>
            (relation.guestA.toLowerCase() === newEntityA.toLowerCase() &&
              relation.guestB.toLowerCase() === newEntityB.toLowerCase()) ||
            (relation.guestA.toLowerCase() === newEntityB.toLowerCase() &&
              relation.guestB.toLowerCase() === newEntityA.toLowerCase()),
        )
      : categoryRelations.some(
          (relation) =>
            (relation.categoryA.toLowerCase() === newEntityA.toLowerCase() &&
              relation.categoryB.toLowerCase() === newEntityB.toLowerCase()) ||
            (relation.categoryA.toLowerCase() === newEntityB.toLowerCase() &&
              relation.categoryB.toLowerCase() === newEntityA.toLowerCase()),
        );
  const canSubmit =
    newEntityA !== '' &&
    newEntityB !== '' &&
    newEntityA !== newEntityB &&
    !relationExists;
  const leftLabel = affinityTargetMode === 'guests' ? 'Invitado A' : 'Categoría A';
  const rightLabel = affinityTargetMode === 'guests' ? 'Invitado B' : 'Categoría B';
  const leftPlaceholder =
    affinityTargetMode === 'guests'
      ? 'Selecciona un invitado...'
      : 'Selecciona una categoría...';
  const rightPlaceholder = leftPlaceholder;
  const entityOptionsA =
    affinityTargetMode === 'guests'
      ? guestList
          .filter((guest) => guest.name !== newEntityB)
          .map((guest) => ({
            value: guest.name,
            label: guest.name,
            hint: guest.category ? `(${guest.category})` : undefined,
          }))
      : categoryList
          .filter((category) => category !== newEntityB)
          .map((category) => ({
            value: category,
            label: category,
          }));
  const entityOptionsB =
    affinityTargetMode === 'guests'
      ? guestList
          .filter((guest) => guest.name !== newEntityA)
          .map((guest) => ({
            value: guest.name,
            label: guest.name,
            hint: guest.category ? `(${guest.category})` : undefined,
          }))
      : categoryList
          .filter((category) => category !== newEntityA)
          .map((category) => ({
            value: category,
            label: category,
          }));

  return (
    <>
      <PageHeader
        title="Afinidades y reglas"
        subtitle="Restricciones por invitado/categoría y reglas genéricas para el motor de distribución."
        saveStatus={<SaveStatusIndicator status={saveStatus} />}
      />

      <div className="mt-6 card-admin">
        <div className="flex items-center gap-2">
          <IconSliders className="h-4.5 w-4.5 text-neutral-500 shrink-0" />
          <SectionLabel>Modo actual</SectionLabel>
        </div>
        <p className="mt-2 text-sm text-neutral-700">{modeLabel}</p>
        <Link href={routes.config} className="mt-2 inline-block text-xs font-medium text-primary-600">
          Ver en configuración →
        </Link>
      </div>

      <div className="mt-6 card-admin space-y-4">
        <div className="flex items-center justify-between">
          <SectionLabel>Reglas genéricas</SectionLabel>
          <span className="text-xs font-medium text-neutral-500">
            {activeCount} de {totalCount} activas
          </span>
        </div>
        <p className="text-sm text-neutral-600">
          Criterios opcionales que aplican a todo el evento. El orden define la prioridad — arrastra el asa para reorganizar. Si no marcas ninguno, el motor distribuirá sin reglas adicionales.
        </p>
        <div className="space-y-3">
          {rulesOrder.map((key, index) => {
            const rule = GENERIC_RULES.find((r) => r.key === key);
            if (!rule) return null;
            const active = Boolean(rules[key]);
            const isDragging = draggedIndex === index;
            const isDropTarget =
              dragOverIndex === index &&
              draggedIndex !== null &&
              draggedIndex !== index;
            const isDraggable = active && !rule.disabled;

            return (
              <div
                key={key}
                data-rule-index={index}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition duration-200 ${
                  rule.disabled
                    ? 'border-neutral-200 bg-neutral-100/50 opacity-60'
                    : active
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'border-neutral-200 bg-neutral-0'
                } ${isDragging ? 'opacity-40 border-dashed border-primary-300' : ''} ${
                  isDropTarget ? 'ring-2 ring-primary-500/40' : ''
                }`}
              >
                {active ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      aria-label={`Reordenar: ${rule.title}`}
                      disabled={!isDraggable}
                      onPointerDown={(event) =>
                        isDraggable && handleRulePointerDown(event, index)
                      }
                      onPointerMove={handleRulePointerMove}
                      onPointerUp={handleRulePointerUp}
                      onPointerCancel={clearRuleDragState}
                      className="touch-none inline-flex cursor-grab items-center justify-center rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing disabled:cursor-not-allowed"
                    >
                      <IconDragHandle />
                    </button>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-neutral-0">
                      {index + 1}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0 opacity-0 pointer-events-none select-none">
                    <IconDragHandle />
                    <span className="h-5 w-5" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => !rule.disabled && toggleRule(key)}
                  disabled={rule.disabled}
                  className={`flex min-w-0 flex-1 items-center gap-3 text-left ${
                    rule.disabled
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-neutral-900">
                      {rule.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {rule.description}
                    </span>
                  </div>
                  <Toggle checked={active} disabled={rule.disabled} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 card-admin space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-neutral-500 whitespace-nowrap">
            Afinidades e incompatibilidades
          </h2>
          <div className="inline-flex w-full rounded-xl border border-neutral-200 bg-neutral-100/80 p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => switchAffinityTargetMode('guests')}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
                affinityTargetMode === 'guests'
                  ? 'bg-neutral-0 text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Invitados
            </button>
            <button
              type="button"
              onClick={() => switchAffinityTargetMode('categories')}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
                affinityTargetMode === 'categories'
                  ? 'bg-neutral-0 text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Categorías
            </button>
          </div>
        </div>
        <p className="text-sm text-neutral-600">
          {affinityTargetMode === 'guests'
            ? 'Marca afinidades o incompatibilidades. El candado gris indica pareja u acompañante obligatorio en la misma mesa (Excel).'
            : 'Marca qué categorías tienen afinidad o incompatibilidad para guiar las mesas híbridas.'}
          {!PILOT_COLLABORATIVE_MODE_ENABLED ? (
            <span className="mt-1 block text-xs text-neutral-500">
              {PILOT_COPY.collaborativePrefsNote}
            </span>
          ) : null}
        </p>

        {/* Relations List */}
        {displayedRelations.length > 0 && (
          <div className="space-y-3">
            {displayedRelations.map((rel) => {
              return (
                <div key={rel.id}>
                {/* Desktop View */}
                <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-0 p-4 shadow-sm">
                  {/* Left entity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-neutral-0 shrink-0">
                      {getInitials(rel.leftName)}
                    </div>
                    <span className="text-sm font-medium text-neutral-900 truncate">{rel.leftName}</span>
                    {rel.leftHint && (
                      <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider ml-1.5 shrink-0">
                        ({rel.leftHint})
                      </span>
                    )}
                  </div>

                  {/* Relation Badge Select Dropdown */}
                  <div className="justify-self-center relative relation-select-container">
                    {rel.keepTogether ? (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-100 pl-3 pr-3 py-1.5 text-xs font-semibold text-neutral-800"
                        title="Pareja u acompañante obligatorio en la misma mesa (keepTogether)"
                      >
                        <IconLock className="h-3.5 w-3.5 text-neutral-800 fill-none stroke-current shrink-0" />
                        <span>juntos</span>
                      </span>
                    ) : (
                      <>
                    <button
                      type="button"
                      onClick={() => setActiveDropdownId(activeDropdownId === rel.id ? null : rel.id)}
                      className={`flex items-center gap-1.5 rounded-full pl-3 pr-2.5 py-1.5 text-xs font-semibold border focus:outline-none transition-colors ${
                        rel.type === 'afinidad'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100/50'
                          : 'bg-rose-50 text-rose-600 border-rose-200/50 hover:bg-rose-100/50'
                      }`}
                    >
                      {rel.type === 'afinidad' ? (
                        <>
                          <IconLink className="h-3.5 w-3.5 text-emerald-500 fill-none stroke-current shrink-0" />
                          <span>afinidad</span>
                        </>
                      ) : (
                        <>
                          <IconLinkOff className="h-3.5 w-3.5 text-rose-500 fill-none stroke-current shrink-0" />
                          <span>incompatible</span>
                        </>
                      )}
                      {activeDropdownId === rel.id ? (
                        <IconChevronUp className="h-3 w-3 opacity-70" />
                      ) : (
                        <IconChevronDown className="h-3 w-3 opacity-70" />
                      )}
                    </button>

                    {activeDropdownId === rel.id && (
                      <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-36 rounded-xl border border-neutral-200 bg-neutral-0 p-1 shadow-lg z-50">
                        <button
                          type="button"
                          onClick={() => {
                            updateRelationType(rel.id, 'afinidad');
                            setActiveDropdownId(null);
                          }}
                          className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors flex items-center gap-2 ${
                            rel.type === 'afinidad'
                              ? 'bg-emerald-50 text-emerald-700 font-semibold'
                              : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                          }`}
                        >
                          <IconLink className={`h-3.5 w-3.5 fill-none stroke-current shrink-0 ${
                            rel.type === 'afinidad' ? 'text-emerald-500' : 'text-neutral-400'
                          }`} />
                          <span>afinidad</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateRelationType(rel.id, 'incompatibilidad');
                            setActiveDropdownId(null);
                          }}
                          className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors flex items-center gap-2 ${
                            rel.type === 'incompatibilidad'
                              ? 'bg-rose-50 text-rose-700 font-semibold'
                              : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                          }`}
                        >
                          <IconLinkOff className={`h-3.5 w-3.5 fill-none stroke-current shrink-0 ${
                            rel.type === 'incompatibilidad' ? 'text-rose-500' : 'text-neutral-400'
                          }`} />
                          <span>incompatible</span>
                        </button>
                      </div>
                    )}
                      </>
                    )}
                  </div>

                  {/* Right entity + Remove button */}
                  <div className="flex items-center gap-3 justify-self-end min-w-0">
                    <span className="text-sm font-medium text-neutral-900 truncate mr-1">{rel.rightName}</span>
                    {rel.rightHint && (
                      <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mr-1.5 shrink-0">
                        ({rel.rightHint})
                      </span>
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-neutral-0 shrink-0">
                      {getInitials(rel.rightName)}
                    </div>
                    {rel.keepTogether ? (
                      <span
                        className="ml-2 inline-flex h-7 w-7 items-center justify-center text-neutral-400"
                        title="No se puede quitar: viene del Excel / acompañante"
                      >
                        <IconLock className="h-3.5 w-3.5 fill-none stroke-current" />
                      </span>
                    ) : (
                    <button
                      type="button"
                      onClick={() => removeRelation(rel.id)}
                      className="ml-2 rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition shrink-0"
                      title="Eliminar relación"
                    >
                      <IconClose className="h-4 w-4" />
                    </button>
                    )}
                  </div>
                </div>

                {/* Mobile View */}
                <div className="relative sm:hidden flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-0 p-4 shadow-sm">
                  {/* Left entity */}
                  <div className="flex items-center gap-3 pr-8 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-neutral-0 shrink-0">
                      {getInitials(rel.leftName)}
                    </div>
                    <span className="text-sm font-medium text-neutral-900 break-words leading-tight">
                      {rel.leftName}
                    </span>
                  </div>

                  {/* Relation select indented (avatar 40px + gap 12px = 52px) */}
                  <div className="pl-[52px] flex">
                    <div className="relative relation-select-container">
                      {rel.keepTogether ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-800"
                          title="Pareja u acompañante obligatorio en la misma mesa (keepTogether)"
                        >
                          <IconLock className="h-3.5 w-3.5 text-neutral-800 fill-none stroke-current shrink-0" />
                          <span>juntos</span>
                        </span>
                      ) : (
                        <>
                      <button
                        type="button"
                        onClick={() => setActiveDropdownId(activeDropdownId === rel.id ? null : rel.id)}
                        className={`flex items-center gap-1 rounded-full p-1.5 text-xs font-semibold border focus:outline-none transition-colors ${
                          rel.type === 'afinidad'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
                            : 'bg-rose-50 text-rose-600 border-rose-200/50'
                        }`}
                      >
                        {rel.type === 'afinidad' ? (
                          <IconLink className="h-3.5 w-3.5 text-emerald-500 fill-none stroke-current shrink-0" />
                        ) : (
                          <IconLinkOff className="h-3.5 w-3.5 text-rose-500 fill-none stroke-current shrink-0" />
                        )}
                        {activeDropdownId === rel.id ? (
                          <IconChevronUp className="h-3 w-3 opacity-70" />
                        ) : (
                          <IconChevronDown className="h-3 w-3 opacity-70" />
                        )}
                      </button>

                      {activeDropdownId === rel.id && (
                        <div className="absolute left-0 mt-1 w-32 rounded-xl border border-neutral-200 bg-neutral-0 p-1 shadow-lg z-50">
                          <button
                            type="button"
                            onClick={() => {
                              updateRelationType(rel.id, 'afinidad');
                              setActiveDropdownId(null);
                            }}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors flex items-center gap-2 ${
                              rel.type === 'afinidad'
                                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                          >
                            <IconLink className={`h-3.5 w-3.5 fill-none stroke-current shrink-0 ${
                              rel.type === 'afinidad' ? 'text-emerald-500' : 'text-neutral-400'
                            }`} />
                            <span>afinidad</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateRelationType(rel.id, 'incompatibilidad');
                              setActiveDropdownId(null);
                            }}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors flex items-center gap-2 ${
                              rel.type === 'incompatibilidad'
                                ? 'bg-rose-50 text-rose-700 font-semibold'
                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                          >
                            <IconLinkOff className={`h-3.5 w-3.5 fill-none stroke-current shrink-0 ${
                              rel.type === 'incompatibilidad' ? 'text-rose-500' : 'text-neutral-400'
                            }`} />
                            <span>incompatible</span>
                          </button>
                        </div>
                      )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right entity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-neutral-0 shrink-0">
                      {getInitials(rel.rightName)}
                    </div>
                    <span className="text-sm font-medium text-neutral-900 break-words leading-tight">
                      {rel.rightName}
                    </span>
                  </div>

                  {/* Delete / lock (top right) */}
                  {rel.keepTogether ? (
                    <span
                      className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center text-neutral-500"
                      title="No se puede quitar: viene del Excel / acompañante"
                    >
                      <IconLock className="h-4 w-4 fill-none stroke-current" />
                    </span>
                  ) : (
                  <button
                    type="button"
                    onClick={() => removeRelation(rel.id)}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition shrink-0"
                    title="Eliminar relación"
                  >
                    <IconClose className="h-4.5 w-4.5" />
                  </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Add Relation Form / Button */}
        {isAdding ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-0 p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">Nueva relación</h3>
              <div className="inline-flex w-full rounded-xl border border-neutral-200 bg-neutral-100/80 p-1 sm:w-auto">
                <button
                  type="button"
                  onClick={() => switchAffinityTargetMode('guests')}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
                    affinityTargetMode === 'guests'
                      ? 'bg-neutral-0 text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Invitados
                </button>
                <button
                  type="button"
                  onClick={() => switchAffinityTargetMode('categories')}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
                    affinityTargetMode === 'categories'
                      ? 'bg-neutral-0 text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Categorías
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  {leftLabel}
                </label>
                <CustomSelect
                  value={newEntityA}
                  onChange={setNewEntityA}
                  clearable
                  searchable={affinityTargetMode === 'guests'}
                  searchPlaceholder="Buscar por nombre o apellido"
                  options={entityOptionsA}
                  placeholder={leftPlaceholder}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  {rightLabel}
                </label>
                <CustomSelect
                  value={newEntityB}
                  onChange={setNewEntityB}
                  clearable
                  searchable={affinityTargetMode === 'guests'}
                  searchPlaceholder="Buscar por nombre o apellido"
                  options={entityOptionsB}
                  placeholder={rightPlaceholder}
                />
              </div>
            </div>

            {/* Warning when relation exists */}
            {newEntityA && newEntityB && relationExists && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/50 rounded-xl px-4 py-2.5">
                ⚠ Ya existe una relación activa entre {newEntityA} y {newEntityB}.
              </p>
            )}

            {/* Summary Row */}
            <div className="flex items-center justify-between rounded-xl bg-neutral-100/60 p-4 border border-neutral-200/50">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-neutral-0">
                  {getInitials(newEntityA) || '?'}
                </div>
                <span className="text-xs text-neutral-500 font-medium">con</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-neutral-0">
                  {getInitials(newEntityB) || '?'}
                </div>
                <span className="ml-2 text-sm font-semibold text-neutral-900 truncate max-w-[200px] sm:max-w-none">
                  {newEntityA || leftLabel} y {newEntityB || rightLabel}
                </span>
              </div>
              </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Tipo de relación
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNewType('afinidad')}
                  title="Afinidad"
                  className={`flex items-center justify-center rounded-xl border py-3 transition ${
                    newType === 'afinidad'
                      ? 'border-emerald-200/50 bg-emerald-50 text-emerald-600'
                      : 'border-neutral-200 bg-neutral-0 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
                  }`}
                >
                  <IconLink className={`h-5 w-5 fill-none stroke-current shrink-0 ${
                    newType === 'afinidad' ? 'text-emerald-500' : 'text-neutral-400'
                  }`} />
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('incompatibilidad')}
                  title="Incompatibilidad"
                  className={`flex items-center justify-center rounded-xl border py-3 transition ${
                    newType === 'incompatibilidad'
                      ? 'border-rose-200/50 bg-rose-50 text-rose-600'
                      : 'border-neutral-200 bg-neutral-0 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600'
                  }`}
                >
                  <IconLinkOff className={`h-5 w-5 fill-none stroke-current shrink-0 ${
                    newType === 'incompatibilidad' ? 'text-rose-500' : 'text-neutral-400'
                  }`} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={addRelation}
                className="flex-1 btn-primary py-2.5 text-sm font-semibold transition"
              >
                Añadir
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewEntityA('');
                  setNewEntityB('');
                  setNewType('afinidad');
                  setIsAdding(false);
                }}
                className="btn-secondary px-6 py-2.5 text-sm font-semibold transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm font-semibold text-neutral-800 hover:text-neutral-900 transition pl-1 py-1"
          >
            <IconPlus className="h-4.5 w-4.5 text-neutral-600" />
            Añadir
          </button>
        )}
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
