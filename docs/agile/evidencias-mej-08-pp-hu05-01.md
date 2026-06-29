# MEJ-08 — PP-HU05-01 Desasignar (✕ en pill)

- **Fecha validacion:** 2026-06-29
- **Issue:** [#51](https://github.com/quintasc/taulamic/issues/51) (parcial — solo PP-HU05-01)
- **Commit:** `b79789d`
- **SDD:** `docs/sdd/SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md` · RF-HU05-01
- **Guion:** `docs/agile/guion-validacion-mej-08-ui.md`

## Criterios de aceptacion

| # | Criterio SDD | Evidencia |
|---|--------------|-----------|
| 1 | ✕ visible en pills (Distribucion expandida y panel plano) | Validacion manual UI 2026-06-29 — **OK** |
| 2 | Al pulsar ✕: invitado a `unassignedGuestIds`; desaparece de mesa | Validacion manual UI — **OK** · E2E `desasigna un invitado en borrador y actualiza estadisticas` |
| 3 | Solo en propuesta `draft` | Validacion manual UI — **OK** (sin ✕ tras confirmar) |
| 4 | Mesa recalcula estado (Vacia / En uso) | Validacion manual UI — **OK** |

## Validacion automatizada

| Suite | Resultado |
|-------|-----------|
| `unassign-guest-from-proposal.spec.ts` | 3/3 OK |
| `distribution.e2e-spec.ts` (incl. unassign) | 3/3 OK |

Comando usado (Jest 30+):

```powershell
cd apps\api
npm test -- --testPathPatterns=unassign-guest-from-proposal
npm run test:e2e -- --testPathPatterns=distribution.e2e-spec
```

## Validacion manual (UI)

Ejecutada por PO/desarrollo en entorno local (`npm run dev`, web `:3001`, API `:3000`).

| Paso guion | Descripcion | Resultado |
|------------|-------------|-----------|
| 1–2 | ✕ en lista Distribucion; desasignar | OK |
| 3–4 | ✕ en plano Fase B; desasignar | OK |
| 5–6 | Solo borrador; sin ✕ tras confirmar | OK |

**Resultado global PP-HU05-01:** **APROBADO**

## Implementacion (referencia)

- API: `POST /api/v1/events/:eventId/distribution/placements/:guestId/unassign`
- Web: `GuestPill` removible; `distribution-view` con `guestId`; paginas Distribucion y Plano layout

## Pendiente MEJ-08 Fase 1

- PP-HU05-02 — Asignar (+)
- PP-HU05-04 — KPIs dashboard (completo)
- PP-HU05-05 — Reglas duras en asignacion
- PP-HU05-07 — Lista sin asignar (KPI)
