# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-22**
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
| **Frontend piloto UI W6** | **En curso** — PR **#39** (`feat/web-piloto-ui-w6`) |
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` |

| Ventana | Issue / foco | Rama | Estado |
|---------|--------------|------|--------|
| **1** | **Cerrar piloto UI** (W6 plan julio) | `feat/web-piloto-ui-w6` | **En curso** (PR #39) |
| **2** | ~~#7~~ Figma MVP (UX) | ~~feat/7-figma-mvp~~ | **Cerrado** (PR #37) |

**Ventana 2 libre.** Apoyo UX: Figma **plano espacial** (post-MVP), lista sin asignar, edición manual distribución.

### Decisiones producto recientes (jun 2026)

Ver `docs/ux/handoff-figma-a-frontend.md` § **Decisiones y backlog UX post-validación manual**:

- Distribución v2 + Dashboard v2 + afinidad «no calculado en piloto»
- Excel **sin** `preferencia_control` (pendiente aprobación cambio spec)
- **Plano:** nuevo propósito espacial post-distribución — **post-MVP** (ADR pendiente); suspendido «Corregir plano» piloto
- Bloqueo invitados: en SDD §7.1; sin API/UI piloto
- Manual ✕/+ en mesas y lista sin asignar clic KPI: post-piloto / tras Figma

---

## Ventana 1 — Cerrar piloto UI (W6)

**Para:** esta ventana de Cursor (API + `apps/web`).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Retomo Taulamic W6 piloto UI. Rama feat/web-piloto-ui-w6, PR #39. Distribución v2 + Dashboard v2 implementados (f0e0397). Pendiente: validación manual E2E y merge PR #39. API :3000, web :3001, npm run dev:clean en OneDrive. SDD manda.
```

### Objetivo

Completar el piloto demostrable en UI: **Distribución v2**, **Dashboard v2**, validación E2E manual, merge PR #39. **Corregir plano** suspendido (nueva visión plano espacial post-MVP). Ver handoff y `mvp-julio-plan.md` W6.

### Entregado (W5 — PR #38 + W6 — PR #39 en curso)

- `apps/web` Next.js 15 en `:3001` (proxy `/api/v1`)
- Rutas `/admin/events/[id]/…` alineadas al handoff
- **Landing** en `app/(marketing)/` alineada Figma Make
- **Estructura modular:** `components/ui|marketing|admin|brand|tables`, `hooks/`, `lib/`
- Admin shell: logo, sidebar, «Evento en curso» (solo lectura), nav-map
- Dashboard KPIs en 0 para proyecto vacío; sesión MVP (`sessionStorage`, evento nuevo en `/admin`)
- Pantallas: config, plano (subir), invitados, preferencias, mesas, **distribución v2** (tabla, filtros, todas las mesas, Ver en plano)
- **Dashboard v2** — KPIs Invitados/Mesas/plazas; afinidad «No calculado en piloto»
- Fixes: shim `components/ui.tsx`, hydration `HeroFloorplan`, `npm run dev:clean`
- CORS API para `localhost:3001`
- Decisión MVP documentada: no recuperar eventos guardados entre sesiones

### Pendiente inmediato (W6 piloto UI)

1. ~~**Distribución v2**~~ — hecho (`f0e0397`)
2. ~~**Dashboard v2**~~ — hecho (`f0e0397`)
3. ~~Copy **afinidad no calculada en piloto**~~ — hecho
4. **Validar flujo piloto manualmente** vs `pilot-flow.e2e-spec.ts` (checklist abajo)
5. Revisar / merge **PR #39** tras smoke test local
6. **Plano del salón v2** — post-MVP (Figma jun 2026; API nueva pendiente)
7. **Post-MVP / tras Figma:** posicionar mesas en canvas, lista sin asignar (clic KPI), edición ✕/+, bloqueo invitados, Excel sin `preferencia_control` (aprobar cambio spec)

#### Checklist validación manual UI (sin plano)

1. `/admin` → crea evento → dashboard KPIs en 0
2. **Mesas:** añadir 2 mesas (p. ej. 8 pax cada una)
3. **Preferencias:** guardar modo colaborativo
4. **Invitados:** importar Excel piloto (4+ invitados)
5. **Dashboard:** Invitados con total; Mesas con plazas y sobran/faltan
6. **Distribución:** Calcular → KPIs (plazas libres, afinidad —); **todas** las mesas visibles; filtros; expandir fila con pills
7. **Confirmar distribución** → vuelve al dashboard; setup incluye distribución
8. Recarga misma pestaña → datos persisten

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
- **`docs/ux/handoff-figma-a-frontend.md`** (mapa pantallas → API + checklist)
- `docs/ux/design-tokens-mvp.md` · `docs/ux/figma-mvp.md` · `docs/ux/figma-make-prompts.md`
- OpenAPI: `/api/docs` y `/api-json` (version `1.0-pilot`)
- E2E backend: `apps/api/test/pilot-flow.e2e-spec.ts`
- Web: `apps/web/README.md`
- PR abierta: https://github.com/quintasc/taulamic/pull/39

### Patron de cierre W6

1. Flujo piloto usable en UI con evidencia manual
2. Build/tests piloto en verde (`apps/api` + `apps/web`)
3. Merge PR #39 → actualizar checklist handoff y este archivo

---

## Ventana 2 — Figma MVP (#7)

**Para:** segunda ventana de Cursor (UX; sin codigo API).

### Frase clave (pegar en el chat)

```text
Soy Ventana 2. Retomo Taulamic. Issue #7 Figma MVP alineado con SDD. Trabajo UX en Figma y docs/ux/. No tocar apps/api/. SDD-01A manda.
```

### Objetivo

Flujos y wireframes MVP en Figma. Ver `docs/ux/figma-mvp.md`.

### Estado

**#7 cerrado** (PR #37). Handoff a frontend: `docs/ux/handoff-figma-a-frontend.md`.

### Apoyo sugerido (W6)

- Especificar / revisar UX de **Corregir plano** para implementacion en Ventana 1
- Refinamiento visual de pantallas ya implementadas en `apps/web` (sin cambiar alcance SDD)

### APIs disponibles en main (para wireframes)

- Evento/mesas (#1): `POST/GET /api/v1/events`, `.../tables`
- Invitados (#2): `GET/POST/PUT/DELETE .../events/:eventId/guests`
- Distribucion (#3 piloto): `POST .../distribution/run`, `GET .../distribution`, `POST .../confirm`
- Forma mesa (#15): `GET .../table-shapes`, `.../seat-topology`
- Plano (#22–#26), Excel (#27–#31), preferencias (#32–#36)

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
