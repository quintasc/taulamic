# MEJ-08 — Fase 1 validación manual (HU-05)

- **Issue:** [#51](https://github.com/quintasc/taulamic/issues/51)
- **SDD:** `docs/sdd/SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`
- **Guion:** `docs/agile/guion-validacion-mej-08-ui.md`
- **Validación manual:** 2026-06-29 — **APROBADO** (PP-HU05-01, 02, 07)

## Commits de referencia

| Commit | Entrega |
|--------|---------|
| `b79789d` | PP-HU05-01 — ✕ desasignar |
| `5ab009b` | PP-HU05-02 — + asignar |
| `15adca6` | Docs PP-HU05-01 |
| `6bfbe1a` | PP-HU05-07 — lista sin asignar (KPI) + docs Fase 1 |

## Resumen por criterio

| ID | Descripción | Manual | Automatizado |
|----|-------------|--------|--------------|
| PP-HU05-01 | ✕ desasignar | OK | `unassign-guest-from-proposal` 3/3 · e2e unassign |
| PP-HU05-02 | + asignar desde bolsa | OK | `assign-guest-to-proposal` 4/4 · e2e assign |
| PP-HU05-04 | KPIs coherentes | OK parcial | Dashboard hint + distribución/plano sin recargar |
| PP-HU05-05 | Reglas duras | OK en asignar | Capacidad, acompañantes, incompatibilidad en API assign |
| PP-HU05-07 | Lista sin asignar (clic KPI) | OK | — |

Detalle PP-HU05-01: `evidencias-mej-08-pp-hu05-01.md`.

## Validación manual (UI)

Entorno: `npm run dev` · API `:3000` · Web `:3001`.

| Área | Pasos | Resultado |
|------|-------|-----------|
| Desasignar ✕ | Distribución + plano; solo borrador | OK |
| Asignar + | Selector invitados; mesa llena sin + | OK |
| Lista sin asignar | Clic KPI Dashboard y Distribución | OK |
| KPIs | Hint «X de Y · Z sin asignar» tras cambios | OK |

## Tests automatizados (2026-06-29)

```powershell
cd apps\api
npm test -- --testPathPatterns="assign-guest-to-proposal|unassign-guest-from-proposal"
npm run test:e2e -- --testPathPatterns=distribution.e2e-spec
```

| Suite | Resultado |
|-------|-----------|
| assign + unassign unitarios | 7/7 OK |
| `distribution.e2e-spec.ts` | 4/4 OK |

## Pendiente para cierre #51

- ~~Cierre issue + `sprint-05-cierre.md`~~ ✅ 2026-06-29 (Fase 1)
- Fase 2 + 2b: `evidencias-mej-08-fase2-validacion.md` · `sprint-06-cierre.md` ✅ 2026-06-21

**Issue #51:** Fase 1 cerrada 2026-06-29. Fase 2 validada — pendiente cierre issue tras commit Sprint 06.

## Fuera de alcance Sprint 05

- PP-HU05-03 drag entre mesas (Fase 2)
- PP-HU05-06 auditoría (Fase 2)
