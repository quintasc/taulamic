# Sprint 03 — Post-piloto (UX + estabilizacion)

> **Inicio:** 2026-06-24 (tras cierre Sprint 02 #21)  
> **Contexto:** Piloto julio DoD **cerrado**; foco en mejoras derivadas de validacion PO y preparacion MVP SDD.  
> **SDD manda** — ver `mvp-julio-plan.md` §5 para epicas de infraestructura (PostgreSQL, auth, motor EP-08).

## 1) Objetivo

Entregar mejoras UX de alto impacto del backlog post-piloto y mantener el nucleo piloto estable, sin abrir aun migracion a PostgreSQL (decision pendiente ADR tipos compartidos).

## 2) Alcance sugerido (prioridad PO)

| Prioridad | Issue | Descripcion |
|-----------|-------|-------------|
| P1 | [#44](https://github.com/quintasc/taulamic/issues/44) | MEJ-01 — descarga plantilla Excel persistente |
| P1 | [#46](https://github.com/quintasc/taulamic/issues/46) | MEJ-03 — filtros invitados y recuento |
| P2 | [#47](https://github.com/quintasc/taulamic/issues/47) | MEJ-04 — toast eliminar alineado con guia estilo |
| P2 | [#52](https://github.com/quintasc/taulamic/issues/52) | MEJ-09 — suavizar flash F5 |
| Backlog | [#45](https://github.com/quintasc/taulamic/issues/45)–[#51](https://github.com/quintasc/taulamic/issues/51) | MEJ restantes (plano, afinidades, distribucion manual) |
| Pospuesto | [#53](https://github.com/quintasc/taulamic/issues/53) | Organizador real — sin disponibilidad |

## 3) Fuera de alcance (Sprint 03)

- PostgreSQL / auth / motor EP-08 (epicas agosto+)
- Refactor masivo de carpetas (`packages/`, `features/`)
- Usuario real piloto (#53)

## 4) Criterio de cierre

- Issues P1 del sprint cerradas con evidencia (test o nota en PR).
- `npm run build` + tests piloto en verde (API + web).
- CONTEXTO y roadmap actualizados.

## 5) Referencias

- Feedback PO: `evidencias-piloto/sesion-2026-06-24.md` (MEJ-01…09)
- UX invitados: `docs/ux/spec-invitados-panel-v2-post-piloto.md`
- Guia estilo: `docs/ux/guia-estilo-taulamic.md`
- GitHub Project: https://github.com/users/quintasc/projects/2
