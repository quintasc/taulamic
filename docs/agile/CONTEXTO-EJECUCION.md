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

| Ventana | Rama a crear | Comando |
|---------|--------------|---------|
| **1** (#15 API) | `feat/15-forma-mesa` | `git checkout -b feat/15-forma-mesa` |
| **2** (#7 Figma) | `feat/7-figma-mvp` | `git checkout -b feat/7-figma-mvp` |

**Reglas de coordinacion:**

- Una ventana = una rama = una issue.
- No commitear en `main` desde las ventanas de trabajo.
- Integracion: merge a `main` cuando la issue este lista (tests en V1; evidencia Figma en V2).
- Tras cada merge a `main`, la otra ventana hace `git pull origin main` y rebase/merge de su rama.
- Actualizar este archivo al cerrar cada issue (normalmente desde la ventana que cierra la issue, en `main`).

---

## Estado compartido (ambas ventanas)

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) + Sprint 01 UX (#7) en paralelo |
| EP-11 / EP-12 / EP-13 | **Cerrados** (#22–#36) |
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` |

| Ventana | Issue | Rama | Estado |
|---------|-------|------|--------|
| **1** | **#15** forma de mesa (HU-29) | `feat/15-forma-mesa` | **En curso** |
| **2** | **#7** Figma MVP (UX) | `feat/7-figma-mvp` | **En curso** |

---

## Ventana 1 — API forma de mesa (#15)

**Para:** esta ventana de Cursor (backend).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Retomo Taulamic. Issue #15 forma de mesa (HU-29). Rama feat/15-forma-mesa. Solo tocar apps/api/src/floor-plans/ y tests relacionados. SDD manda. No tocar Figma ni docs/ux salvo OpenAPI si aplica.
```

### Objetivo

Implementar **HU-29**: configurar forma de mesa y topologia de asientos (adyacencia/proximidad). EP-01.

### Referencias SDD

- `docs/sdd/SDD-02-backlog-inicial.md` (EP-01, HU-29)
- `docs/sdd/SDD-01-borrador-mvp.md` (forma de mesa, proximidades, motor)
- Codigo existente: `apps/api/src/floor-plans/domain/table-shape.normalizer.ts`

### Alcance permitido

| Si | No |
|----|-----|
| `apps/api/src/floor-plans/**` | `docs/ux/**` (Ventana 2) |
| `apps/api/test/floor-plans*.ts` y E2E nuevos de #15 | `guest-import/`, `events/` salvo integracion estricta |
| OpenAPI/DTOs de forma de mesa | Merge directo a `main` sin PR/revision |

### Patron de cierre

1. `cd apps/api && npm run build && npm test && npm run test:e2e`
2. Commit en `feat/15-forma-mesa` → push → merge/PR a `main`
3. Cerrar issue **#15** en GitHub
4. Actualizar tabla de estado en este archivo

### Tras #15

Siguiente en Ventana 1: **#1** (evento y mesas API) — cuando #7 aporte flujos minimos o usando `SDD-01A` como referencia.

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
- `docs/sdd/SDD-01D-importacion-plano-salon.md` — flujo plano (ya implementado en API)
- `docs/sdd/SDD-01E-precarga-invitados-excel.md` — flujo Excel (ya implementado en API)
- `docs/agile/sprint-01-plan.md` — alcance Sprint 01

### Entregables minimos (#7)

Prioridad **piloto julio** (lo que el admin usara antes del 31 jul):

1. Mapa de navegacion admin (MVP piloto).
2. Flujos wireframe low-fi:
   - importacion plano + correccion detecciones,
   - descarga plantilla + import Excel + errores por fila,
   - selector modo preferencias (colaborativo / anfitrion exclusivo),
   - configuracion forma de mesa + vista previa asientos (coordinar con #15 sin bloquearla),
   - tablero distribucion admin (borrador para motor v0).
3. Componentes UI base (botones, inputs, tarjetas, tablas).
4. Enlace al archivo Figma documentado en `docs/ux/figma-mvp.md` (crear al tener URL).

Flujos **post-piloto** (wireframe ligero o backlog Figma): RSVP, Top-K, documentos, invitado.

### Alcance en el repo (rama `feat/7-figma-mvp`)

| Si | No |
|----|-----|
| `docs/ux/**` (nuevo: enlaces Figma, notas de flujo, capturas exportadas) | `apps/api/**` |
| Actualizar `docs/product/` si hay decision UX que afecte SDD | Cambios funcionales en SDD sin aprobacion |
| Commits de evidencia (PNG/PDF exportados de Figma, opcional) | Cerrar #7 sin enlace Figma o wireframes minimos |

### Patron de cierre

1. Archivo Figma con entregables minimos piloto
2. `docs/ux/figma-mvp.md` con URL, estructura de paginas y estado de flujos
3. Commit en `feat/7-figma-mvp` → push → merge a `main`
4. Cerrar issue **#7** en GitHub con enlace Figma
5. Actualizar tabla de estado en este archivo

### Tras #7

Desbloquea priorizacion de **#1** y frontend admin (W5 en `mvp-julio-plan.md`).

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
| `3af4a8a` | E2E consolidado EP-13 (#36) |
| `d2749d0` | Rebrand cerrado al 100 % |
| `69b9301` | Punto de reanudacion post-rebrand |
