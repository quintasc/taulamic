# DECISION-003 - Naming: Taulamic (marca y repo)

- Estado: **Aceptada**
- Fecha: 2026-06-20 (rebrand efectivo)
- Decisor: Carmen Quintas Ramirez (product owner)

## Contexto

Durante Sprint 02 se evaluaron nombres alternativos al producto canonico historico **Taulame** (SDD-00, repo `quintasc/taulame`). La evaluacion concluyo en **Taulamic** (*taula* + *amic*: mesa / amigos) como nombre comercial y tecnico definitivo.

Esta decision **sustituye** la postura anterior de mantener **Taulame** hasta despues del piloto (MVP julio 2026).

## Decision

1. **Nombre de producto y repositorio:** **Taulamic** (SDD, codigo, GitHub `quintasc/taulamic`, issues, documentacion).
2. **Dominio objetivo:** **taulamic.com** (adquirido por el product owner). **taulame.com** deja de ser objetivo.
3. **Convenciones tecnicas:** header HTTP `x-taulamic-actor-role`; identificadores internos `taulamic-*` donde aplique.
4. La evaluacion de nombres **no modifica** requisitos funcionales del SDD ni el alcance del piloto (DECISION-002).

## Consecuencias

- Rebrand coordinado en codigo, docs y remoto GitHub antes de continuar el sprint critico hacia julio.
- Trazabilidad de riesgos foneticos asumidos (Talismatic, Talmatic) en sector distinto.
- Cualquier cambio futuro de marca requerira DECISION de seguimiento.

## Cierre rebrand (100 %)

Estado: **cerrado** (2026-06-20).

| Elemento | Estado |
|----------|--------|
| Codigo y tests (`x-taulamic-*`, plantillas, Swagger) | Hecho (`c3183c1`) |
| Docs, SDD, ADR, PRD | Hecho (`c3183c1`) |
| GitHub `quintasc/taulamic` + remote local | Hecho |
| README (dominio registrado + enlace repo) | Hecho (`fc790c0`) |
| Referencias activas a Taulame fuera de esta decision | Ninguna |
| Carpeta local del workspace (`taulamic`) | Hecho |

## Referencias

- SDD-00 (vision y estrategia)
- DECISION-002 (MVP julio piloto)
- Conversacion de evaluacion: Kune, Kumi, Taulamic (2026-06)
