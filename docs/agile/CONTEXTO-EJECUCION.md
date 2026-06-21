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
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` |

| Ventana | Issue | Rama | Estado |
|---------|-------|------|--------|
| **1** | **Frontend admin minimo** (W5 plan julio) | eat/admin-ui-piloto (crear) | **Siguiente** |
| **2** | ~~#7~~ Figma MVP (UX) | eat/7-figma-mvp | **Cerrado** (PR #37) |

**Ventana 2 libre** tras cierre #7. Siguiente sugerido: apoyo UX a **#1** / frontend admin (W5) o backlog post-piloto Figma. Enlace Make: docs/ux/figma-mvp.md.

---

## Ventana 1 — Frontend admin minimo (W5)

**Para:** esta ventana de Cursor (backend + UI minima si existe `apps/web`).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Retomo Taulamic. Frontend admin minimo piloto julio. Rama feat/admin-ui-piloto. OpenAPI y E2E piloto cerrados. SDD manda.
```

### Objetivo

UI admin minima (Next.js) para el flujo piloto: evento → mesas → invitados → motor → confirmacion. Ver `mvp-julio-plan.md` W5.

### Referencias

- `docs/agile/mvp-julio-plan.md` (W5 frontend admin)
- OpenAPI: `/api/docs` y `/api-json` (version `1.0-pilot`)
- E2E backend: `apps/api/test/pilot-flow.e2e-spec.ts`

### Patron de cierre

1. Flujo piloto usable en UI + build/tests en verde
2. Rama `feat/admin-ui-piloto` → merge `main` → actualizar este archivo

---

## Ventana 2 — Figma MVP (#7)

**Para:** segunda ventana de Cursor (UX; sin codigo API).

### Frase clave (pegar en el chat)

```text
Soy Ventana 2. Retomo Taulamic. Issue #7 Figma MVP alineado con SDD. Rama feat/7-figma-mvp. Trabajo UX en Figma y docs/ux/. No tocar apps/api/. SDD-01A manda.
```

### Objetivo

Flujos y wireframes MVP en Figma. Ver `docs/ux/figma-mvp.md`.

### APIs disponibles en main (para wireframes)

- Evento/mesas (#1): `POST/GET /api/v1/events`, `.../tables`
- Invitados (#2): `GET/POST/PUT/DELETE .../events/:eventId/guests`
- Distribucion (#3 piloto): `POST .../distribution/run`, `GET .../distribution`, `POST .../confirm`
- Forma mesa (#15): `GET .../table-shapes`, `.../seat-topology`
- Plano (#22–#26), Excel (#27–#31), preferencias (#32–#36)

### Patron de cierre

Merge `feat/7-figma-mvp` → `main` → cerrar **#7** → actualizar este archivo

---

## Comandos utiles (Ventana 1)

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```

## Ultimos commits de referencia

| Commit | Descripcion |
|--------|-------------|
| 05d756 | Merge PR #37 — Figma MVP UX (#7) |
| e89fcc7 | docs UX Figma Make MVP (#7) |
| 975219e | OpenAPI piloto EP-07 (#9) |
| 85edda2 | Integracion E2E piloto MVP julio |
| 2d57530 | Motor v0 piloto EP-03 (#3) |
| 4510c6 | Invitados API piloto EP-02 (#2) |
| 8001f0d | Evento y mesas HU-01 (#1) |
| 7dcb111 | Forma mesa y topologia HU-29 (#15) |
| 57834be | Contexto dual ventana |
