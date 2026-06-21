# Handoff Figma Make → Frontend admin (Ventana 1)

Documento de traspaso UX → implementación UI. Issue #7 cerrada (PR #37).

| Recurso | Enlace |
|---------|--------|
| Figma Make | [MVP Taulamic App Design](https://www.figma.com/make/SanoIvjqWYghT7bXfNVpxj/MVP-Taulamic-App-Design?t=95kTMsKGpTjDmpBI-1) |
| Design tokens | `design-tokens-mvp.md` |
| OpenAPI (piloto) | `GET /api/docs` · `GET /api-json` (version `1.0-pilot`) |
| E2E referencia flujo | `apps/api/test/pilot-flow.e2e-spec.ts` |
| Rama sugerida V1 | `feat/admin-ui-piloto` |

**Prefijo API:** `/api/v1`

**Auth piloto:** no hay login. CTAs Marketing → `/admin` (crea evento nuevo). Header `x-taulamic-actor-role: admin` en endpoints que lo exigen.

**Sesión de evento (UI):** el piloto **no** recupera proyectos guardados ni lista eventos del usuario. Cada entrada a `/admin` crea un evento nuevo. El `eventId` vive en la URL y en `sessionStorage` solo mientras la pestaña está abierta (recarga OK; enlace antiguo o nueva pestaña → crear evento nuevo). La API sigue persistiendo datos en disco para el flujo E2E; eso no implica UI de «mis eventos».

---

## Flujo piloto (orden de pantallas)

```
Marketing → Dashboard → (Config | Plano | Invitados | Preferencias | Mesas | Distribución)
```

Referencia backend E2E (sin plano): crear evento → mesas → preferencias → Excel → motor → confirmar.

---

## Mapa pantalla → API

### Marketing (pública)

| Pantalla Figma | Acción UI | API piloto | Notas |
|----------------|-----------|------------|-------|
| Landing | «Crear evento» / «Iniciar sesión» | — | Navegar a `/admin` (sin auth). Nota sticky: acceso directo piloto. |
| «Empezar gratis» | Idem | — | Post-piloto: registro real. |

---

### Admin — Dashboard

| Elemento UI | API | Método |
|-------------|-----|--------|
| Nombre evento, estado | `GET /events/{eventId}` | GET |
| Invitados total / sin asignar | `GET /events/{eventId}/guests?actorRole=admin` | GET → `total` |
| Mesas configuradas | `GET /events/{eventId}` | GET → `capacitySummary.tableCount` |
| Setup checklist | Componer desde: evento, plano confirmado, import, modo pref., mesas, distribución | Varios GET |
| «Calcular distribución» | `POST /events/{eventId}/distribution/run` | POST + header admin |
| Acceso rápido invitados | `GET /events/{eventId}/guests` | GET |

**Crear evento (entrada admin):** `POST /events` body `{ "name": "..." }` → redirect a `/admin/events/[id]`. Guardar `eventId` en `sessionStorage` (sesión de pestaña), **no** en `localStorage`.

**Sidebar admin:** logo + wordmark «taulamic» (clic → `/`); bloque **«Evento en curso»** (solo lectura, sin selector ni chevron); nav por secciones.

**Dashboard vacío:** KPIs en **0** hasta importar/configurar (sin datos demo precargados).

---

### Admin — Configuración del evento

| Campo Figma | Campo API | Estado |
|-------------|-----------|--------|
| Nombre del evento | `PUT /events/{eventId}` → `{ "name" }` | ✅ Implementado |
| Fecha, lugar, nº mesas, notas | — | ⚠️ Solo UI por ahora; no persisten en API piloto |

Botón **Guardar** → `PUT /events/{eventId}`.

---

### Admin — Plano

#### Subir plano

| Acción | API |
|--------|-----|
| Subir PDF/PNG/JPG | `POST /events/{eventId}/floor-plans` (multipart `file`) |
| Tras subida → detectar | `POST /events/{eventId}/floor-plans/{floorPlanId}/detect` |

Respuesta upload incluye `floorPlanId` — guardarlo para siguientes pasos.

#### Corregir plano

| Elemento UI | API |
|-------------|-----|
| Lista mesas detectadas | `GET /events/{eventId}/floor-plans/{floorPlanId}/draft` |
| Chip confianza alto/medio/bajo | Campo `tables[].confidence` (0–1): &gt;0.8 alto, 0.5–0.8 medio, &lt;0.5 bajo |
| Editar mesa | `PUT .../draft/tables/{tableId}` body `UpsertDraftTableDto` |
| Eliminar mesa | `DELETE .../draft/tables/{tableId}` |
| Añadir mesa manual | `POST .../draft/tables` |
| Vista previa asientos (mesa draft) | `GET .../draft/tables/{tableId}/seat-topology` |
| **Confirmar plano** | `POST .../draft/confirm` body `{ "confirmed": true }` |

Layout confirmado: `GET .../floor-plans/{floorPlanId}/confirmed`.

---

### Admin — Invitados (Excel)

#### Plantilla + import

| Acción | API |
|--------|-----|
| Descargar plantilla | `GET /events/{eventId}/guest-import/template` → blob `.xlsx` |
| Validar antes de importar (→ pantalla errores) | `POST /events/{eventId}/guest-import/validate` (multipart `file`) |
| Importar válidos | `POST /events/{eventId}/guest-import/import` (multipart `file`) |

#### Errores por fila

Mapear respuesta `GuestImportValidationResponseDto`:

| Columna UI | Campo API |
|------------|-----------|
| Fila | `errors[].row` |
| Campo | `errors[].field` |
| Error | `errors[].message` (+ `code` ej. XLS-002) |
| Resumen | `invalidRows`, `validRows`, `totalRows` |

**Continuar con válidos:** llamar `import` (importa solo filas válidas según backend).  
**Reintentar:** nueva subida + `validate`.

Lista invitados: `GET /events/{eventId}/guests?actorRole=admin`.

---

### Admin — Preferencias (modo evento)

| Elemento UI | API |
|-------------|-----|
| Cargar modo actual | `GET /events/{eventId}/preference-control-mode` → `mode`: `colaborativo` \| `anfitrion_exclusivo` |
| Guardar preferencias | `PUT /events/{eventId}/preference-control-mode` body `{ "mode": "..." }` + header admin |
| Texto permisos (opcional UI) | `GET .../preference-control-mode/permissions?actorRole=admin` |

Valores deben coincidir con radios del Figma (colaborativo / anfitrión exclusivo).

---

### Admin — Configurar mesa (evento, HU-29)

Dos vías en producto; Figma muestra forma + preview:

| Elemento UI | API |
|-------------|-----|
| Catálogo formas | `GET /events/{eventId}/table-shapes` |
| Preview asientos (forma + capacidad) | `GET /events/{eventId}/table-shapes/{shape}/seat-topology?capacity=8` |
| Añadir mesa al evento | `POST /events/{eventId}/tables` body `{ label, shape, estimatedCapacity }` |
| Editar mesa | `PUT /events/{eventId}/tables/{tableId}` |
| Eliminar mesa | `DELETE /events/{eventId}/tables/{tableId}` |

Formas API: `redonda`, `rectangular`, `oval` (ver enum `TABLE_SHAPES` en OpenAPI).

**Coordinación:** preview en Figma alineado con `seat-topology` (Ventana 1 #15).

---

### Admin — Distribución

| Estado UI | API |
|-----------|-----|
| Empty «Sin distribución calculada» | `GET /events/{eventId}/distribution` → 404 o sin propuesta |
| Botón **Calcular distribución** | `POST /events/{eventId}/distribution/run` + `x-taulamic-actor-role: admin` |
| Vista calculada (KPIs, mesas, invitados) | `GET /events/{eventId}/distribution` → `DistributionProposalDto` |
| Confirmar distribución | `POST /events/{eventId}/distribution/confirm` + header admin |

Campos clave respuesta:

| UI | API |
|----|-----|
| Afinidad / asignados | `stats.assignedCount`, `stats.unassignedCount` |
| Lista por mesa | Agrupar `placements[]` por `tableId` / `tableLabel` |
| Sin asignar | `unassignedGuestIds` |
| Motor | `motorVersion`: `"v0-pilot"` |
| Estado | `status`: `draft` → tras confirm `confirmed` |

Tras confirmar: evento pasa a `status: plan_approved` (`GET /events/{eventId}`).

---

## Sistema de diseño (implementación)

| Token Figma | Valor | CSS sugerido |
|-------------|-------|--------------|
| Primary | `#E86B4A` / `#EB6B4A` | Unificar a `#E86B4A` |
| Neutros | ver `design-tokens-mvp.md` | Variables CSS `--color-*` |
| Fuente | Inter | `font-family: Inter, sans-serif` |
| Radius botón | 12px | |
| Radius tarjeta admin | borde `#E8E8E8`, sin sombra | |
| Radius tarjeta marketing | 16px + sombra suave | |

Assets: `docs/ux/assets/taulamic-logo.png`, `taulamic-icon-bodas.png`.

Componentes Figma → React (sugerencia): shadcn/ui o componentes propios siguiendo página **Sistema** del Make.

---

## Rutas Next.js sugeridas (piloto)

| Ruta | Pantalla Make |
|------|---------------|
| `/` | Marketing landing (`app/(marketing)/page.tsx`) |
| `/admin` | Entrada admin: **crea evento nuevo** → redirect `/admin/events/[id]` (fallback `/admin/events/new` si falla API) |
| `/admin/events/new` | Crear evento → redirect dashboard |
| `/admin/events/[id]` | Dashboard del evento |
| `/admin/events/[id]/config` | Configuración |
| `/admin/events/[id]/floor-plan` | Subir + corregir plano |
| `/admin/events/[id]/guests` | Import Excel + errores |
| `/admin/events/[id]/guests/errors` | Errores de importación Excel |
| `/admin/events/[id]/preferences` | Modo preferencias |
| `/admin/events/[id]/tables` | Configurar mesa |
| `/admin/events/[id]/distribution` | Distribución |

Sidebar común: enlaces según nav del Make (`adminRoutes` en `apps/web/src/lib/routes.ts`).

### Implementación actual (`apps/web`)

Rutas alineadas con la tabla anterior. Estructura App Router: `(marketing)/` (grupo de ruta → `/`), `admin/`, `sistema/`. El `eventId` va en la URL. **`sessionStorage`** (`taulamic:sessionEventId`) valida la sesión de pestaña; **no** hay restauración del último evento vía `localStorage`. Meta UI (fecha, lugar, nº mesas) en `localStorage` por `eventId` solo para campos no expuestos aún en API.

---

## Fuera de alcance piloto (no implementar aún)

- Registro / login / JWT
- **Lista de eventos / cargar proyecto guardado de un usuario** (post-piloto con auth)
- RSVP invitado
- Comparador Top-K
- Documentos salón/cocina
- Campos extra config evento (fecha, lugar) hasta ampliar API

---

## Checklist Ventana 1

- [x] Leer este doc + abrir Figma Make
- [x] Configurar cliente API contra `/api/v1` (rewrite Next.js)
- [x] Implementar layout admin (sidebar + header)
- [ ] Flujo piloto según `pilot-flow.e2e-spec.ts` (validar manualmente en UI)
- [x] Aplicar tokens de `design-tokens-mvp.md`
- [ ] Pantalla **Corregir plano** completa
- [ ] Probar con API local: `cd apps/api && npm run start:dev`
