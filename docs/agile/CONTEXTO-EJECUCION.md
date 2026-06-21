# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-21
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
| Frontend admin W5 | **Cerrado** (PR #38 — `apps/web`, rutas handoff UX) |
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` |

| Ventana | Issue / foco | Rama | Estado |
|---------|--------------|------|--------|
| **1** | **Cerrar piloto UI** (W6 plan julio) | `main` o `feat/*` segun fix | **Siguiente** |
| **2** | ~~#7~~ Figma MVP (UX) | ~~feat/7-figma-mvp~~ | **Cerrado** (PR #37) |

**Ventana 2 libre.** Siguiente sugerido: apoyo UX a **Corregir plano** (handoff) o refinamiento visual post-piloto. Enlace Make: `docs/ux/figma-mvp.md`.

---

## Ventana 1 — Cerrar piloto UI (W6)

**Para:** esta ventana de Cursor (API + `apps/web`).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Retomo Taulamic. Cierre piloto UI julio (W6). Frontend en main (apps/web). Validar flujo manual, Corregir plano y fixes. OpenAPI y E2E piloto cerrados. SDD manda.
```

### Objetivo

Completar el piloto demostrable en UI: validar flujo punta a punta, pantalla **Corregir plano**, prueba con API local y fixes. Ver `mvp-julio-plan.md` W6 y checklist en `handoff-figma-a-frontend.md`.

### Entregado (W5 — PR #38)

- `apps/web` Next.js 15 en `:3001` (proxy `/api/v1`)
- Rutas `/admin/events/[id]/…` alineadas al handoff
- Landing, dashboard, config, plano (subir), invitados, preferencias, mesas, distribución
- CORS API para `localhost:3001`

### Pendiente inmediato

1. Validar flujo piloto manualmente vs `pilot-flow.e2e-spec.ts`
2. Pantalla **Corregir plano** (draft + confirm — handoff sección Plano)
3. Probar API + web en local; fixes de integración
4. Evidencia piloto + issues `post-piloto` si aplica

### Referencias

- `docs/agile/mvp-julio-plan.md` (W6 cierre piloto)
- **`docs/ux/handoff-figma-a-frontend.md`** (mapa pantallas → API + checklist)
- `docs/ux/design-tokens-mvp.md` · `docs/ux/figma-mvp.md`
- OpenAPI: `/api/docs` y `/api-json` (version `1.0-pilot`)
- E2E backend: `apps/api/test/pilot-flow.e2e-spec.ts`
- Web: `apps/web/README.md`

### Patron de cierre W6

1. Flujo piloto usable en UI con evidencia manual
2. Build/tests piloto en verde (`apps/api` + `apps/web`)
3. Actualizar checklist handoff y este archivo

---

## Ventana 2 — Figma MVP (#7)

**Para:** segunda ventana de Cursor (UX; sin codigo API).

### Frase clave (pegar en el chat)

```text
Soy Ventana 2. Retomo Taulamic. Issue #7 Figma MVP alineado con SDD. Rama feat/7-figma-mvp. Trabajo UX en Figma y docs/ux/. No tocar apps/api/. SDD-01A manda.
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

```bash
# API
cd apps/api
npm run build && npm test && npm run test:e2e
npm run start:dev

# Web admin
cd apps/web
npm install
npm run dev
npm run build
```

## Ultimos commits de referencia

| Commit | Descripcion |
|--------|-------------|
| 1c16502 | Merge PR #38 — frontend admin piloto W5 |
| d682187 | feat(web): admin Next.js rutas handoff UX |
| 728bbfa | Handoff Figma Make → frontend (Ventana 1) |
| a05d756 | Merge PR #37 — Figma MVP UX (#7) |
| e89fcc7 | docs UX Figma Make MVP (#7) |
| 975219e | OpenAPI piloto EP-07 (#9) |
| 85edda2 | Integracion E2E piloto MVP julio |
| 2d57530 | Motor v0 piloto EP-03 (#3) |
| f4510c6 | Invitados API piloto EP-02 (#2) |
| 8001f0d | Evento y mesas HU-01 (#1) |
| 7dcb111 | Forma mesa y topologia HU-29 (#15) |
