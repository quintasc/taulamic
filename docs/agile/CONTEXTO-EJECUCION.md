# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-23**
- Commit web referencia: **`0f15b37`** · docs: **`f873ffb`** (`main`) — plano Fase A/B, mesas cantidad/etiquetas, invitados al clic
- Hito activo: **MVP julio (piloto)** — ver `DECISION-002-mvp-julio-piloto-funcional.md`
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic`
- **Modo actual:** trabajo en **2 ventanas Cursor** en paralelo (sin solapamiento de codigo)

## Como indicar tu ventana al agente

| Ventana | Di al agente |
|---------|----------------|
| **Ventana 1** | `Soy Ventana 1. Lee docs/agile/CONTEXTO-EJECUCION.md seccion Ventana 1.` |
| **Ventana 2** | `Soy Ventana 2. Lee docs/agile/CONTEXTO-EJECUCION.md seccion Ventana 2.` |

---

## Estado compartido (ambas ventanas)

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) — UX #7 **cerrado** (PR #37) |
| EP-11 / EP-12 / EP-13 | **Cerrados** (#22–#36) |
| EP-01 | **Cerrado** (#1 + #15) |
| EP-02 | **Cerrado** (#2) |
| EP-03 piloto | **Motor v0 entregado** (#3 abierta: EP-03 completo post-piloto) |
| Integracion E2E piloto | **Cerrada** (`pilot-flow.e2e-spec.ts`) |
| OpenAPI piloto (#9) | **Cerrado** (`/api/docs`, `/api-json`, contrato validado) |
| Frontend admin W5 | **Cerrado** (PR #38 — base `apps/web`) |
| **Frontend piloto UI W6** | **Cerrado** — PR **#39** mergeado en `main` (`b03a7f0`, validación manual OK jun 2026) |
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` |

