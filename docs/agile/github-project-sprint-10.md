# GitHub Project — actualización Sprint 10 / post-S10 (última revisión: 2026-07-17)

**Project:** https://github.com/users/quintasc/projects/2  
**`main` @ `3447809`:** ADR-024 L3bis + Fase 1a/1b + exclusión Pareja (sesión 17 jul tarde)

## Resumen de estado (2026-07-17)

| Área | Estado en Project | Notas |
|------|-------------------|-------|
| Piloto evaluable (flujo admin E2E) | Cerrado técnicamente | E2E API con CP-SAT (default `v1`); ver `docs/pilot/` |
| E2E motor = config | Hecho | `DISTRIBUTION_ENGINE` + `--experimental-vm-modules` (`9d6fdb0`) |
| ADR-024 L3 / L3bis / 1a·1b | Hecho (código) | Ver sección «Actualización 17 jul tarde» |
| Refactor web distribución/plano | `Done` (local) | Hooks compartidos, `AdminModalShell`, badge PAX — `6f242a8` |
| EP-03 Motor distribución async | `Done` / `Done` | CP-SAT v1 + tracker; e2e alineados |
| EP-04 Revisión manual | `In Progress` | HU-05 hecho; versionado rico HU-06 pendiente |
| EP-05 Publicación y documentos | `In Progress` | PDF organizador parcial (frontend); publicación/cocina pendiente |
| EP-07 OpenAPI | `In Progress` | Contrato piloto documentado; auth/JWT completo pendiente |
| EP-08 Estrategia motor | `In Progress` | ADR-023/024 en código; Top-K/comparador pendiente |
| EP-09 RSVP / EP-10 UX completa | `Todo` / Backlog-Ready | Fuera piloto evaluable |
| Post-piloto MEJ (#44–#52) | `Done` | Incluye HU-05 manual (#51) |
| #53 Organizador real | `Todo` | Post-piloto |
| Docs `docs/pilot/` | `Done` (draft) | Commit `4dd7e39` + ALCANCE 17 jul |

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
| E2E API ↔ `DISTRIBUTION_ENGINE` | `9d6fdb0` | Default CP-SAT |
| Motor ADR-024 L3bis + Fase 1a/1b | `3447809` | Ver sección siguiente |
| UI colores categoría sin colisión | `3447809` | Lookup por índice ordenado |

## Mantener en In progress / To do

| Ítem | Motivo |
|------|--------|
| Validación PO manual plano desktop + móvil | `guion-validacion-piloto-ui.md` |
| Corregir room-setup 3×3 en eventos de prueba | Desde UI, no código |
| Refactor UI móvil fases 2–4 | `refactor-ui-mobile-admin.md` |
| Accesorios room-setup `(x,y)` | Gate SDD |
| Top-K / comparador (EP-08) | ADR-023 §3 diferido |

## Actualización documental (2026-07-17, e2e motor)

| Ítem | Estado | Nota |
|------|--------|------|
| E2E API ↔ `DISTRIBUTION_ENGINE` | Hecho | Default CP-SAT; v0 opcional vía env |
| Suite e2e API | 66/66 con v1 | Jest `--experimental-vm-modules` |
| Docs piloto | Sincronizados | Dejan de decir «E2E fuerzan v0» |

## Actualización Project #2 (2026-07-17 tarde — ADR-024 sala)

| Ítem | Estado | Nota |
|------|--------|------|
| ADR-024 L3 ≥2 + L3bis islas | Hecho en código | Soft L3bis solo Fase 1b |
| ADR-023 Fase 1a / 1b | Hecho en código | 1a rígida; 1b elasticidad + islas + k_min C+E |
| Exclusión Pareja/Parejas del L1 | Hecho (genérico) | Misma regla que PDF; D3 por `acompanante_key` |
| Packing ≤2 vacías | Hecho | Alineado con holgura ±2 |
| Colores categoría UI/PDF | Hecho | Sin colisiones por hash |
| EP-08 Status | Sin cambio (`In Progress`) | Avance de calidad motor; Top-K sigue pendiente |
| Comentario en #10 | Añadido | Resumen de entrega para el Project |

## Comandos útiles (si usas `gh`)

```powershell
gh project list --owner quintasc
gh issue view 10
```
