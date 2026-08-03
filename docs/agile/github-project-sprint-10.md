# GitHub Project — actualización post-piloto (última revisión: 2026-08-03)

**Project:** https://github.com/users/quintasc/projects/2  
**`main` @ `664635d`:** mapa docs; BF-09/#56; *local:* BF-10/#57. Ver `CONTEXTO-EJECUCION.md`.

## Resumen de estado (2026-08-03)

| Área | Estado en Project | Notas |
|------|-------------------|-------|
| Piloto evaluable (flujo admin) | Cerrado técnicamente | Ver `docs/pilot/` |
| EP-01…03, 11–13 + HU-31…40 | `Done` | Flujo sincronizado a Done donde faltaba (#1, #2, #7) |
| EP-03 Motor async + CP-SAT | `Done` | Tracker in-process; ADR-023/024 en código |
| EP-04 Revisión manual | `In Progress` | HU-05 hecho; versionado rico HU-06 pendiente |
| EP-05 Publicación y documentos | `In Progress` | PDF organizador parcial (frontend); cocina/publicación pendiente |
| EP-07 OpenAPI | `In Progress` | JSON+CI hechos; auth JWT pendiente — comentario 2026-08-02 |
| EP-08 Estrategia motor (#10) | `In Progress` | ADR-024 hecho; Top-K pendiente; **deuda L2 mesas justas #54** |
| EP-08 Top-K / comparador (#11–12) | `Todo` / Backlog | ADR-023 §3 |
| EP-09 RSVP / EP-10 UX completa | `Todo` / Ready | Fuera piloto evaluable |
| EP-06 Auth | `Todo` / Backlog | Post-piloto; cookie HttpOnly en CONTEXTO |
| Post-piloto MEJ (#44–#52) | `Done` | |
| #53 Organizador real | `Todo` | Post-piloto |
| **#54** Deuda motor L2 mesas justas | `Todo` / Ready | 2026-08-02 |
| **#55** Sillas API + afinidades API | `Todo` / Ready | 2026-08-02 |
| **#56** Escalabilidad multi-usuario (BF-09) | `Todo` / Backlog | 2026-08-02 |
| **#57** Desacoplar features Nest (BF-10) | `Todo` / Backlog | 2026-08-03 |
| Docs `docs/pilot/` | `Done` | Draft Project sincronizado |

## Prioridad operativa (desde CONTEXTO)

1. Validación PO visual (`guion-validacion-piloto-ui.md`)
2. #55 Unificar sillas / persistencia afinidades
3. Top-K diferido (#11–12)
4. #54 Deuda motor L2 con mesas justas

Detalle: `docs/agile/CONTEXTO-EJECUCION.md`.

## Actualización Project #2 (2026-08-02…03)

| Acción | Resultado |
|--------|-----------|
| Issues #54, #55 creados y añadidos al Project | Status Todo, Flujo Ready |
| #56 BF-09, #57 BF-10 | Todo / Backlog |
| Comentario en #10 | ADR-024 + deuda L2 + Top-K pendiente |
| Comentario en #9 | OpenAPI JSON/CI; auth pendiente |
| Flujo → Done | #1, #2, #7 (Status ya era Done) |

## Comandos útiles

```powershell
gh project list --owner quintasc
gh project item-list 2 --owner quintasc --limit 50
gh issue view 54
gh issue view 55
```
