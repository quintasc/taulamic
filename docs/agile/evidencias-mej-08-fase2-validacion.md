# MEJ-08 — Fase 2 validación manual (HU-05 drag + auditoría + Fase 2b)

- **Issue:** [#51](https://github.com/quintasc/taulamic/issues/51)
- **SDD:** `docs/sdd/SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md` (PP-HU05-03, 04, 06)
- **SDD Fase 2b:** `docs/sdd/SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md` · ADR-022
- **Guion:** `docs/agile/guion-validacion-mej-08-ui.md` (pasos 19–24)
- **Validación manual:** 2026-06-21 — **APROBADO** (PO)
- **Entorno:** API `:3000` · Web `:3001` (`npm run dev` desde raíz)

## Resumen por criterio

| ID | Descripción | Manual | Automatizado |
|----|-------------|--------|--------------|
| PP-HU05-03 | Drag pill entre mesas (lista + plano) | OK | `move-guest-in-proposal` 4/4 · e2e move |
| PP-HU05-04 | KPIs Dashboard sin reentrar | OK | `distribution-events.ts` + hook dashboard |
| PP-HU05-06 | Auditoría mutaciones manuales | OK (log API) | e2e assign/unassign/move + tipos gobernanza |
| RF-HU05-05.5 | Override acompañantes (warning, no bloqueo) | OK | `companion-separation-warning` 3/3 |
| PP-HU05-05 | Reglas duras (capacidad, incompatibilidad) | OK | assign/move API 409 |

## Validación manual (UI) — pasos 19–24

| # | Paso | Resultado | Notas |
|---|------|-----------|-------|
| 19 | Drag en lista `/distribution` | OK | Pill en mesa destino; fila destino se expande; KPIs actualizados |
| 20 | Drag en plano `/floor-plan/layout` | OK | Panel invitados esquina superior derecha; no tapa canvas |
| 21 | Mesa llena (sin drop) | OK | Zona destino rechaza drop; sin cambio |
| 22 | Separar pareja (warning) | OK | Cambio persiste; aviso amarillo **junto a pills** (fila expandida / panel mesa) |
| 23 | Excel `separar_acompanante` | OK | Cubierto por tests unitarios; sin warning al separar |
| 24 | Incompatibilidad | OK | Bloqueo con mensaje de error (no warning) |

### Iteración UX durante validación

1. **Drag plano:** fix `setActiveGuestDrag` en `distribution-dnd.ts` (payload en `dragover`).
2. **Fase 2b:** de bloqueo pantalla completa → warning inline + persistencia (ADR-022).
3. **Posición aviso:** feedback movido de cabecera de página a zona de pills (`PlacementMutationFeedback` en fila expandida y panel lateral del plano).

## Tests automatizados (2026-06-21)

```powershell
cd apps\api
npm test -- --testPathPatterns="companion-separation-warning|assign-guest-to-proposal|move-guest-in-proposal|unassign-guest-from-proposal"
npm run test:e2e -- --testPathPatterns=distribution.e2e-spec
```

| Suite | Resultado |
|-------|-----------|
| companion-separation-warning | 3/3 OK |
| assign-guest-to-proposal | 4/4 OK |
| move-guest-in-proposal | 4/4 OK |
| unassign-guest-from-proposal | 3/3 OK |
| `distribution.e2e-spec.ts` | 5/5 OK |

## Archivos principales (Fase 2)

**API**

- `move-guest-in-proposal.ts` · `move-guest-in-distribution.use-case.ts`
- `record-distribution-placement-audit.ts` · `finalize-manual-placement-mutation.ts`
- `companion-separation-warning.ts`
- Extensión gobernanza: `distribution_placement_changed`

**Web**

- `distribution-dnd.ts` · `guest-pill.tsx` (draggable)
- `distribution-table-list.tsx` · `floor-plan-layout-view.tsx`
- `placement-mutation-feedback.tsx` · `distribution-mutation-feedback.ts`
- `distribution-events.ts` · `use-event-dashboard.ts`

## Pendiente post-Fase 2

- Commit consolidado Sprint 06 en `main`
- UI historial auditoría (backlog SDD)
- RF-HU05-03.6 asientos S1…Sn en plano (Fase C)

## Referencias

- `evidencias-mej-08-fase1-validacion.md` (PP-HU05-01, 02, 07)
- `sprint-06-cierre.md`
