# MEJ-11 — Validación manual (Dashboard)

- **Spec:** `MEJ-11-dashboard-navegacion-y-atajos.md`
- **Guion:** `guion-validacion-mej-11-ui.md`
- **Commit:** `4890625`, `8a79138`
- **Entorno:** API `:3000` · Web `:3001`
- **Validación manual:** 2026-06-21 — **APROBADO** (PO)

## Resumen

| Bloque | Código | Manual PO |
|--------|--------|-----------|
| B CTA contextual | ✅ | ✅ pasos 1–3 |
| C Checklist | ✅ | ✅ pasos 4–6 |
| D Accesos rápidos | ✅ eliminados | N/A (decisión PO) |
| Smoke KPIs | ✅ | ✅ pasos 9–10 |

## B — CTA contextual

| # | Paso | Código | Manual |
|---|------|--------|--------|
| 1 | Sin nombre → Config | CTA `Siguiente: Definir evento` → `/config` | [x] PO |
| 2 | Config OK, sin invitados | `getNextIncompleteSetupStep` → Invitados | [x] PO |
| 3 | Tras completar paso | CTA avanza al siguiente incompleto | [x] PO |

## C — Checklist (`SetupJourney`)

| # | Paso | Código | Manual |
|---|------|--------|--------|
| 4 | Clic Config | `getSetupStepHref` → `/config` | [x] PO |
| 5 | Clic Invitados | href `/guests` | [x] PO |
| 6 | Tarjetas bloqueada | `step.locked` → sin `href`; icono candado | [x] PO |

## D — Accesos rápidos

**Decisión PO Sprint 07:** `QuickAccessCard` eliminado. Pasos 7–8 del guion original **N/A**.

| # | Guion original | Resultado |
|---|----------------|-----------|
| 7–8 | Responsive accesos rápidos | [x] N/A — sustituido por eliminación |

## Smoke

| # | Comprobación | Código | Manual |
|---|--------------|--------|--------|
| 9 | KPIs tras mutación distribución | `use-event-dashboard` + evento global | [x] PO |
| 10 | Sidebar | Sin cambios funcionales | [x] PO |

## Tests E2E relacionados

- Tarjetas bloqueado: ✅ `pilot-flow.spec.ts` «C: paso Tarjetas bloqueado»

## Cierre

- [x] PO valida CTA y checklist en evento real
