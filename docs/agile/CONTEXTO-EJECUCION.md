# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-21
- Hito activo: **MVP julio (piloto)** — ver `DECISION-002-mvp-julio-piloto-funcional.md`
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic`
- **Modo actual:** trabajo en **2 ventanas Cursor** en paralelo (sin solapamiento de codigo)

## Como indicar tu ventana al agente

Al abrir el chat en cada ventana, di **exactamente una** de estas frases (o copia el bloque de tu ventana):

| Ventana | Di al agente |
|---------|----------------|
| **Ventana 1** | `Soy Ventana 1. Lee docs/agile/CONTEXTO-EJECUCION.md seccion Ventana 1.` |
| **Ventana 2** | `Soy Ventana 2. Lee docs/agile/CONTEXTO-EJECUCION.md seccion Ventana 2.` |

El agente debe leer **solo la seccion de tu ventana** y no mezclar tareas.

---

## Setup al clonar o abrir por primera vez

```bash
git clone https://github.com/quintasc/taulamic.git
cd taulamic
git pull origin main
```

| Ventana | Rama | Comando |
|---------|------|---------|
| **1** (#1 evento/mesas API) | `feat/1-evento-mesas` | `git checkout -b feat/1-evento-mesas` |
| **2** (#7 Figma) | `feat/7-figma-mvp` | `git checkout feat/7-figma-mvp` (ya existe en remoto) |

**Reglas de coordinacion:**

- Una ventana = una rama = una issue.
- No commitear en `main` desde las ventanas de trabajo.
- Integracion: merge a `main` cuando la issue este lista.
- Tras cada merge a `main`, la otra ventana hace `git pull origin main` y rebase/merge de su rama.
- Actualizar este archivo al cerrar cada issue.

---

## Estado compartido (ambas ventanas)

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) + Sprint 01 UX (#7) en paralelo |
| EP-11 / EP-12 / EP-13 | **Cerrados** (#22–#36) |
| EP-01 #15 (forma mesa HU-29) | **Cerrado** (`7dcb111`) |
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` |

| Ventana | Issue | Rama | Estado |
|---------|-------|------|--------|
| **1** | **#1** evento y mesas API | `feat/1-evento-mesas` (crear) | **Siguiente** |
| **2** | **#7** Figma MVP (UX) | `feat/7-figma-mvp` | **En curso** |

---

## Ventana 1 — API evento y mesas (#1)

**Para:** esta ventana de Cursor (backend).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Retomo Taulamic. Issue #1 evento y mesas API. Rama feat/1-evento-mesas. EP-01. Referencia SDD-01 HU-01. #15 cerrado (table-shapes + seat-topology). SDD manda.
```

### Objetivo

Implementar **HU-01**: configuracion operativa de evento y mesas (API minima piloto). EP-01.

### Referencias SDD

- `docs/sdd/SDD-02-backlog-inicial.md` (EP-01, HU-01)
- `docs/sdd/SDD-01-borrador-mvp.md` (configurar mesas, capacidad)
- API #15 ya disponible: `GET .../table-shapes`, `GET .../seat-topology`

### Alcance permitido

| Si | No |
|----|-----|
| Modulo evento/mesas (nuevo o ampliacion) | `docs/ux/**` (Ventana 2) |
| Tests unit/e2e de #1 | Cambios funcionales SDD sin aprobacion |

### Patron de cierre

1. `cd apps/api && npm run build && npm test && npm run test:e2e`
2. Commit en `feat/1-evento-mesas` → push → merge a `main`
3. Cerrar issue **#1** en GitHub
4. Actualizar este archivo

---

## Ventana 2 — Figma MVP (#7)

**Para:** segunda ventana de Cursor (UX / documentacion de diseno; sin codigo API).

### Frase clave (pegar en el chat)

```text
Soy Ventana 2. Retomo Taulamic. Issue #7 Figma MVP alineado con SDD. Rama feat/7-figma-mvp. Trabajo UX en Figma y docs/ux/. No tocar apps/api/. SDD-01A manda.
```

### Objetivo

Entregar flujos y wireframes MVP en **Figma** alineados con el SDD. Sprint 01 pospuesto pero ejecutado en paralelo al piloto (DECISION-001).

### Referencias SDD

- `docs/sdd/SDD-01A-figma-ui-ux.md` — entregables minimos y flujos
- `docs/sdd/SDD-01C-principios-estilo-y-baja-friccion.md` — tono visual
- `docs/sdd/SDD-01D-importacion-plano-salon.md` — flujo plano (API lista)
- `docs/sdd/SDD-01E-precarga-invitados-excel.md` — flujo Excel (API lista)
- `docs/ux/figma-mvp.md` — plantilla de seguimiento
- API #15 (para pantalla forma mesa): `GET /api/v1/events/:id/table-shapes` y `.../seat-topology`

### Entregables minimos (#7)

Prioridad **piloto julio**:

1. Mapa de navegacion admin (MVP piloto).
2. Flujos wireframe low-fi: plano, Excel, modo preferencias, **forma de mesa + vista asientos** (API #15 lista), tablero distribucion.
3. Componentes UI base.
4. Enlace Figma en `docs/ux/figma-mvp.md`.

### Patron de cierre

1. Archivo Figma con entregables minimos piloto
2. `docs/ux/figma-mvp.md` actualizado
3. Merge `feat/7-figma-mvp` → `main` → cerrar **#7**

---

## Dos niveles de MVP (no confundir)

| Nivel | Que es | Cuando |
|-------|--------|--------|
| **MVP julio (piloto)** | Flujo admin demostrable en evento real | **2026-07-31** |
| **MVP SDD completo** | Todo `SDD-01-borrador-mvp.md` | Post-piloto (ago 2026+) |

## Comandos utiles (Ventana 1)

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```

## Ultimos commits de referencia

| Commit | Descripcion |
|--------|-------------|
| `7dcb111` | Forma mesa y topologia asientos HU-29 (#15) |
| `3af4a8a` | E2E consolidado EP-13 (#36) |
| `c1bd375` | Contexto dual ventana |
