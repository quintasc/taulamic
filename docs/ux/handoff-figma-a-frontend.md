# Handoff Figma Make → Frontend admin (Ventana 1)

Documento de traspaso UX → implementación UI. Issue #7 cerrada (PR #37).

> **Patrones UX/UI obligatorios:** `docs/ux/guia-estilo-taulamic.md` (canónica). Este handoff detalla pantallas y API; no sustituye la guía de estilo.

| Recurso | Enlace |
|---------|--------|
| **Guía de estilo (canónica)** | `guia-estilo-taulamic.md` |
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
Marketing → Dashboard → (Config → Invitados → Tarjetas → Plano → Mesas → Afinidades → Distribución)
```

Referencia backend E2E (sin plano): crear evento → mesas → preferencias → Excel → motor → confirmar.

---

## Navegación setup + feedback (jun 2026)

> Resumen operativo. **Especificación normativa:** `guia-estilo-taulamic.md` §6–§7.

Componente: `SetupNavBar` (`apps/web/src/components/admin/setup-nav-bar.tsx`). Orden de pasos: `setup-flow.ts` (ADR-018). Tras Distribución → **Siguiente: Dashboard**.

### Patrón sin botón «Guardar»

| Paso | Persistencia | «Siguiente» |
|------|--------------|-------------|
| Config | Auto-save debounced (500 ms) + flush en `onBeforeNext` | Bloqueado sin nombre válido |
| Invitados | Alta/import en contenido | Bloqueado con 0 invitados |
| Plano | Auto-save local + API (600 ms) | Activo tras hidratar |
| Mesas | «Añadir mesa» | Bloqueado con 0 mesas |
| Afinidades | Toggle reglas → `localStorage` (instantáneo) | Siempre activo |
| Distribución | Motor en pantalla | Siempre activo (`hidePrimary`) |

### Validación visible (prioridad alta — implementado)

Cuando `nextReady={false}`, la barra de navegación muestra un **banner rojo** (`Alert` error) con `nextDisabledHint` por paso. El botón «Siguiente» deshabilitado sigue siendo clicable: hace scroll al aviso y lo resalta brevemente (móvil: barra sticky inferior).

| Paso | `nextDisabledHint` |
|------|-------------------|
| Config | Indica el nombre del evento para continuar |
| Invitados | Añade al menos un invitado para continuar |
| Mesas | Añade al menos una mesa para continuar |
| Plano (carga) | Espera a que cargue el plano del salón |

### Toast / feedback de acciones (prioridad media — implementado)

`ToastProvider` + `useToast()` en `components/ui/toast.tsx`, montado en `app/providers.tsx`.

| Superficie | Acciones con toast |
|------------|-------------------|
| Invitados | Añadir, actualizar, eliminar, import Excel, descargar plantilla (+ errores) |
| Mesas | Añadir (1 o N), renombrar etiqueta, eliminar (+ errores de validación) |

Comportamiento: aparece arriba al centro, autodismiss ~4 s, cierre manual con ✕. Variantes `success` / `error` / `info` (mismos tokens que `Alert`).

### Indicador auto-guardado (prioridad baja — implementado)

`SaveStatusIndicator` + `useAutoSaveIndicator()` en `components/ui/save-status-indicator.tsx`. Slot `saveStatus` en `PageHeader`.

| Pantalla | Estados |
|----------|---------|
| Config | «Guardando…» durante debounce/API · «Guardado automáticamente» ~3 s tras éxito |
| Plano | Idem al sincronizar forma/medidas/accesorios (debounce 600 ms) |
| Afinidades | «Guardado automáticamente» al activar/desactivar reglas genéricas (local, instantáneo) |

Errores de guardado siguen en `Alert` rojo bajo el header; el indicador vuelve a ocultarse.

---

## Responsive y móvil invitado (`ADR-019`)

| Superficie | Viewport prioritario | Piloto |
|------------|---------------------|--------|
| Marketing | Desktop + móvil | Implementado |
| Admin organizador | Desktop-first (≥ 1024 px); degradar en tablet | Grids/listas `sm:`/`lg:`; sidebar fija |
| Portal invitado / RSVP | **Mobile-first (390 px)** | No operativo; mock RSVP en lista invitados |

**Modo colaborativo:** los invitados interactuarán desde **móvil** (enlace en correo). Al diseñar en Figma o implementar:

- Frames **390 × 844** para RSVP, afinidades invitado y «mi mesa».
- Controles táctiles ≥ **44 px**; formularios una columna; sin acciones solo-hover.
- Reutilizar primitivos (`ui/`) entre admin mock y portal futuro.

Detalle: `docs/adr/ADR-019-responsive-y-mobile-invitado.md` · `frontend-component-system.md` §5.

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

#### Propuesta v2 — KPIs dashboard (feedback validación manual, jun 2026)

**Objetivo UX:** eliminar ambigüedad del `2/2` mesas (meta local vs API) y alinear invitados/mesas con datos reales de backend.

##### Tarjeta **Invitados** (cambio)

| Campo | Especificación |
|-------|----------------|
| **Valor principal** | Total invitados importados (`GET .../guests` → `total`) |
| **Subtexto** | Según estado (ver tabla) |
| **Barra de progreso** | % de invitados **asignados** tras calcular distribución; color según % |

| Estado | Subtexto | Barra |
|--------|----------|-------|
| Sin invitados (`total = 0`) | «Importa desde Excel» | Sin barra o 0% |
| Con invitados, **sin** distribución calculada | «Sin distribución» o «Pendiente de calcular» | 0% o oculta |
| Distribución con **todos asignados** (`unassigned = 0`) | «Todos asignados» | 100%, color **success** (verde) |
| Distribución **parcial** (`unassigned > 0`) | «X de Y asignados» o «Z% asignados · N sin asignar» | % asignados; color **warning** (naranja) si &lt; 100% |

**Datos:** `assigned = total - unassigned` desde `GET .../distribution` → `stats` (si 404, tratar como sin distribución).

##### Tarjeta **Mesas** (cambio)

| Campo | Especificación |
|-------|----------------|
| **Valor principal** | Número de mesas **configuradas en API** (`capacitySummary.tableCount`) — sin fracción `2/2` ni meta de Configuración |
| **Segunda línea o subtexto principal** | Capacidad total: «**N plazas**» (`capacitySummary.totalCapacity`) |
| **Subtexto comparativo** | Balance plazas vs invitados totales |

| Condición (plazas vs invitados) | Subtexto sugerido |
|--------------------------------|-------------------|
| Sin mesas | «Añade mesas en Mesas» |
| Sin invitados | Solo «N plazas» (sin comparar) |
| `plazas > invitados` | «Sobran X plazas» (X = plazas − invitados) |
| `plazas < invitados` | «Faltan X plazas» |
| `plazas = invitados` (y ambos &gt; 0) | «Capacidad cubierta» o «Plazas justas» |

**Eliminar en UI:** denominador «objetivo» del campo «Nº de mesas» en Configuración (`localStorage` / `tableTarget`) en esta tarjeta. Ese dato puede seguir en Config como nota del organizador, pero **no** en el KPI Mesas.

**Barra de progreso:** opcional en Mesas (usuario no la menciona); si se mantiene, podría ser % ocupación potencial (invitados/plazas) — **pendiente decidir**; por defecto propuesta: **sin barra** en Mesas, solo valor + plazas + subtexto sobran/faltan.

##### Sin cambio (según feedback)

- **Afinidad media** — estructura igual; valor piloto con copy **«No calculado en piloto»** (ver decisión §3 post-validación)
- **Setup** — igual que hoy (% + pasos checklist)

##### Diferencias respecto implementación actual

| Actual | Propuesto v2 |
|--------|--------------|
| Mesas `2/2` + «2 configuradas» | `2` mesas + «12 plazas» + sobran/faltan |
| Invitados hint binario | Subtextos por caso + barra coloreada por % asignación |
| `tableTarget` desde Config en KPI Mesas | Solo datos API (`capacitySummary`) |

**Estado:** pendiente de implementación (W6).

---

### Admin — Configuración del evento

| Campo Figma | Campo API | Estado |
|-------------|-----------|--------|
| Nombre del evento | `PUT /events/{eventId}` → `{ "name" }` | ✅ Implementado |
| Fecha, lugar, invitados aprox., notas | — | ⚠️ Solo UI (`localStorage`); no persisten en API piloto |
| Modo preferencias | `PUT .../preference-control-mode` | 🟡 Piloto: solo **anfitrión exclusivo** (colaborativo deshabilitado UI) |

Botón **Guardar** → `PUT /events/{eventId}` + `PUT .../preference-control-mode` con `anfitrion_exclusivo`.

---

### Admin — Plano

> **Visión producto (jun 2026):** el plano **no** configura mesas por detección IA. Define el **espacio del salón** (forma, medidas, fondo opcional, accesorios). La colocación de **mesas calculadas** en el canvas es una **fase posterior** (tras Distribución). Ver § Plano del salón (Figma Make) y § decisiones §5.

#### Plano del salón — diseño Figma Make (jun 2026)

**Referencia:** captura Make «Plano del salón» + badge **PILOTO JUL**.

**Layout (desktop ~1280px):**

| Zona | Contenido |
|------|-----------|
| **Header** | Título «Plano del salón» + badge piloto · CTA primario **Guardar y continuar** (derecha) |
| **Canvas central** | Área principal de trabajo; línea guía discontinua horizontal (grid/perímetro) |
| **Sidebar derecha** | Paneles apilados; **sección «Configuración del salón» plegable** para maximizar vista del canvas |

##### Canvas — estados

**Vacío / inicial (captura):**

- Icono upload + «Sube el plano o define la forma»
- Hint: «PDF, PNG o JPG · Máx. 20 MB»
- Botón **Seleccionar archivo** (coral)
- Alternativa: definir forma solo con controles de la sidebar (sin archivo)

**Con forma definida:**

- **Preview de la forma del salón** (rectángulo, cuadrado, círculo, óvalo según selección)
- **Tiradores en esquinas** (handles) para redimensionar la forma en el canvas
- Escala coherente con **Ancho / Largo (m)** de la sidebar (sincronización bidireccional UI)
- Si hay fondo subido: imagen/PDF como capa bajo la forma (ver Fondo inteligente)

##### Sidebar derecha — bloques

**1. Configuración del salón** *(plegable / desplegable)*

| Control | Especificación |
|---------|----------------|
| Forma | Pills: **Rectangular** · Cuadrada · Redonda · Ovalada (una activa, borde coral) |
| Medidas | Inputs numéricos **Ancho (m)** y **Largo (m)** (ej. 10 × 10) |
| Plegado | Chevron o «Ocultar configuración» → colapsa bloque; canvas ocupa más ancho |

**2. Fondo inteligente**

- Botón secundario: **Subir plano o foto (IA)**
- Copy: «Sube la foto del salón y la IA detectará el espacio automáticamente»
- **Nota producto:** IA aquí detecta **contorno/espacio del salón** como fondo, **no** mesas individuales (alineado con cambio de visión §5)
- Formatos: PDF, PNG, JPG (máx. 20 MB)

**3. Accesorios** *(arrastrables al canvas)*

- Tarjetas con icono + etiqueta; el usuario **arrastra** al canvas
- Ejemplos en mockup: **Mesa novios**, **Pista baile**
- **Iconografía:** los iconos del ejemplo Make **no** son definitivos — rediseñar en estilo wireframe admin (línea simple, coherente con nav icons; sin emoji/clipart)

*Lista accesorios ampliable post-piloto: barra, escenario, entradas, etc.*

##### Acciones

| Acción | Comportamiento |
|--------|----------------|
| **Guardar y continuar** | Persiste layout del salón (forma, medidas, fondo, posiciones accesorios) y navega al siguiente paso del setup |
| **Seleccionar archivo** (canvas) | Atajo al upload de fondo |

##### Fase 2 — Posicionar mesas en plano (post-distribución)

**Referencia:** captura Make «Plano del salón» jun 2026 (borrador — priorizar spec). Acceso desde **Ver en plano** en Distribución o nav Plano tras cálculo.

| Zona | Contenido |
|------|-----------|
| **Header** | «Plano del salón» · subtítulo: *«Arrastra las mesas para posicionarlas. Las formas reflejan la distribución calculada.»* |
| **Acciones header** | **Restablecer** (secundario) · **Guardar posiciones** (primario coral) |
| **Canvas** | Perímetro salón (borde discontinuo); zonas fijas etiquetadas: **ESCENARIO**, **PISTA DE BAILE**, **ENTRADA**, **BAR** |
| **Mesas en canvas** | Formas según tipo (círculo, rectángulo, óvalo); etiqueta **M1…** + ocupación **8/8**, **7/8**… |
| **Color mesa** | Borde/texto **verde** = Llena · **ámbar** = En uso · **gris** = Vacía (coherente con lista Distribución) |
| **Interacción** | Drag & drop libre de cada mesa sobre el canvas |
| **Panel derecho** | Ver § abajo |

**Panel derecho — RESUMEN + leyenda**

| Bloque | Contenido |
|--------|-----------|
| **RESUMEN** | Contadores: Llenas `N` · En uso `N` · Vacías `N` (dots verde/ámbar/gris) |
| Ayuda | «Haz clic en una mesa para ver sus detalles» (panel detalle mesa — Figma pendiente) |
| **FORMAS** | Leyenda: Redonda · Rectangular · Ovalada (iconos línea simple) |

**Relación con Fase A:** el canvas reutiliza el espacio definido en configuración inicial (forma, fondo, accesorios como PISTA DE BAILE). Las **mesas** vienen de la distribución calculada, no de detección IA.

**API:** posiciones `(x, y, rotation)` por mesa — **sin endpoint** piloto; diseñar post-MVP.

---

| Capacidad diseño | API piloto existente |
|------------------|----------------------|
| Subir PDF/PNG/JPG | `POST .../floor-plans` + `detect` (orientado a mesas — **desalineado** con nueva visión) |
| Forma salón + medidas + accesorios | **Sin API** — requiere modelo nuevo |
| Guardar layout salón | **Sin endpoint** — diseñar en ADR/post-piloto |

**Implementación código julio:** pantalla **Plano Fase A** (`floor-plan-setup`) y **Fase B** (`floor-plan/layout`) en `main` (`0f15b37`). «Corregir plano» (draft mesas) **suspendido** — `ADR-016`.

---

#### Plano — flujo legacy (suspendido)

<details>
<summary>Subir plano + Corregir mesas detectadas (SDD-01D original — no implementar en nueva visión)</summary>

##### Subir plano

| Acción | API |
|--------|-----|
| Subir PDF/PNG/JPG | `POST /events/{eventId}/floor-plans` (multipart `file`) |
| Tras subida → detectar | `POST /events/{eventId}/floor-plans/{floorPlanId}/detect` |

##### Corregir plano

| Elemento UI | API |
|-------------|-----|
| Lista mesas detectadas | `GET .../draft` |
| Confirmar plano | `POST .../draft/confirm` |

</details>

---

### Admin — Invitados (Excel)

> **Evolución post-piloto (jun 2026):** rediseño panel logístico v2 — drawer lateral, tabla completa, bulk action bar. Ver **`docs/ux/spec-invitados-panel-v2-post-piloto.md`**. Separación estricta: **Invitados** = datos de contacto/logística; **Afinidades** = motor de reglas (ADR-018).

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

### Admin — Configuración (modo preferencias)

| Elemento UI | API |
|-------------|-----|
| Cargar modo actual | `GET /events/{eventId}/preference-control-mode` → `mode`: `colaborativo` \| `anfitrion_exclusivo` |
| Guardar al guardar config | `PUT /events/{eventId}/preference-control-mode` body `{ "mode": "anfitrion_exclusivo" }` + header admin |
| Texto permisos (opcional UI) | `GET .../preference-control-mode/permissions?actorRole=admin` |

**Piloto julio:** solo **anfitrión exclusivo** seleccionable. Opción colaborativo visible deshabilitada (`PILOT_COLLABORATIVE_MODE_ENABLED = false` en `pilot-features.ts`). La API sigue aceptando ambos modos para E2E.

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

#### Propuesta v2 — vista calculada (feedback validación manual, jun 2026)

**Referencias visuales:**

| Fuente | Notas |
|--------|-------|
| Capturas validación manual + Make (jun 2026) | Lista tabular + filtros; sustituye acordeón actual |
| **Make borrador distribución** (jun 2026) | **Referencia aproximada** — el usuario indica que *no ha quedado bien* en Make; priorizar esta spec escrita sobre píxeles del mockup |

**Objetivo UX:** mostrar **todas las mesas del evento** (ocupadas y vacías), con estados claros y métricas que no confundan invitados / mesas / plazas.

##### Cabecera

| Elemento | Especificación |
|----------|----------------|
| Título | Distribución |
| Subtítulo | Asigna invitados a las mesas por afinidad |
| Acción | Botón secundario **Recalcular** (icono refresh) — texto corto, no «Recalcular distribución» |

##### KPIs (4 tarjetas)

| KPI | Ejemplo mockup | Origen datos (implementación) |
|-----|----------------|------------------------------|
| **Afinidad media** | 82% (verde) | API score cuando exista; piloto: **«No calculado en piloto»** o tooltip equivalente — no presentar como dato real |
| **Total invitados** | 84 | Total importados del evento (`GET .../guests` → `total`) |
| **Sin asignar** | 0 (verde si 0) | `stats.unassignedCount` |
| **Plazas libres** | 14 | `stats.totalCapacity - stats.assignedCount` (o suma capacidades mesas − asignados) |

> Nota: sustituye el KPI actual «Mesas» (que contaba solo mesas con invitados) por **Plazas libres**, más accionable tras calcular.

##### Barra de filtros y búsqueda

Fila bajo KPIs:

| Control | Comportamiento |
|---------|----------------|
| **Todas** `N` | Filtro activo por defecto; muestra las N mesas del evento |
| **Llenas** `N` | `asignados === capacidad` y capacidad > 0 |
| **En uso** `N` | `0 < asignados < capacidad` |
| **Vacías** `N` | `asignados === 0` |
| **Buscar mesa…** | Filtra por `tableLabel` / id (texto) |
| Contador derecha | «12 mesas» = total mesas configuradas (`event.tables.length`) |

Chips con estado activo (fondo oscuro) y contador en cada chip.

##### Lista tabular de mesas (sustituye acordeón)

Cabeceras de columna: **MESA** · **FORMA** · **CAPACIDAD** · **AFINIDAD**

Cada fila = una mesa de `GET /events/{eventId}` enriquecida con agrupación de `placements[]`:

| Columna | Contenido |
|---------|-----------|
| **MESA** | Punto de estado (verde/naranja/gris) + código corto (M1, M2… o `tableLabel`) + chip de estado |
| **FORMA** | Redonda / Rectangular / Ovalada (`event.tables[].shape`) |
| **CAPACIDAD** | Barra de progreso + `asignados / capacidad` (ej. 8/8 verde, 7/8 naranja) |
| **AFINIDAD** | % por mesa (verde); piloto: estimación hasta API |
| Acción | Chevron abajo/arriba — expande **detalle inline** bajo la fila (ver abajo) |

**Chips de estado por mesa:**

| Estado | Condición | Estilo mockup |
|--------|-----------|---------------|
| **Llena** | asignados = capacidad | Chip verde |
| **En uso · X libre(s)** | 0 < asignados < capacidad | Chip naranja/ámbar; X = capacidad − asignados (Make usa «2 libres») |
| **Vacía** | asignados = 0 | Punto gris + chip «Vacía»; barra capacidad vacía; afinidad **—** (guión, no %) |

**Regla clave:** mesas sin invitados **siguen visibles** en la lista (resuelve confusión de validación: «desapareció la segunda mesa»).

##### Detalle expandible — invitados por mesa (captura jun 2026)

Al pulsar la fila (o el chevron), se despliega un **panel inline** bajo la cabecera de la mesa, sin cambiar de pantalla.

**Fila colapsada**

- Chevron apuntando a la **derecha** (▸).
- Misma fila resumen: MESA · FORMA · CAPACIDAD · AFINIDAD.

**Fila expandida** (ej. M1)

- Chevron apuntando **abajo** (▾).
- Se mantiene visible la fila resumen completa (M1, chip «Llena», Redonda, barra 8/8, 91%).
- Debajo, bloque con fondo/blanco separado por borde superior sutil.
- **Pills de invitados** en `flex-wrap` (varias filas si hace falta): nombres completos en cápsulas redondeadas (estilo `GuestPill` actual).
- Orden: el de `placements[]` agrupados por `tableId` (orden alfabético o orden de asignación; definir en implementación).
- Cantidad de pills = asignados en esa mesa (ej. 8 pills para 8/8).

**Mesa vacía expandida**

- Sin pills; texto secundario: «Sin invitados asignados» (o no expandible si vacía — preferir expandible con mensaje para coherencia).

**Comportamiento**

- Un solo acordeón abierto a la vez (opcional: permitir varios; mockup muestra uno — **recomendado: uno**).
- Clic en otra fila cierra la anterior y abre la nueva.
- Filtros/búsqueda siguen aplicando; filas ocultas no expanden.

**Datos:** `placements[]` filtrados por `tableId`; `guestName` en cada pill.

##### Pie de página

| Elemento | Especificación |
|----------|----------------|
| Nota izquierda | «Comparador Top-K — disponible post-piloto» |
| **Ver en plano** | Botón secundario con icono mapa — navega a **Fase B** (posicionar mesas en canvas) |
| **Confirmar distribución** | Botón primario coral (texto corto en Make: «Confirmar distribución»; spec previa: «…para el evento» — unificar en implementación) |

##### Referencia Make — lista inferior (borrador)

Ejemplos de filas en mockup imperfecto: M9 En uso 8/10 71%, M10 Llena 8/8 93%, M11 En uso 5/6 80%, M12 Vacía 0/8 —. Confirma estados y mesas vacías visibles; **no** tomar % afinidad como definitivos (piloto).

##### Diferencias respecto implementación actual (`components/admin/distribution/`)

| Actual (piloto) | Propuesto v2 |
|-----------------|--------------|
| Acordeón solo mesas con `placements` | Tabla con **todas** las mesas del evento |
| KPI «Mesas» = mesas usadas | KPI **Plazas libres** |
| KPI «Invitados» sin calificador | **Total invitados** |
| Sin filtros ni búsqueda | Chips Todas / Llenas / En uso / Vacías + buscar |
| Capacidad en texto en header acordeón | Barra de progreso en columna CAPACIDAD |
| Acordeón independiente por mesa | **Fila tabla + panel inline** expandible (pills invitados) |

**Estado:** pendiente de implementación (anotado tras validación manual W6).

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

Componentes Figma → React: componentes propios en capas (`ui/` → dominio → `app/`). Ver `docs/ux/frontend-component-system.md` y **ADR-017**.

### Sistema de componentes (jun 2026)

| Capa | Ruta código | Reutilización |
|------|-------------|---------------|
| Marca / tema | `src/theme/brand.config.ts` | Rutas PNG, nombre producto; theming completo post-MVP |
| Primitivos | `components/ui/` | Alert, PageHeader, StatCard… |
| Dominio | `admin/`, `marketing/`, `tables/`, `brand/` | Pantallas compuestas |
| Páginas | `app/` | Solo routing y datos |

Cambiar logo PNG: `public/` + `brand.config.ts`. Cambiar colores/tipografía sin tocar pantallas: planificado post-piloto (paquetes CSS en `:root`).

---

## Rutas Next.js sugeridas (piloto)

| Ruta | Pantalla Make |
|------|---------------|
| `/` | Marketing landing (`app/(marketing)/page.tsx`) |
| `/admin` | Entrada admin: **crea evento nuevo** → redirect `/admin/events/[id]` (fallback `/admin/events/new` si falla API) |
| `/admin/events/new` | Crear evento → redirect dashboard |
| `/admin/events/[id]` | Dashboard del evento |
| `/admin/events/[id]/config` | Configuración |
| `/admin/events/[id]/floor-plan` | Plano del salón — Fase A (forma + medidas) |
| `/admin/events/[id]/floor-plan/layout` | Ver en plano — Fase B (mesas + invitados al clic) |
| `/admin/events/[id]/guests` | Import Excel + errores |
| `/admin/events/[id]/guests/errors` | Errores de importación Excel |
| `/admin/events/[id]/preferences` | Modo preferencias |
| `/admin/events/[id]/tables` | Configurar mesa |
| `/admin/events/[id]/distribution` | Distribución |

Sidebar común: enlaces según nav del Make (`adminRoutes` en `apps/web/src/lib/routes.ts`).

### Implementación actual (`apps/web`)

Rutas alineadas con la tabla anterior. Estructura App Router: `(marketing)/` (grupo de ruta → `/`), `admin/`, `sistema/`. El `eventId` va en la URL.

**Componentes (`apps/web/src/components/`):** módulos por dominio — `ui/`, `marketing/`, `admin/`, `brand/`, `tables/`; páginas en `app/` son finas (solo routing). Lógica de dashboard en `hooks/use-event-dashboard.ts`; nav admin en `lib/admin-nav.ts`. **`sessionStorage`** (`taulamic:sessionEventId`) valida la sesión de pestaña; **no** hay restauración del último evento vía `localStorage`. Meta UI (fecha, lugar, nº mesas) en `localStorage` por `eventId` solo para campos no expuestos aún en API.

---

## Decisiones y backlog UX — post-validación manual (jun 2026)

Registro de respuestas del producto y peticiones nuevas. **No implementado** salvo indicación; algunos puntos requieren **aprobación SDD/ADR** antes de cambiar alcance funcional.

### Respuestas a preguntas abiertas (validación manual)

| # | Tema | Decisión producto |
|---|------|-------------------|
| 1 | **Distribución — listado mesas** | ✅ Cubierto en **Propuesta v2 Distribución** (tabla + filtros + todas las mesas) |
| 2 | **Motor v0 — reparto entre mesas** | ✅ Aceptado: en v1 priorizar **ocupabilidad** (rellenar mesas); no exigir reparto equitativo entre mesas vacías |
| 3 | **Afinidad % en UI** | Mostrar etiqueta honesta: **«No calculado en piloto»** / «Estimación visual» en dashboard y distribución hasta que la API exponga score real. No presentar 82% como dato real. |
| 4 | **Excel `preferencia_control`** | **No debe ir en plantilla** para el organizador: es dato de **evento** (pantalla Preferencias), no por invitado. Ver § conflicto SDD abajo. |
| 5 | **Propósito del plano** | **Cambio de visión importante** — ver § Plano espacial (post-MVP). |

### 5 — Plano: nuevo propósito (cambio respecto SDD-01D / EP-11)

**Antes (SDD / piloto actual):** subir plano → detectar mesas → corregir → confirmar configuración de mesas.

**Nuevo (decisión producto jun 2026) — dos fases:**

| Fase | Pantalla | Qué hace |
|------|----------|----------|
| **A — Plano del salón** | Figma Make entregado jun 2026 | Canvas con forma del salón (tiradores), medidas, fondo IA opcional, accesorios arrastrables; sidebar plegable |
| **B — Posicionar mesas** | Figma pendiente | Tras distribución: mesas calculadas sobre el canvas, drag-drop |

- El plano **no** sirve para inferir tipo/número de mesas en salones grandes.
- **Fondo inteligente:** IA detecta **espacio/contorno** del salón, no lista de mesas.
- **Accesorios:** iconos del ejemplo Make a **rediseñar** (wireframe, no clipart).

**Gobernanza:** `ADR-016` (2026-06-23) formaliza este cambio; `SDD-01D` y `SDD-01` (Flujo G, HU-12) actualizados. EP-11 API legacy sin UI principal.

**Handoff detallado:** § Admin — Plano → «Plano del salón — diseño Figma Make».

### 4 — Plantilla Excel sin `preferencia_control`

**Argumento producto:** el modo colaborativo / anfitrión exclusivo es único por evento (`PUT .../preference-control-mode`); no puede variar por fila de invitado en uso normal.

**Conflicto documental:** `docs/product/especificacion-plantilla-excel-v1.md` incluye la columna como override opcional.

**Acción propuesta (pendiente aprobación):**

- Plantilla piloto **simplificada** sin `preferencia_control`.
- Modo solo en pantalla **Preferencias**.
- Actualizar especificación Excel v1 y generador de plantilla API cuando se apruebe.

### 6 — Bloquear invitados (excluir del cálculo óptimo)

**¿Está en especificaciones iniciales?**

- **Sí, a nivel de regla dura:** `SDD-01` §7.1 — *«Respetar bloqueos manuales definidos por admin.»*
- **HU-05** cubre ajuste manual (mover invitados); **no hay HU dedicada** con UI de «bloquear / no asignar» ni API piloto implementada.

**Petición producto:** el organizador puede **bloquear** invitados para que el motor no los asigne; desbloquear o colocar **manualmente** cuando quiera.

**Estado:** alineado con SDD en espíritu; **falta** especificar HU, API, persistencia (`guest.blockedFromAssignment` o similar) y UI. **Post-piloto** salvo priorización explícita.

### 7 — Edición manual en detalle de mesa (distribución)

**Documento canónico post-piloto:** `docs/sdd/SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`

**Petición (nueva explícita en sesión):**

- En pills de invitados expandidos: icono **✕** para **quitar** de esa mesa (pasa a sin asignar o lista pendiente).
- En cada fila de mesa: control **+** / «Añadir invitado» para asignar alguien de la bolsa sin asignar.

**Relación SDD:** extensión natural de **HU-05** (ajuste manual). No implementado en piloto UI/API. Especificación: enmienda HU-05 (RF-HU05-01…06, criterios aceptación, API borrador).

**Dependencias:** estado de asignación editable antes de confirmar; validar reglas duras al mover; auditoría (SDD HU-05); sincronización KPIs (RF-HU05-04).

### 8 — Lista de invitados sin asignar (clic en KPI)

**Petición (nueva):**

- En **Dashboard** o **Distribución**, al pulsar KPI / enlace **«Sin asignar»** (o N &gt; 0) → mostrar lista de invitados no asignados (diseño Figma pendiente).

**Datos:** `unassignedGuestIds` + nombres desde `GET .../guests` o `placements` inverso.

**Estado:** anotado; Figma por entregar; encaja con distribución v2.

### Resumen priorización sugerida

| Prioridad | Item | MVP julio piloto |
|-----------|------|------------------|
| Alta | Distribución v2 + detalle pills | Sí — en `main` (PR #39 + iteraciones) |
| Alta | Dashboard KPIs v2 | Sí |
| Alta | Afinidad «no calculado en piloto» | Sí (copy UI) |
| Media | Excel sin `preferencia_control` | Sí — plantilla piloto sin columna (jun 2026) |
| Media | Lista sin asignar (clic KPI) | Tras Figma |
| Baja / post-MVP | Plano Fase B drag-drop **mesas** + fondo IA | No (ADR-016) |
| Baja / post-piloto | Panel Invitados v2 (drawer, bulk bar, Maps) | No — ver spec-invitados-panel-v2 |
| Baja / post-piloto | HU-05: ✕/+ desasignar/asignar + KPIs | No — ver enmienda HU-05 Fase 1 |
| Baja / post-piloto | HU-05: drag invitado entre mesas | No — enmienda HU-05 Fase 2 |
| Baja / post-MVP | Bloqueo invitados (handoff §6) | No |

---

## Fuera de alcance piloto (no implementar aún)

- Registro / login / JWT
- **Lista de eventos / cargar proyecto guardado de un usuario** (post-piloto con auth)
- RSVP invitado
- Comparador Top-K
- Documentos salón/cocina
- Campos extra config evento (fecha, lugar) hasta ampliar API
- **Plano espacial Fase A/B básico** — en piloto (`0f15b37`): forma/medidas + ver mesas e invitados al clic
- **Plano espacial avanzado** (fondo IA, accesorios drag, drag-drop posiciones) — post-MVP; Figma pendiente
- **Corregir plano / autodetección mesas** como camino principal — sustituido por `ADR-016` (2026-06-23)
- **Bloqueo de invitados** — post-piloto (handoff §6; SDD §7.1)
- **Edición manual HU-05** (✕/+, drag invitado, KPIs) — post-piloto; **`SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`**

---

## Checklist Ventana 1

- [x] Leer este doc + abrir Figma Make
- [x] Configurar cliente API contra `/api/v1` (rewrite Next.js)
- [x] Implementar layout admin (sidebar + header)
- [x] Pantalla **Distribución calculada** (KPIs, acordeón mesas, confirmar)
- [ ] Flujo piloto según `docs/agile/guion-validacion-piloto-ui.md` (validar manualmente en UI)
- [x] Aplicar tokens de `design-tokens-mvp.md`
- [x] Pantalla **Plano Fase A/B** — Fase A forma/medidas; Fase B ver mesas + invitados al clic (`0f15b37`, `ADR-016`)
- [x] ~~Pantalla **Corregir plano**~~ — **suspendida** (legacy EP-11; no implementar — `ADR-016`)
- [x] Probar con API local (`apps/api` + `apps/web` en :3000 / :3001)
