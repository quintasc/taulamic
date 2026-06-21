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
| Sprint activo | Sprint 02 (#21) + Sprint 01 UX (#7) en paralelo |
| EP-11 / EP-12 / EP-13 | **Cerrados** (#22–#36) |
| EP-01 | **Cerrado** (#1 + #15) |
| EP-02 | **Cerrado** (#2) |
| Rebrand Taulamic | **Cerrado** |
| Plan piloto | `docs/agile/mvp-julio-plan.md` |

| Ventana | Issue | Rama | Estado |
|---------|-------|------|--------|
| **1** | **#3** motor v0 piloto (EP-03) | `feat/3-motor-v0` (crear) | **Siguiente** |
| **2** | **#7** Figma MVP (UX) | `feat/7-figma-mvp` | **En curso** |

---

## Ventana 1 — Motor v0 piloto (#3)

**Para:** esta ventana de Cursor (backend).

### Frase clave (pegar en el chat)

```text
Soy Ventana 1. Retomo Taulamic. Issue #3 motor v0 piloto. Rama feat/3-motor-v0. EP-03 alcance reducido segun DECISION-002. EP-01 y EP-02 cerrados. SDD manda.
```

### Objetivo

Implementar **motor v0** (asignacion simple, reglas duras basicas) para el piloto julio. Version reducida segun `DECISION-002` — no Top-K ni comparador visual (EP-08).

### Referencias SDD

- `docs/sdd/SDD-02-backlog-inicial.md` (EP-03)
- `docs/agile/DECISION-002-mvp-julio-piloto-funcional.md` (motor v0, `motorVersion: "v0-pilot"`)
- Datos disponibles: evento/mesas (#1), invitados (#2), plano (#22–#26), Excel (#27–#31), preferencias (#32–#36)

### Patron de cierre

1. `cd apps/api && npm run build && npm test && npm run test:e2e`
2. Rama `feat/3-motor-v0` → merge `main` → cerrar o desglosar **#3** → actualizar este archivo

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
| `f4510c6` | Invitados API piloto EP-02 (#2) |
| `8001f0d` | Evento y mesas HU-01 (#1) |
| `7dcb111` | Forma mesa y topologia HU-29 (#15) |
| `57834be` | Contexto dual ventana |
