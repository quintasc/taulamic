# GitHub Project — actualización Sprint 10 / post-S10 (última revisión: 2026-07-12)

**Project:** https://github.com/users/quintasc/projects/2  
**`main` @ `4dd7e39`** — consolidación documental `docs/pilot/`

## Resumen de estado (2026-07-12)

| Área | Estado en Project | Notas |
|------|-------------------|-------|
| Piloto evaluable (flujo admin E2E) | Cerrado técnicamente | Validación simulada + E2E; ver `docs/pilot/` |
| EP-03 Motor distribución async | `Done` / `Done` | CP-SAT v1 + tracker (`d08d11a`) |
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

## Comandos útiles (si usas `gh`)

```powershell
gh project list --owner quintasc
```
