# Refactor UI admin móvil — plan de ejecución

> **Estado:** en curso (fase 1 cerrada jun 2026; fases 2–4 pendientes)  
> **Ámbito:** `apps/web/src/components/admin/` y documentación UX  
> **SDD:** no cambia alcance funcional; mejora mantenibilidad y coherencia con `ADR-019`

---

## 1) Motivación

Tras MEJ-10–13 y el drawer admin (Sprint 09), el panel móvil creció con **variantes paralelas** (`lg:hidden` cards vs `hidden lg:block` tablas). Hay duplicación de RSVP, alertas, dimensiones del plano y breakpoints inconsistentes (plano en `md` vs resto en `lg`).

**Objetivo:** componentes reutilizables, breakpoint canónico `lg` (1024 px) para admin, documentación al día.

---

## 2) Convenciones acordadas

| Tema | Regla |
|------|--------|
| Breakpoint admin móvil/desktop | **`lg` (1024 px)** — sidebar fija `lg+`, drawer `< lg` |
| Excepción SetupNavBar labels | `< md` flechas solas; `md+` texto (`ResponsiveButtonLabel`) |
| Lista densa | Cards `< lg` + tabla/grid `lg+` (invitados, mesas, distribución) |
| Plano Fase A móvil | Controles numéricos + vista previa `compact`; **sin** tirador resize `< lg` |
| Primitivos compartidos | `admin/guests/shared/`, `admin/floor-plan/`, futuro `ui/admin-mobile-*` |
| Colores semánticos | `lib/semantic-ui.ts` — no clases sueltas duplicadas |

---

## 3) Fases

### Fase 1 — Extracciones y alineación (✅ iniciada)

| Tarea | Estado |
|-------|--------|
| `GuestRsvpIcon`, `GuestAlertsIcons`, `GuestAlertsInline` → `guests/shared/` | ✅ |
| `RoomDimensionFields` → `floor-plan/room-dimension-fields.tsx` | ✅ |
| Plano setup: `md` → `lg` para layout móvil/desktop | ✅ |
| Fix lienzo desktop: ancho según tarjeta, no viewport completo | ✅ |
| Desktop plano: inputs unificados con `parseDimensionInput` | ✅ |
| Actualizar `frontend-component-system.md` | ✅ |
| Registrar ideas futuras en `backlog-mejoras-post-piloto.md` | ✅ |
| Pulido PO: import invitados (`UploadZone`, `GuestTemplateFileRow`) | ✅ 2026-06-30 |
| Pulido PO: cabecera móvil logo + nombre evento | ✅ 2026-06-30 |
| Pulido PO: setup nav «Anterior» visible móvil | ✅ 2026-06-30 |
| Pulido PO: plano móvil límites + steppers + chevrones accesorios | ✅ 2026-06-30 |

### Fase 2 — Primitivos transversales (pendiente)

| Tarea | Prioridad |
|-------|-----------|
| `AdminMobileCardShell` (checkbox + header + panel) — unificar `guest-mobile-card`, `table-mobile-card` | P1 |
| `AdminExpandCollapseControl` — invitados + distribución | P2 |
| `AdminMobileToolbar` — búsqueda + filtro + CTA | P2 |
| `FloorPlanAccessoryPicker` — unificar `AccessoryCard` / `AccessoryChip` | P2 |
| Extraer `AdminMobileDrawer` de `admin-shell.tsx` | P3 |

### Fase 3 — Descomposición monolitos (pendiente)

| Archivo | LOC aprox. | Acción |
|---------|------------|--------|
| `guests-panel-v2.tsx` | ~800 | Orquestador; lógica filtro/menú en hooks |
| `distribution-table-list.tsx` | ~580 | Extraer celdas y expand |
| `setup-nav-bar.tsx` | ~485 | Eliminar flags A/B experimentales; una variante sticky |

### Fase 4 — Documentación y specs (pendiente)

| Doc | Acción |
|-----|--------|
| `spec-invitados-panel-v2-post-piloto.md` | Marcar v2 como **vigente en piloto**; separar post-piloto |
| `guia-estilo-taulamic.md` | § responsive admin ampliado (patrón cards/tablet) |
| `handoff-figma-a-frontend.md` | Frames 390 + 1024 admin |
| `SDD-02-backlog-inicial.md` | EP-16 ideas BF-01–03 |

---

## 4) Fuera de alcance (piloto)

- Tirador resize plano en móvil (inputs numéricos son el camino).
- Bottom nav admin (ADR-019 post-MVP).
- Zoom canvas plano (MEJ-12 C stretch).
- Accesorios drag `(x,y)` — gate SDD Sprint 09 P3.

---

## 5) Verificación

- E2E existentes: `floor-plan-mobile.spec.ts`, `mej-13-ui-copy.spec.ts`, `guests-mobile-cards.spec.ts`
- Tras cada fase: `npm run lint` en `apps/web`
- Validación manual: 390 px (móvil), 768–1023 px (tablet), 1280 px (escritorio)

---

## 6) Referencias

- `docs/ux/frontend-component-system.md`
- `docs/ux/guia-estilo-taulamic.md`
- `docs/adr/ADR-019-responsive-y-mobile-invitado.md`
- `docs/agile/backlog-mejoras-post-piloto.md`
