# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-23**
- Commit referencia: **`b360bed`** (`main`) — vista previa panel Invitados v2 aislada (`/guests-v2`)
- Hito activo: **MVP julio (piloto)** — cierre W2: API room-setup + estabilizacion
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
| **Frontend piloto UI W6** | **Cerrado** — refinamiento jun 2026 (`010cbae`) |
| **Validacion manual piloto** | **Cerrada** — `evidencias-piloto/sesion-2026-06-21.md` |
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` · Gantt `roadmap-mvp-julio.md` |

| Ventana | Issue / foco | Rama | Estado |
|---------|--------------|------|--------|
| **1** | API room-setup Fase A (`ADR-020`) | `feat/api-room-setup` | **Siguiente** |
| **2** | Figma panel Invitados v2 | — | **Siguiente** — `spec-invitados-panel-v2-post-piloto.md` |

**Ventana 1:** implementar `GET/PUT .../room-setup` y conectar web. **Ventana 2:** panel Invitados v2 — preview en codigo (`b360bed`); Figma Prompt 8 pendiente si hay tokens.

### Siguiente sesion (2026-06-24) — Invitados v2 como pantalla definitiva

**Decision PO (sesion 2026-06-23):** el rediseño de Invitados **sustituye** la vista anterior. La tabla legacy (`guests-list-view`, ruta `/guests` actual) **queda descartada**.

**Tareas a ejecutar / perfilar manana:**

1. **Eliminar mensajes azules de preview** — quitar `Alert variant="info"` del panel v2 («Vista previa…»), el aviso en `/guests` que enlaza a `/guests-v2`, y el subtítulo de cabecera que dice que no sustituye el flujo actual. Mantener solo la leyenda de cabecera *«Vista previa del panel tabular (post-piloto)»* hasta el corte final, o pasar directamente a título «Invitados» sin leyenda de preview.
2. **Promover v2 a ruta canonica** — mover panel v2 a `/guests` (o redirigir `/guests` → contenido v2); retirar `/guests-v2` y flag `PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED` cuando esté estable.
3. **Retirar vista anterior** — eliminar o archivar `guests-list-view.tsx` (tabla legacy) tras migrar flujo de importacion Excel al nuevo panel si aun no está.
4. **Mensajes de feedback** — el mensaje de exito al modificar un invitado («Invitado actualizado», etc.) **no debe quedarse fijo** si el usuario hace otras acciones; debe **sustituirse** por el feedback de la accion mas reciente (Excel descargado, invitaciones enviadas, importacion, eliminacion, …). Un unico canal de feedback por pantalla.

- No cambiar alcance funcional SDD; solo UX y consolidacion de pantalla Invitados.
- UI ya acordada: sin pastilla «Preview v2» (solo leyenda «Vista previa…» en subtitulo, hasta corte).

### Pendiente roadmap — nuevo paso setup «Diseñar invitaciones»

**Idea PO (sesion 2026-06-23):** añadir un paso en el flujo de setup (checklist / nav lateral), p. ej. **«Diseñar invitaciones»** (nombre a cerrar en copy), visible pero **bloqueado con candado** en piloto / hasta activar HU-10.

- **UX:** icono candado, estado disabled, tooltip «Próximamente» o similar; no navegable hasta desbloqueo post-piloto.
- **Posicion tentativa** en cadena ADR-018: tras **Invitados** y antes de **Mesas** o **Distribución** (validar con PO).
- **Alcance funcional:** editor/plantillas de invitacion + envio — **HU-10 / HU-11**; solo placeholder en nav hasta entonces.
- **Implementacion:** extender checklist setup (dashboard) y `adminRoutes`; sin API hasta spec de invitaciones.

---

### Decisiones producto recientes (jun 2026)

- Validación piloto completada; feedback PO → **`docs/ux/spec-invitados-panel-v2-post-piloto.md`**
- **Invitados v2 adoptado** (jun 2026): vista tabla legacy **descartada**; eliminar avisos azules de preview y consolidar en `/guests`
- **Nuevo paso setup (futuro):** «Diseñar invitaciones» en checklist, **bloqueado con candado** hasta HU-10 (post-piloto)
- Separación estricta **Invitados** (datos) vs **Afinidades** (reglas); drawer + bulk bar post-piloto
- Google Maps en config — post-piloto (invitaciones HU-10)
- Flujo setup: **ADR-018** — Config → Plano → Invitados → Mesas → Afinidades → Distribución
- Plano Fase A: persistencia API — **`ADR-020`** (hoy `localStorage`)
- HU-05 manual (✕/+/drag): **`SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`**

---

## Ventana 1 — API room-setup + estabilizacion piloto

**Para:** esta ventana de Cursor (API + `apps/web`).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Taulamic main @ 7e33e21. Siguiente: API room-setup Fase A (ADR-020) + conectar web. Lee docs/agile/CONTEXTO-EJECUCION.md. API :3000, web :3001. SDD manda.
```