| Ventana | Issue / foco | Rama | Estado |
|---------|--------------|------|--------|
| **1** | ~~Cerrar piloto UI~~ (W6) | ~~feat/web-piloto-ui-w6~~ | **Cerrado** (PR #39 → `main`) |
| **2** | ~~#7~~ Figma MVP (UX) | ~~feat/7-figma-mvp~~ | **Cerrado** (PR #37) |

**Ventana 2 libre.** Apoyo UX: Figma **plano espacial** (post-MVP), lista sin asignar, edición manual distribución.

### Decisiones producto recientes (jun 2026)

Ver `docs/ux/handoff-figma-a-frontend.md` § **Decisiones y backlog UX post-validación manual**:

- Distribución v2 + Dashboard v2 + afinidad «no calculado en piloto»
- Excel **sin** `preferencia_control` (pendiente aprobación cambio spec)
- **Plano:** vision espacial dos fases — **`ADR-016`** + `SDD-01D` actualizado; Fase A/B en web (`0f15b37`); drag-drop y API layout post-MVP
- Bloqueo invitados: en SDD §7.1; sin API/UI piloto
- Manual ✕/+ en mesas y lista sin asignar clic KPI: post-piloto / tras Figma

---

## Ventana 1 — Cerrar piloto UI (W6)

**Para:** esta ventana de Cursor (API + `apps/web`).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Taulamic main @ f873ffb (código 0f15b37). Piloto: Distribución v2, plano Fase A/B (ADR-016), mesas M1…n, invitados al clic. Lee docs/sdd/SDD-PILOTO-alineacion-y-huecos.md. API :3000, web :3001. SDD manda.
```

### Objetivo

Completar y mantener el piloto demostrable: **Distribución v2**, **Dashboard v2**, **plano Fase A/B** (`ADR-016`). «Corregir plano» (detección mesas) **suspendido**. Ver handoff y `mvp-julio-plan.md`.

### Entregado (W5 PR #38 + W6 PR #39 — en `main`)

- `apps/web` Next.js 15 en `:3001` (proxy `/api/v1`)
- Rutas `/admin/events/[id]/…` alineadas al handoff
- **Landing** en `app/(marketing)/` alineada Figma Make
- **Estructura modular:** `components/ui|marketing|admin|brand|tables`, `hooks/`, `lib/`
- Admin shell: logo, sidebar, «Evento en curso» (solo lectura), nav-map
- Dashboard KPIs en 0 para proyecto vacío; sesión MVP (`sessionStorage`, evento nuevo en `/admin`)
- Pantallas: config, **plano Fase A** (forma/medidas), invitados, preferencias, mesas (cantidad + etiquetas), **distribución v2**, **ver en plano Fase B** (invitados al clic)
- **Dashboard v2** — KPIs Invitados/Mesas/plazas; afinidad «No calculado en piloto»
- Fixes: shim `components/ui.tsx`, hydration `HeroFloorplan`, `npm run dev:clean`
- CORS API para `localhost:3001`
- **Eliminar mesa** con aviso si hay invitados en borrador + reconciliación API (`88e0d33`)

- Decisión MVP documentada: no recuperar eventos guardados entre sesiones

### Pendiente post-W6 (piloto / post-MVP)

1. ~~Validación manual UI~~ — OK jun 2026
2. ~~Merge PR #39~~ — hecho; plano adicional en `0f15b37`
3. **Plano:** fondo opcional, accesorios drag, API persistencia layout (`ADR-016`)
4. Checklist setup: prefs y plano (hardcoded `false` en dashboard)
5. **Post-MVP:** drag-drop posiciones mesas, lista sin asignar, edición ✕/+, bloqueo invitados, Excel sin `preferencia_control`

### Documentacion gobernanza plano (2026-06-23)

- `docs/adr/ADR-016-plano-espacial-salon-dos-fases.md`
- `docs/sdd/SDD-01D-importacion-plano-salon.md` (reescrito)
- `docs/sdd/SDD-PILOTO-alineacion-y-huecos.md` (tabla HU / huecos)

### Dev local (Windows / OneDrive)

```powershell
# Terminal 1 — API
cd apps\api; npm run start:dev

# Terminal 2 — Web (usar ruta corta si falla el path con apóstrofo)
cd apps\web; npm run dev:clean
```

- Web: http://localhost:3001
- Si **Internal Server Error** o pantalla blanca: matar proceso en `:3001` (`netstat -ano | findstr :3001` → `taskkill /PID … /F`) y **`npm run dev:clean`** (sin argumentos extra).
- PowerShell: usar `;` en lugar de `&&`.

### Referencias

- `docs/agile/mvp-julio-plan.md` (W6 cierre piloto)
- `docs/sdd/SDD-PILOTO-alineacion-y-huecos.md` (cumplimiento piloto vs SDD-01)
- `docs/adr/ADR-016-plano-espacial-salon-dos-fases.md`
- **`docs/ux/handoff-figma-a-frontend.md`** (mapa pantallas → API + checklist)
- `docs/ux/design-tokens-mvp.md` · `docs/ux/figma-mvp.md` · `docs/ux/figma-make-prompts.md`
- OpenAPI: `/api/docs` y `/api-json` (version `1.0-pilot`)
- E2E backend: `apps/api/test/pilot-flow.e2e-spec.ts`
- Web: `apps/web/README.md`

### Patron de cierre W6

1. Flujo piloto usable en UI con evidencia manual — **hecho** (jun 2026)
2. Build/tests piloto en verde (`apps/api` + `apps/web`) — **hecho**
3. ~~Merge PR #39~~ — en `main`; plano Fase A/B adicional en `0f15b37`; docs `f873ffb` + alineación secundaria

---

## Ventana 2 — Figma MVP (#7)

**Para:** segunda ventana de Cursor (UX; sin codigo API).

### Frase clave (pegar en el chat)

```text
Soy Ventana 2. Retomo Taulamic (ADR-016 plano espacial). Trabajo UX en Figma y docs/ux/. No tocar apps/api/. Handoff § Plano + SDD-01D.
```

### Objetivo

Flujos y wireframes MVP en Figma. Ver `docs/ux/figma-mvp.md`.

### Estado

**#7 cerrado** (PR #37). Handoff a frontend: `docs/ux/handoff-figma-a-frontend.md`.

### Apoyo sugerido (post-W6)

- Refinar Figma **Plano Fase B** (drag-drop mesas — post-MVP)
- Lista sin asignar (clic KPI) y edición manual distribución (tras Figma)
- ~~Especificar «Corregir plano»~~ — suspendido (`ADR-016`)

### APIs disponibles en main (para wireframes)

- Evento/mesas (#1): `POST/GET /api/v1/events`, `.../tables`
- Invitados (#2): `GET/POST/PUT/DELETE .../events/:eventId/guests`
- Distribucion (#3 piloto): `POST .../distribution/run`, `GET .../distribution`, `POST .../confirm`
- Forma mesa (#15): `GET .../table-shapes`, `.../seat-topology`
- Plano (#22–#26): API legacy deteccion mesas; **UI** plano espacial `ADR-016`

### Patron de cierre

Merge rama UX → `main` → actualizar handoff si cambia contrato visual → avisar Ventana 1

---

## Comandos utiles (Ventana 1)

```powershell
# API
cd apps\api
npm run build; npm test; npm run test:e2e
npm run start:dev

# Web admin
cd apps\web
npm install
npm run dev:clean
npm run build
```

## Ultimos commits de referencia (rama feat/web-piloto-ui-w6)

| Commit | Descripcion |
|--------|-------------|
| 3b26191 | feat(web): vista distribución calculada alineada con Figma |
| 581c0d4 | fix(web): evitar hydration mismatch en HeroFloorplan |
| 66eb927 | fix(web): shim ui.tsx tras modularización |
| e269022 | refactor(web): modularizar UI por dominios |
| 8824d1a | refactor(web): landing en app/(marketing) |
| c1ef80a | feat(web): piloto UI Figma + sesión MVP |
| 1c16502 | Merge PR #38 — frontend admin piloto W5 (main) |
