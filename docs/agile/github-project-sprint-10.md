# GitHub Project — actualización Sprint 10 / post-S10 (última revisión: 2026-07-17)

**Project:** https://github.com/users/quintasc/projects/2  
**`main` @ `9d6fdb0`** — e2e API respetan `DISTRIBUTION_ENGINE` (default CP-SAT)

## Resumen de estado (2026-07-17)

| Área | Estado en Project | Notas |
|------|-------------------|-------|
| Piloto evaluable (flujo admin E2E) | Cerrado técnicamente | E2E API con CP-SAT (default `v1`); ver `docs/pilot/` |
| E2E motor = config | Hecho (local) | Ya no fuerzan v0; `DISTRIBUTION_ENGINE` + `--experimental-vm-modules` |
| Refactor web distribución/plano | `Done` (local) | Hooks compartidos, `AdminModalShell`, badge PAX — `6f242a8` |
| EP-03 Motor distribución async | `Done` / `Done` | CP-SAT v1 + tracker (`d08d11a`); e2e alineados 2026-07-17 |
| EP-04 Revisión manual | `In Progress` | HU-05 hecho; versionado rico HU-06 pendiente |
| EP-05 Publicación y documentos | `In Progress` | PDF organizador parcial (frontend); publicación/cocina pendiente |
| EP-07 OpenAPI | `In Progress` | Contrato piloto documentado; auth/JWT completo pendiente |
| EP-08 Estrategia motor | `In Progress` | ADR-023 CP-SAT; Top-K/comparador pendiente |
| EP-09 RSVP / EP-10 UX completa | `Todo` / Backlog-Ready | Fuera piloto evaluable |
| Post-piloto MEJ (#44–#52) | `Done` | Incluye HU-05 manual (#51) |
| #53 Organizador real | `Todo` | Post-piloto |
| Docs `docs/pilot/` | `Done` (draft) | Commit `4dd7e39` |

## Mover a Done (o equivalente «Hecho»)

| Ítem / tema | Commit | Notas |
|-------------|--------|-------|
| Drawer hamburguesa admin `< lg` | `4d42bdb` | Sprint 09 |
| Pulido PO — cabecera logo móvil | `4d42bdb` | Sprint 10 |
| Pulido PO — import invitados UX | `4d42bdb` | Sprint 10 |
| Pulido PO — setup nav Anterior móvil | `4d42bdb` | Sprint 10 |
| E2E smoke MEJ-13 D móvil | `4d42bdb` | `mej-13-ui-copy.spec.ts` |
| Plano — bug 3×3 (bucle clamp) | `1e74d45` | |
| Plano — escala round/oval consistente | `1e74d45` | |
| Plano — límites lógicos por invitados | `1e74d45` | `computeLogicalRoomLimits` |
| Plano — tope visual + aviso UI | `1e74d45` | `isRoomAtVisualMax` |
| Plano — flechas scroll accesorios móvil | `1e74d45` | `MobileHorizontalScroll` |
| Plano — paleta accesorios horizontal desktop | `c4c55a4` | |
| Plano — botón ↻ junto a dimensiones desktop | `c4c55a4` | |
| Plano — tooltips botones móvil | `c4c55a4` | |
| Plano — config colapsable desktop y móvil | `62463d4` | |
| Plano — layout desktop vertical (config→accesorios→plano) | `62463d4` | |
| Plano — accesorios perimetrales rect/oval/redondo | `62463d4` | |
| Plano — botón "Ver plano" estable; texto guardado corto | `62463d4` | |
| Refactor web — hooks mutaciones distribución/plano | `6f242a8` | `useDistributionPlacementMutations`, `useTableMetaDraft` |
| Refactor web — modales admin unificados | `6f242a8` | `AdminModalShell` en asignar/mover/sin asignar |
| UX distribución — badge PAX ajustado al contenido | `6f242a8` | Sobrecapacidad `10/8` sin espacio sobrante |
| E2E — agrupación por categoría alineado con UI | `6f242a8` | `category-grouping-distribution.spec.ts` |
| Docs — contexto ejecución sincronizado | `1c1be75` | `CONTEXTO-EJECUCION.md` |

## Mantener en In progress / To do

| Ítem | Motivo |
|------|--------|
| Validación PO manual plano desktop + móvil | `guion-validacion-piloto-ui.md` |
| Corregir room-setup 3×3 en eventos de prueba | Desde UI, no código |
| Refactor UI móvil fases 2–4 | `refactor-ui-mobile-admin.md` |
| Accesorios room-setup `(x,y)` | Gate SDD |

## Actualización aplicada en Project #2 (2026-07-12, sesión consolidación)

| Ítem | Estado anterior | Estado actualizado | Nota |
|------|------------------|--------------------|------|
| [EP-03] Motor de distribución asíncrono | `Status: Todo` / `Flujo: Backlog` | `Status: Done` / `Flujo: Done` | CP-SAT async + tracker (`d08d11a`) |
| Sprint 02 épicas (#15–#18, #21–#36) | `Flujo: In Progress/Ready` con `Status: Done` | `Flujo: Done` | Alineación Status/Flujo |
| [EP-04] Revisión manual y versionado | `Todo` / `Backlog` | `In Progress` / `In Progress` | Manual HU-05 hecho; versionado pendiente |
| [EP-05] Publicación y documentos | `Todo` / `Backlog` | `In Progress` / `In Progress` | PDF organizador parcial (frontend) |
| [EP-07] OpenAPI | `Todo` / `Ready` | `In Progress` / `In Progress` | Piloto documentado en `/api/docs` |
| [EP-08] Estrategia optimización motor | `Todo` / `Backlog` | `In Progress` / `In Progress` | ADR-023; Top-K pendiente |
| Docs consolidación `docs/pilot/` | (nuevo draft) | `Done` / `Done` | Commit `4dd7e39` |

## Actualización aplicada en Project #2 (2026-07-12, sesión refactor web)

| Ítem | Estado | Nota |
|------|--------|------|
| Refactor web distribución/plano | Documentado local | `6f242a8` — hooks, modales, badge PAX, E2E |
| Contexto ejecución + Project doc | Sincronizado | Ver commit docs de esta sesión |

## Actualización documental (2026-07-17, e2e motor)

| Ítem | Estado | Nota |
|------|--------|------|
| E2E API ↔ `DISTRIBUTION_ENGINE` | Hecho | Default CP-SAT; v0 opcional vía env |
| Suite e2e API | 66/66 con v1 | Jest `--experimental-vm-modules` |
| Docs piloto (`TRAZABILIDAD`, `ALCANCE-ACTUAL`, `EVOLUCION`, README) | Sincronizados | Dejan de decir «E2E fuerzan v0» |
| EP-03 / EP-08 en Project #2 | Sin cambio de Status | Mejora de validación, no nuevo alcance de épica |

## Comandos útiles (si usas `gh`)

```powershell
gh project list --owner quintasc
```
