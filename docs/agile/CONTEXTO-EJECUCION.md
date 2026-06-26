# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-24**
- Commit referencia: **`796329b`** (`main`) — refactor clean architecture frontend (#43)
- Hito activo: **MVP julio (piloto)** — **cierre** (DoD `mvp-julio-plan.md` §4)
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic`
- **Modo actual:** una ventana Cursor (cierre piloto); segunda ventana opcional solo para Figma/UX post-piloto

## Frase clave (pegar al agente)

```text
Retomo Taulamic. main @ 796329b. Piloto casi cerrado: falta guion validacion actualizado, tests en verde, evidencias finales y issues post-piloto. Lee docs/agile/mvp-julio-plan.md §4 y guion-validacion-piloto-ui.md. SDD manda.
```

---

## Estado compartido

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 — UX #7 **cerrado** |
| EP-11 / EP-12 / EP-13 | **Cerrados** |
| EP-01 / EP-02 | **Cerrados** |
| EP-03 piloto | **Motor v0 entregado** (EP-03 completo = post-piloto) |
| Integracion E2E API | **Cerrada** (`pilot-flow.e2e-spec.ts`) |
| OpenAPI piloto | **Cerrado** (`/api/docs`, `/api-json`) |
| API room-setup Fase A | **Cerrado** (`GET/PUT .../room-setup`, ADR-020) |
| Frontend admin piloto | **Cerrado** (flujo setup + pantallas piloto) |
| **Barra setup + guardado implicito** | **Cerrado** (PR #40) |
| **Feedback UX (toast, auto-save, validacion)** | **Cerrado** (PR #41) |
| **Guia estilo canonica** | **Cerrado** (PR #42, `guia-estilo-taulamic.md`) |
| **Clean architecture frontend** | **Cerrado** (PR #43, ADR-021) |
| Invitados v2 en `/guests` | **Cerrado** — legacy eliminada |
| Paso setup «Tarjetas» (candado) | **Cerrado** — nav + checklist bloqueados (HU-10 post-piloto) |
| Validacion manual piloto (jun-21) | **Ejecutada** — `evidencias-piloto/sesion-2026-06-21.md` |
| **Validacion manual post-UX** | **Pendiente** — guion desactualizado (boton «Guardar») |
| **DoD piloto julio** | **Pendiente** — ver checklist abajo |
| Plan piloto | `docs/agile/mvp-julio-plan.md` · Gantt `roadmap-mvp-julio.md` |

---

## Entregado reciente en `main` (jun 2026)

| PR / commit | Que aporta |
|-------------|------------|
| **#40** `b324221` | `SetupNavBar` (Anterior/Siguiente), guardado implicito, cuenta atras setup |
| **#41** `6863fd9` | Banner validacion al pulsar «Siguiente» bloqueado; `ToastProvider`; `SaveStatusIndicator` en Config, Plano, Afinidades; toasts en Invitados y Mesas |
| **#42** `7851c73` | `docs/ux/guia-estilo-taulamic.md`; regla Cursor `guia-estilo-ux.mdc`; referencias cruzadas UX |
| **#43** `796329b` | ADR-021; primitivos UI (`Button`, `FormField`, `Stepper`, …); paginas delgadas (`EventConfigView`, `TablesSetupView`, `GuestsPageView` + hooks); `lib/domain/setup-steps.ts` |
| `dfae7ef` | Notas adopcion Invitados v2 |
| `74ca926` | API room-setup + validacion DTO |
| `b360bed` → consolidacion | Panel Invitados v2 unico en `/guests`; `/guests-v2` eliminado |

### Flujo setup vigente (ADR-018)

Config → Invitados → **Tarjetas** (🔒) → Plano → Mesas → Afinidades → Distribución

### Arquitectura frontend (ADR-021)

```
app/ (rutas finas) → components/admin/*View + components/ui/
                   → hooks/use-* (orquestacion)
                   → lib/domain/ (reglas puras)
                   → lib/api.ts (infra HTTP)
```

Paginas refactorizadas: `config`, `tables`, `guests`. Pendiente modularizar: `distribution`, `floor-plan/layout`, `guests-panel-v2` (~578 LOC).

---

## Pendiente — cierre piloto (prioridad)

Orden sugerido para cumplir **DoD** (`mvp-julio-plan.md` §4):

| # | Tarea | Notas |
|---|-------|-------|
| 1 | **Actualizar guion validacion** | Quitar pasos «Guardar»; reflejar auto-save, toasts, `SetupNavBar`, `SaveStatusIndicator` |
| 2 | **Ejecutar validacion manual E2E UI** | Tras guion actualizado; flujo punta a punta |
| 3 | **Evidencias finales** | Nueva sesion en `docs/agile/evidencias-piloto/` (jun-21 queda como referencia historica) |
| 4 | **Tests/CI en verde** | `apps/api`: build + test + test:e2e; `apps/web`: build (+ e2e si aplica piloto) |
| 5 | **Prueba con organizador real** | Julio 2026 — feedback cualitativo |
| 6 | **Issues `post-piloto` en GitHub** | HU-05, auth, PostgreSQL, panel Invitados v2 completo, Maps, etc. |
| 7 | **Verificar OpenAPI vs UI** | Contrato alineado con pantallas piloto |

### Fuera de alcance piloto (no bloquea cierre)

- HU-05 ajuste manual distribucion (`SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`)
- Google Maps en config
- Drawer + bulk bar Invitados v2 completo (`spec-invitados-panel-v2-post-piloto.md`)
- Lista sin asignar (clic KPI)
- Auth JWT/RBAC, PostgreSQL prod
- Refactors tecnicos: hooks `distribution` / `floor-plan/layout`; split `event-ui-meta.ts`

---

## Como indicar ventana al agente (opcional)

Si trabajas en **2 ventanas Cursor** en paralelo:

| Ventana | Di al agente |
|---------|----------------|
| **Ventana 1** | `Soy Ventana 1. Cierre piloto: guion, tests, evidencias. Lee CONTEXTO-EJECUCION.md.` |
| **Ventana 2** | `Soy Ventana 2. UX post-piloto / Figma. No tocar apps/api/. spec-invitados-panel-v2-post-piloto.md` |

### Ventana 1 — codigo + validacion

**Objetivo:** cerrar DoD piloto (guion, evidencias, CI verde).

**Referencias inmediatas:**

- `docs/agile/guion-validacion-piloto-ui.md` (actualizar primero)
- `docs/agile/evidencias-piloto/sesion-2026-06-21.md` (sesion anterior)
- `docs/sdd/SDD-PILOTO-alineacion-y-huecos.md`

### Ventana 2 — UX / Figma post-piloto

**Objetivo:** wireframes panel Invitados v2 (drawer, bulk bar, filtros) — **no bloquea cierre piloto**.

- `docs/ux/spec-invitados-panel-v2-post-piloto.md` §8
- `docs/ux/figma-make-prompts.md` — Prompt 8
- `docs/ux/guia-estilo-taulamic.md` — patrones obligatorios

---

## Decisiones producto (jun 2026)

- Validacion piloto jun-21 completada; feedback PO → spec Invitados v2 post-piloto
- **Invitados v2** consolidado en `/guests`; separacion estricta Invitados (datos) vs Afinidades (reglas)
- **Paso «Tarjetas»:** placeholder en nav/checklist, candado hasta HU-10/HU-11
- **Guardado implicito:** sin boton «Guardar» en Config/Plano/Afinidades; indicador «Guardando… / Guardado» + toasts en acciones puntuales
- **Plano Fase A:** persistencia API (`room-setup`); `localStorage` como legado/fallback en utilidades
- **HU-05 manual:** post-piloto (enmienda SDD)

---

## Dev local (Windows / OneDrive)

```powershell
# Raíz — API + web (recomendado)
npm install
npm run install:apps   # primera vez
npm run dev
```

```powershell
# Solo una app
npm run dev:api
npm run dev:web
```

- API: http://localhost:3000 · Web: http://localhost:3001
- Si pantalla blanca o Internal Server Error en web: matar proceso `:3001` y `npm run dev:clean`
- Paths con apóstrofo (OneDrive): `git -C "ruta\taulamic" ...` o rutas cortas; PowerShell: `;` en lugar de `&&`

### Comandos validacion

```powershell
# API
cd apps\api; npm run build; npm test; npm run test:e2e

# Web
cd apps\web; npm run build
```

---

## Referencias

| Documento | Para que |
|-----------|----------|
| `docs/agile/mvp-julio-plan.md` | DoD piloto §4 |
| `docs/agile/guion-validacion-piloto-ui.md` | Validacion manual UI |
| `docs/ux/guia-estilo-taulamic.md` | Patrones UX/UI obligatorios |
| `docs/ux/frontend-component-system.md` | Capas + inventario componentes |
| `docs/ux/handoff-figma-a-frontend.md` | Mapa pantallas → API |
| `docs/adr/ADR-018-preferencias-afinidades-y-flujo-setup.md` | Orden setup |
| `docs/adr/ADR-020-api-persistencia-room-setup-fase-a.md` | API plano Fase A |
| `docs/adr/ADR-021-frontend-clean-architecture-pragmatica.md` | Capas frontend |
| `docs/sdd/SDD-PILOTO-alineacion-y-huecos.md` | Cumplimiento vs SDD |
| `docs/ux/spec-invitados-panel-v2-post-piloto.md` | Invitados v2 post-piloto |
| OpenAPI | `/api/docs` y `/api-json` (version `1.0-pilot`) |
| E2E backend | `apps/api/test/pilot-flow.e2e-spec.ts` |
| Web | `apps/web/README.md` |

---

## Ultimos commits de referencia (`main`)

| Commit | Descripcion |
|--------|-------------|
| 796329b | refactor(web): clean architecture pragmatica (#43) |
| 7851c73 | docs(ux): guia estilo canonica (#42) |
| 6863fd9 | feat(web): feedback UX setup (#41) |
| b324221 | feat(web): barra setup, guardado implicito (#40) |
| dfae7ef | docs(agile): notas sesion jun 2026 e Invitados v2 |
| b360bed | feat(web): vista previa Invitados v2 (consolidada despues) |
| 74ca926 | fix(api): validar DTO room-setup |
| 010cbae | feat(piloto): refinamiento UI setup invitados plano |
