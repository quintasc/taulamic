# Sprint 06 — MEJ-08 Fase 2 (drag + auditoría HU-05)

> **Inicio:** 2026-06-21  
> **Contexto:** Sprint 05 cerrado (`sprint-05-cierre.md`).  
> **SDD manda** — `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md` (PP-HU05-03, 04, 06).

## 1) Objetivo

Completar MEJ-08 Fase 2: mover invitados entre mesas por arrastre, auditoría de cambios manuales y refresco en vivo de KPIs del Dashboard.

## 2) Alcance

| Prioridad | Issue | MEJ | Descripción | Estado |
|-----------|-------|-----|-------------|--------|
| P1 | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 | PP-HU05-03 — drag pill entre mesas (lista + plano) | ✅ Validado 2026-06-21 |
| P2 | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 | PP-HU05-06 — auditoría cambios manuales (log API) | ✅ Validado 2026-06-21 |
| P3 | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 | PP-HU05-04 — KPIs Dashboard sin reentrar tras mutación | ✅ Validado 2026-06-21 |
| P2b | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 | RF-HU05-05.5 — override acompañantes (warning) + panel plano lateral | ✅ Validado 2026-06-21 |
| Backlog | — | — | RF-HU05-03.6 asientos S1…Sn (Fase C) | ⏭️ Post Sprint 06 |
| Pospuesto | [#53](https://github.com/quintasc/taulamic/issues/53) | — | Organizador real julio 2026 | ⏭️ |

## 3) Fuera de alcance Sprint 06

- UI historial de auditoría (Fase 2 del SDD; log API suficiente en sprint)
- Pantalla UI sugerencias IA
- Drag posiciones de mesas en canvas (ADR-016 post-MVP)
- Asientos numerados S1…Sn en plano (RF-HU05-03.6 Fase C)
- PostgreSQL / auth

## 4) Criterios de aceptación

### PP-HU05-03 — Drag invitado

1. En propuesta `draft`, el organizador arrastra un pill desde mesa origen a mesa destino (Distribución expandida y plano Fase B).
2. Operación atómica vía API `move` (equivalente desasignar + reasignar).
3. Mesa llena o regla dura: rechazo con mensaje; zona destino inválida sin drop.
4. No arrastrar si propuesta confirmada.

### PP-HU05-04 — KPIs en vivo

1. Tras ✕, + o drag exitoso, el Dashboard actualiza hint «X de Y asignados · Z sin asignar» sin F5 ni reentrar.

### PP-HU05-06 — Auditoría

1. Cada mutación manual (assign, unassign, move) registra entrada: actor, guestId, mesa origen/destino, timestamp.
2. Consultable vía API gobernanza existente (extensión de tipos).

### Fase 2b — Override acompañantes (RF-HU05-05.5)

1. Drag que separa pareja sin `separar_acompanante` → cambio persiste + `Alert` warning inline (plano y distribución visibles).
2. Mesa llena / incompatibilidad → sigue bloqueando.
3. Auditoría con `companionSeparationWarning: true`.

Ver `SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md`, `ADR-022`.

## 5) Criterio de cierre

- PP-HU05-03, 04 y 06 validados (manual + tests API). ✅ 2026-06-21
- Fase 2b (RF-HU05-05.5) validada manual. ✅ 2026-06-21
- `sprint-06-cierre.md` + CONTEXTO actualizado. ✅
- #51 cerrada o comentada con alcance Fase 2 completo — pendiente tras commit

## 6) Referencias

- `sprint-05-cierre.md`
- `sprint-06-cierre.md`
- `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`
- `SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md`
- `ADR-022-override-manual-hu05-vs-reglas-duras.md`
- `docs/agile/guion-validacion-mej-08-ui.md`
