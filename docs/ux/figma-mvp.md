# Figma MVP — issue #7

- Estado: **Cerrado** (PR #37 mergeado 2026-06-21)
- Rama: `feat/7-figma-mvp`
- Referencia SDD: `docs/sdd/SDD-01A-figma-ui-ux.md`
- Design tokens: `docs/ux/design-tokens-mvp.md`
- **Empezar de cero:** `docs/ux/figma-setup-desde-cero.md`
- **Prompts Make (completar diseño):** `docs/ux/figma-make-prompts.md`
- **Contexto único para Figma Make (enlace IA):** `docs/ux/figma-make-contexto-proyecto.md`
- **Handoff → Frontend (Ventana 1):** `docs/ux/handoff-figma-a-frontend.md`
- **Logos / iconos:** `docs/ux/assets/` (ver tabla abajo)

### Assets de marca

| Archivo | Uso |
|---------|-----|
| `taulamic-logo.png` | Isotipo principal (red de nodos) |
| `taulamic-icon-bodas.png` | Icono vertical «Bodas y celebraciones» (landing, tarjeta piloto) |

## Archivo Figma

| Campo | Valor |
|-------|--------|
| URL | [MVP Taulamic App Design](https://www.figma.com/make/SanoIvjqWYghT7bXfNVpxj/MVP-Taulamic-App-Design?t=95kTMsKGpTjDmpBI-1) |
| Herramienta | **Figma Make** (sustituye archivo Design anterior) |
| Equipo / proyecto | Taulamic |
| Ultima revision | 2026-06-21 (prompts 1–7 aplicados en Make) |

### Estructura de 3 páginas

| Página Figma | Contenido |
|--------------|-----------|
| **1 — Sistema** | Cover, componentes, variables |
| **2 — Marketing** | Landing |
| **3 — Admin** | Mapa nav + wireframes + prototipo |

### Sesion 1

Seguir `figma-setup-desde-cero.md`. Al terminar: pegar URL arriba y marcar abajo lo completado.

## Acceso y alta de usuario (piloto julio)

**Decision:** opcion A — sin pantallas de registro/login en Figma piloto.

| Elemento | Piloto julio | Post-piloto |
|----------|--------------|-------------|
| Registro / crear cuenta | No disenar | Auth JWT/RBAC (DECISION-002) |
| Login / recuperar password | No disenar | Idem |
| CTAs landing («Iniciar sesion», «Crear evento», «Empezar gratis») | **Si** — se mantienen en Marketing | Enlazaran al flujo real de auth |

**Nota para Figma Make:** anadir en Marketing (sticky note o texto pequeno junto a CTAs):

> Piloto julio: acceso directo al panel organizador (admin unico). Registro y auth completo — post-julio 2026.

Referencia: `docs/agile/DECISION-002-mvp-julio-piloto-funcional.md` (Auth fuera del piloto).

## Mapa de paginas (MVP piloto julio)

Marcar con `[x]` cuando el flujo tenga wireframe low-fi en Figma.

### Sistema de diseño

- [x] Design tokens (color, tipo, espaciado)
- [x] Componentes UI base
- [x] Marketing — landing (+ nota piloto auth)

### Flujos admin

- [x] Admin — dashboard / evento
- [x] Admin — importacion plano + correccion
- [x] Admin — Excel (plantilla + errores por fila)
- [x] Admin — modo preferencias
- [x] Admin — forma de mesa + vista asientos
- [x] Admin — tablero distribucion (empty + calculada)
- [x] Mapa navegacion + enlaces prototipo (prompts 5–6)

## APIs disponibles en main (Ventana 2 / Figma)

### Evento y mesas (#1)

- `POST /api/v1/events` — crear evento
- `GET /api/v1/events/:eventId` — evento + mesas + `capacitySummary`
- `POST/PUT/DELETE .../events/:eventId/tables` — CRUD mesas

### Forma mesa (#15)

- `GET /api/v1/events/:eventId/table-shapes` — catalogo de formas
- `GET /api/v1/events/:eventId/table-shapes/:shape/seat-topology?capacity=N` — vista previa
- `GET .../floor-plans/:id/draft/tables/:tableId/seat-topology` — topologia por mesa

Usar estos contratos para la pantalla **forma de mesa + vista previa asientos**.

## Post-piloto (backlog Figma)

RSVP, Top-K comparador, invitado, documentos salon/cocina, **auth (registro/login)** — ver SDD-01A seccion 3 completa.

## Cierre issue #7

- [ ] Revisar visualmente en Make que prompts 1–7 se ven correctos
- [ ] Exportar PDF capturas (opcional, evidencia en repo)
- [x] Commit en `feat/7-figma-mvp` → push → merge a `main` (PR #37)
- [x] Cerrar issue **#7** en GitHub con enlace Figma
- [x] Actualizar tabla de estado en `CONTEXTO-EJECUCION.md`