### Objetivo

1. **Implementar** `GET/PUT /events/{id}/room-setup` (`ADR-020`).
2. Conectar `floor-plan-setup.ts` / Fase A y layout a la API (localStorage como fallback opcional).
3. Estabilizar incidencias que surjan del guion de validación.

### Entregado (en `main` hasta `7e33e21`)

- Nucleo piloto UI + refinamiento setup (`010cbae`, `10da7d5`)
- Plano Fase A/B, distribucion v2, dashboard v2, invitados manual, afinidades mock
- Docs: ADR-018/019, enmienda HU-05, guion validacion, spec Invitados v2

### Pendiente inmediato

1. **API room-setup** — `ADR-020` (critico W2)
2. Fondo opcional plano + accesorios drag canvas (post-piloto parcial)
3. Panel Invitados v2 — **tras Figma** (`spec-invitados-panel-v2`)
4. Post-piloto: HU-05, Maps config, bulk bar, lista sin asignar

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

- `docs/agile/guion-validacion-piloto-ui.md`
- `docs/agile/evidencias-piloto/sesion-2026-06-21.md`
- `docs/adr/ADR-020-api-persistencia-room-setup-fase-a.md`
- `docs/ux/spec-invitados-panel-v2-post-piloto.md`
- `docs/agile/mvp-julio-plan.md` (cierre piloto)
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

## Ventana 2 — Figma Invitados v2 + apoyo UX

**Para:** segunda ventana de Cursor (UX; sin codigo API).

### Frase clave (pegar en el chat)

```text
Soy Ventana 2. Taulamic spec Invitados v2 post-piloto. Figma Make prompt 8 en figma-make-prompts.md. No tocar apps/api/. spec-invitados-panel-v2-post-piloto.md
```

### Objetivo

Wireframes **panel Invitados v2**: tabla, drawer lateral, bulk action bar, filtros. Ver `docs/ux/spec-invitados-panel-v2-post-piloto.md` §8.

### Estado

**#7 cerrado.** Validacion PO jun 2026 alimenta spec v2.

### Apoyo sugerido (orden)

1. **Prompt 8** — Invitados v2 (tabla + drawer + bulk bar)
2. Lista sin asignar (clic KPI) — post-piloto
3. Plano Fase B drag mesas — post-MVP
4. Edicion manual distribucion (HU-05) — tras Figma

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

## Ultimos commits de referencia (`main`)

| Commit | Descripcion |
|--------|-------------|
| 7e33e21 | docs(ux): spec Invitados v2 + evidencias validacion |
| b360bed | feat(web): vista previa panel Invitados v2 aislada |
| 7cc6e11 | docs(agile): Gantt MVP julio actualizado |
| b4cd158 | docs(agile): guion validacion ADR-018 |
| 010cbae | feat(piloto): refinamiento UI setup invitados plano |
| 10da7d5 | docs(sdd): HU-05 post-piloto |
