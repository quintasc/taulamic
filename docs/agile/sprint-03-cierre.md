# Sprint 03 — Cierre y registro de entregas

- **Inicio:** 2026-06-24 (post cierre Sprint 02 #21)
- **Cierre documental:** 2026-06-26
- **Rama:** `main` @ **`21d249e`**
- **Origen feedback:** `evidencias-piloto/sesion-2026-06-24.md` (MEJ-01…09)
- **Plan:** `sprint-03-plan.md`

## 1) Resumen ejecutivo

Sprint 03 abordó las mejoras UX **P1 y P2** derivadas de la validación PO del 24-jun, más iconos representativos del plano (MEJ-06) y pulido de marca/admin. El núcleo piloto permanece estable; no se abrió migración PostgreSQL ni auth.

| Ámbito | Entregado | Pendiente |
|--------|-----------|-----------|
| Invitados (MEJ-01, 03, 04) | ✅ | — |
| Plano accesorios (MEJ-06) | ✅ | MEJ-05 (#48) resize/límites |
| Estabilidad F5 (MEJ-09) | ✅ | — |
| Marca + admin UX | ✅ wordmark, footer, countdown | — |
| Excel ampliado (MEJ-02) | — | #45 |
| Afinidades orden (MEJ-07) | — | #50 |
| Distribución manual (MEJ-08) | — | #51 |
| Organizador real | — | #53 pospuesto |

---

## 2) Commits en `main`

### `6d0b074` — feat(web): Sprint 03 piloto, iconos del plano y fix Sentry

| Issue | MEJ | Cambio |
|-------|-----|--------|
| [#44](https://github.com/quintasc/taulamic/issues/44) | MEJ-01 | Enlace **Descargar plantilla** persistente en `GuestsImportSection` (variante `more` y vacía). |
| [#46](https://github.com/quintasc/taulamic/issues/46) | MEJ-03 | Chips de filtro RSVP/alertas en `GuestsPanelV2`; recuento en barra bulk según filtro activo. |
| [#47](https://github.com/quintasc/taulamic/issues/47) | MEJ-04 | `ConfirmDialog` reutilizable; eliminar invitado con diálogo alineado a guía de estilo (sustituye toast crudo). |
| [#49](https://github.com/quintasc/taulamic/issues/49) | MEJ-06 | Iconos SVG por accesorio en `icons.tsx` + `FloorAccessoryIcon`; tamaños card/overlay; escenario micro PNG sólido; servicio «WC». |
| [#52](https://github.com/quintasc/taulamic/issues/52) | MEJ-09 | `event-context` + `RequireEvent` + `layout`: estado `hydrating` para evitar flash «Crear evento» al F5. |
| — | — | Fix Sentry opcional en dev (`instrumentation.ts`, `report-client-error.ts`, `error.tsx`). |
| — | — | Fix redirect `/admin` en Strict Mode dev/E2E (`admin/page.tsx`, cleanup + deps estables). |
| — | — | Ajustes menores API room-setup (validator spec + DTO). |

**Archivos clave:**

- `apps/web/src/components/admin/guests/guests-import-section.tsx`
- `apps/web/src/components/admin/guests/v2/guests-panel-v2.tsx`
- `apps/web/src/hooks/use-guests-page.ts`
- `apps/web/src/components/ui/confirm-dialog.tsx`
- `apps/web/src/components/icons.tsx`
- `apps/web/src/components/admin/floor-plan/floor-accessory-icon.tsx`
- `apps/web/src/lib/event-context.tsx`
- `apps/web/src/components/admin/require-event.tsx`

### `21d249e` — feat(web): wordmark PNG, footer admin y animacion cuenta atras

| Ámbito | Cambio |
|--------|--------|
| Marca | Wordmark PNG 2 colores (`TextoTaulamic2Colores`) en `public/taulamic-wordmark.png`; `TaulamicLogo` usa `<img>` en lugar de texto; `brand.config.ts` → `wordmarkPng`. |
| Footer setup | `SetupNavBar` fijo respeta ancho sidebar (`--admin-sidebar-width: 220px`); ya no solapa sidebar ni «Mapa navegación». |
| Dashboard | Cuenta atrás: separador horas/minutos estilo matriz de puntos con animación suave (`countdown-colon-pulse`); respeta `prefers-reduced-motion`. |
| Sidebar | Ancho unificado vía variable CSS (sustituye token Tailwind `w-sidebar` no compilado). |

**Archivos clave:**

- `apps/web/public/taulamic-wordmark.png`
- `docs/ux/assets/taulamic-wordmark.png`
- `apps/web/src/components/brand/taulamic-logo.tsx`
- `apps/web/src/components/admin/setup-nav-bar.tsx`
- `apps/web/src/components/admin/event-countdown.tsx`
- `apps/web/src/app/globals.css`

---

## 3) Issues GitHub — estado post-cierre

| Issue | MEJ | Estado | Commit |
|-------|-----|--------|--------|
| #44 | MEJ-01 | **Cerrada** | `6d0b074` |
| #46 | MEJ-03 | **Cerrada** | `6d0b074` |
| #47 | MEJ-04 | **Cerrada** | `6d0b074` |
| #49 | MEJ-06 | **Cerrada** | `6d0b074` |
| #52 | MEJ-09 | **Cerrada** | `6d0b074` |
| #45 | MEJ-02 | Abierta | — |
| #48 | MEJ-05 | Abierta | — |
| #50 | MEJ-07 | Abierta | — |
| #51 | MEJ-08 | Abierta | — |
| #53 | — | Abierta (pospuesta) | — |

---

## 4) Criterios de cierre Sprint 03

| Criterio | Estado |
|----------|--------|
| Issues P1 (#44, #46) cerradas | ✅ |
| Issues P2 (#47, #52) cerradas | ✅ |
| MEJ-06 (#49) entregada | ✅ |
| `npm run build` + tests piloto | ✅ 2026-06-26 — API 69+61 tests; web build OK; Playwright 3/3 (`CI=1`, puertos libres) |
| CONTEXTO y roadmap actualizados | ✅ (este doc + `CONTEXTO-EJECUCION.md`) |

---

## 5) Validación (2026-06-26)

| Comando | Resultado |
|---------|-----------|
| API `npm run build` | ✅ |
| API `npm test` | ✅ 23 suites · 69 tests |
| API `npm run test:e2e` | ✅ 14 suites · 61 tests |
| Web `npm run build` | ✅ (2 warnings ESLint hooks, no bloquean) |
| Web `npm run test:e2e` | ✅ 3/3 Playwright |

**Nota E2E:** con `npm run dev` ya en marcha en :3000/:3001, Playwright puede quedarse en «Creando evento…». Usar puertos libres o `$env:CI='1'; npm run test:e2e` para servidores dedicados.

**Smoke manual rápido:**

1. Invitados → descargar plantilla dos veces (lista vacía y con datos).
2. Filtros RSVP + recuento en barra bulk.
3. Eliminar invitado → diálogo confirmación.
4. Plano → iconos accesorios en tarjetas y overlay.
5. F5 en dashboard admin → sin flash «Crear evento».
6. Logo wordmark 2 colores en sidebar y landing; footer no tapa sidebar.

Guion completo: `guion-validacion-piloto-ui.md`.

---

## 6) Siguiente sprint sugerido (Sprint 04)

Prioridad PO sugerida (backlog `post-piloto` restante):

1. **#48** — Plano: aviso tamaño máximo, resize diagonal, comportamiento al exceder límites.
2. **#50** — Afinidades: reglas genéricas antes de matriz interpersonal.
3. **#45** — Excel ampliado (columnas menú especial / movilidad / observaciones).
4. **#51** — Distribución manual (alcance grande; valorar sprint dedicado).

Epics MVP agosto+ (fuera piloto): EP-08, EP-09, PostgreSQL, auth — ver `mvp-julio-plan.md` §5.

---

## 7) Referencias

- Feedback PO: `evidencias-piloto/sesion-2026-06-24.md`
- Punto de reanudación: `CONTEXTO-EJECUCION.md`
- GitHub Project: https://github.com/users/quintasc/projects/2
