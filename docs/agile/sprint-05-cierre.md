# Sprint 05 — Cierre y registro de entregas

- **Inicio:** 2026-06-28
- **Cierre documental:** 2026-06-29
- **Rama:** `main` @ **`18e2615`**
- **Origen feedback:** `evidencias-piloto/sesion-2026-06-24.md` (MEJ-02, MEJ-08)
- **Plan:** `sprint-05-plan.md`

## 1) Resumen ejecutivo

Sprint 05 entregó MEJ-02 (plantilla Excel ampliada e iconos en Invitados v2) y MEJ-08 Fase 1 (ajuste manual HU-05: desasignar, asignar y lista sin asignar). Validación manual PO 2026-06-29.

| Ámbito | Entregado |
|--------|-----------|
| Excel v1 (`menu_especial`, `movilidad_reducida`, `notas_internas`) | ✅ |
| Iconos 🌾 / ♿ tras import | ✅ |
| IA sobre `notas_internas` (sin autoaplicar) | ✅ |
| ✕ desasignar invitado (Distribución + plano) | ✅ |
| + asignar desde bolsa sin asignar | ✅ |
| Lista sin asignar (clic KPI Dashboard / Distribución) | ✅ |
| Reglas duras en assign API (capacidad, acompañantes, incompatibilidad) | ✅ |

## 2) Issues cerradas

| Issue | MEJ | Descripción |
|-------|-----|-------------|
| [#45](https://github.com/quintasc/taulamic/issues/45) | MEJ-02 | Plantilla Excel ampliada + UI invitados |
| [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 | Distribución manual HU-05 Fase 1 |

## 3) Commits de referencia

| MEJ | Commits |
|-----|---------|
| MEJ-02 | `ae1a1fb`, `a106257`, `374427b` |
| MEJ-08 | `b79789d`, `5ab009b`, `15adca6`, `6bfbe1a`, `18e2615` |

## 4) Archivos principales

**MEJ-02:** guest-import API/web, `especificacion-plantilla-excel-v1.md`

**MEJ-08:**
- `apps/api/src/distribution/domain/unassign-guest-from-proposal.ts`
- `apps/api/src/distribution/domain/assign-guest-to-proposal.ts`
- `apps/web/src/components/admin/distribution/guest-pill.tsx`
- `apps/web/src/components/admin/distribution/assign-guest-dialog.tsx`
- `apps/web/src/components/admin/distribution/unassigned-guests-list-dialog.tsx`

## 5) Validación

- API unitarios assign/unassign: **7/7** ✅
- API e2e `distribution.e2e-spec.ts`: **4/4** ✅
- Validación manual UI (`guion-validacion-mej-08-ui.md`) ✅ (2026-06-29)

Evidencias: `evidencias-mej-02-cierre.md`, `evidencias-mej-08-fase1-validacion.md`

## 6) Fuera de alcance (post Sprint 05)

- PP-HU05-03 drag invitado entre mesas (Fase 2)
- PP-HU05-06 auditoría cambios manuales (Fase 2)
- Pantalla UI sugerencias IA
- #53 Organizador real julio 2026

## 7) Backlog siguiente

- MEJ-08 Fase 2 (drag, auditoría) cuando se priorice
- #53 Organizador real
- Sprint 06 (por planificar)
