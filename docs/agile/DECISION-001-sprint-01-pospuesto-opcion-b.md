# DECISION-001 - Sprint 01 pospuesto (Opcion B pragmatica)

- Estado: **Aceptada**
- Fecha: 2026-06-17
- Decisor: Carmen Quintas Ramirez (product owner)
- Issues de seguimiento: #8 (Sprint 01), #21 (Sprint 02)

## Contexto

El proyecto completo la fase SDD (especificaciones, ADRs, PRD, backlog) y entro en ejecucion Agile por sprints.

El plan original contemplaba:

1. **Sprint 01** — Figma UX (#7), configuracion evento/mesas (#1), captura invitados (#2).
2. Validar y cerrar Sprint 01.
3. **Sprint 02** — configuracion inteligente y captura asistida (#15–#18 y subtareas).

En la practica, se inicio codigo del Sprint 02 (#22, API de carga de plano) antes de cerrar las issues del Sprint 01.

## Decision

Se adopta la **Opcion B (pragmatica)**:

1. **Sprint 01 queda pospuesto** (no cancelado). Sus issues (#1, #2, #7) permanecen abiertas y se replanificaran en un sprint futuro o en paralelo cuando aporte valor sin bloquear el vertical slice tecnico actual.
2. **Sprint 02 continua como sprint activo** de ejecucion.
3. **Regla de avance inmediata:** no abrir #23 ni siguientes frentes del EP-11 hasta **cerrar y validar #22** segun SDD, criterios de aceptacion y `docs/agile/politica-validacion-tests-y-cobertura.md`.
4. **Cierre de Sprint 02** sigue exigiendo validacion completa del milestone (issues #15–#36 + seguimiento #21), no solo de #22.

## Motivos

- Priorizar un **vertical slice tecnico** (API NestJS + importacion de plano) que desbloquea EP-11.
- El SDD ya define flujos UX en documentos (`SDD-01A`); Figma puede ejecutarse despues sin bloquear la base de backend acordada en ADR-002/003.
- Evitar falsa sensacion de avance: el Sprint 01 no se marca como cerrado sin entregables.

## Consecuencias

### Positivas

- Avance tangible en codigo alineado al SDD.
- Menor friccion para validar arquitectura monolito modular + API.
- Trazabilidad explicita de la desviacion plan vs ejecucion.

### Negativas / riesgos

- UX Figma y pantallas admin/invitado pueden llegar tarde al codigo si no se agenda Sprint 01.
- Dependencias originales (#1 depende de #7) siguen vigentes cuando se retome Sprint 01.
- Mitigacion: mantener SDD-01A como referencia de flujos hasta disponer de Figma.

## Criterios para reactivar Sprint 01

Replanificar Sprint 01 cuando ocurra al menos una de estas condiciones:

- Se complete el vertical slice #22–#24 del EP-11, o
- Una historia de Sprint 02 requiera pantallas Figma para validar criterios de aceptacion, o
- El equipo disponga de capacidad paralela UX + backend.

## Relacion con metodologia

| Concepto | Aplicacion |
|----------|------------|
| Refinamiento de backlog | Ya hecho para Sprint 02 (#22–#36). #15 pendiente de desglose. |
| Validacion por sprint | Sprint 02 se valida al cerrar #21; Sprint 01 se validara al retomarlo (#8). |
| SDD como fuente de verdad | Sin cambios. Ver `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`. |

## Referencias

- `docs/agile/sprint-01-plan.md`
- `docs/agile/sprint-02-plan.md`
- GitHub: [#8](https://github.com/quintasc/taulamic/issues/8), [#21](https://github.com/quintasc/taulamic/issues/21)
