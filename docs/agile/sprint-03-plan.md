# Sprint 03 — Post-piloto (UX + estabilizacion)

> **Inicio:** 2026-06-24 (tras cierre Sprint 02 #21)  
> **Cierre:** 2026-06-26 — ver **`sprint-03-cierre.md`**  
> **Contexto:** Piloto julio DoD **cerrado**; foco en mejoras derivadas de validacion PO.  
> **SDD manda** — ver `mvp-julio-plan.md` §5 para epicas de infraestructura (PostgreSQL, auth, motor EP-08).

## 1) Objetivo

Entregar mejoras UX de alto impacto del backlog post-piloto y mantener el nucleo piloto estable, sin abrir aun migracion a PostgreSQL (decision pendiente ADR tipos compartidos).

**Resultado:** objetivo cumplido para alcance P1/P2 + MEJ-06.

## 2) Alcance — estado final

| Prioridad | Issue | Descripcion | Estado |
|-----------|-------|-------------|--------|
| P1 | [#44](https://github.com/quintasc/taulamic/issues/44) | MEJ-01 — descarga plantilla Excel persistente | ✅ `6d0b074` |
| P1 | [#46](https://github.com/quintasc/taulamic/issues/46) | MEJ-03 — filtros invitados y recuento | ✅ `6d0b074` |
| P2 | [#47](https://github.com/quintasc/taulamic/issues/47) | MEJ-04 — confirmacion eliminar alineada con guia estilo | ✅ `6d0b074` |
| P2 | [#52](https://github.com/quintasc/taulamic/issues/52) | MEJ-09 — suavizar flash F5 | ✅ `6d0b074` |
| Backlog | [#49](https://github.com/quintasc/taulamic/issues/49) | MEJ-06 — iconos accesorios plano | ✅ `6d0b074` |
| Extra | — | Wordmark PNG, footer admin, cuenta atrás | ✅ `21d249e` |
| Backlog | [#45](https://github.com/quintasc/taulamic/issues/45) | MEJ-02 — Excel ampliado + IA | ⏭️ Sprint 04 |
| Backlog | [#48](https://github.com/quintasc/taulamic/issues/48) | MEJ-05 — plano limites/resize | ⏭️ Sprint 04 |
| Backlog | [#50](https://github.com/quintasc/taulamic/issues/50) | MEJ-07 — orden afinidades | ⏭️ Sprint 04 |
| Backlog | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 — distribucion manual | ⏭️ Sprint 04+ |
| Pospuesto | [#53](https://github.com/quintasc/taulamic/issues/53) | Organizador real | ⏭️ Sin disponibilidad |

## 3) Fuera de alcance (Sprint 03)

- PostgreSQL / auth / motor EP-08 (epicas agosto+)
- Refactor masivo de carpetas (`packages/`, `features/`)
- Usuario real piloto (#53)

## 4) Criterio de cierre

| Criterio | Estado |
|----------|--------|
| Issues P1 del sprint cerradas con evidencia | ✅ |
| Issues P2 del sprint cerradas | ✅ |
| `npm run build` + tests piloto en verde | ✅ 2026-06-26 |
| CONTEXTO y roadmap actualizados | ✅ |

## 5) Referencias

- Cierre y changelog: `sprint-03-cierre.md`
- Feedback PO: `evidencias-piloto/sesion-2026-06-24.md` (MEJ-01…09)
- UX invitados: `docs/ux/spec-invitados-panel-v2-post-piloto.md`
- Guia estilo: `docs/ux/guia-estilo-taulamic.md`
- GitHub Project: https://github.com/users/quintasc/projects/2
