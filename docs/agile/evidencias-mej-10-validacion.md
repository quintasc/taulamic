# MEJ-10 — Validación manual (cohesión UI)

- **Spec:** `MEJ-10-cohesion-ui-feedback-y-tablas.md`
- **Guion:** `guion-validacion-mej-10-ui.md`
- **Commit:** `4890625` (+ pre-trabajo `bab758c` Fase B)
- **Entorno:** API `:3000` · Web `:3001`
- **Validación manual:** 2026-06-21 — **APROBADO** (PO)

## Resumen

| Bloque | Código / estático | Manual PO |
|--------|-------------------|-----------|
| B Feedback contextual | ✅ | ✅ pasos 1–3 |
| C Mesas | ✅ | ✅ pasos 4–7 |
| D Chips outline | ✅ | ✅ pasos 8–9 |
| E Tablas | ✅ | ✅ pasos 10–11 |
| Smoke | ✅ | ✅ pasos 12–15 |

## B — Feedback contextual

| # | Paso | Auto / código | Manual |
|---|------|---------------|--------|
| 1 | Warning separar pareja (Distribución) | `PlacementMutationFeedback` usa `feedbackSurfaceClass.warning` + `rounded-xl` | [x] PO |
| 2 | Mismo caso en plano | Feedback en panel lateral (`floor-plan-layout-view`) | [x] PO |
| 3 | Error 409 mesa llena | Contextual en fila/panel; sin `Alert` global duplicado | [x] PO |

## C — Mesas

| # | Paso | Auto / código | Manual |
|---|------|---------------|--------|
| 4 | Etiqueta vacía | `validateTableLabel` → texto bajo input; sin `toast.error` rename | [x] PO |
| 5 | Etiqueta duplicada | Idem «Ya existe otra mesa…» | [x] PO |
| 6 | Eliminar con invitados | `ConfirmDialog` en `tables-setup-view`; **0** usos `window.confirm` en `apps/web/src` | [x] PO |
| 7 | Añadir mesa éxito | `toast.success` en hook | [x] PO |

## D — Chips

| # | Paso | Auto / código | Manual |
|---|------|---------------|--------|
| 8 | Invitados filtro activo | `filterChipClass` outline (`primary-500/10`) | [x] PO |
| 9 | Distribución / plano | Misma función en `semantic-ui.ts` | [x] PO |

## E — Tablas (Fase E parcial)

| # | Paso | Auto / código | Manual |
|---|------|---------------|--------|
| 10 | thead Mesas | `text-xs uppercase text-neutral-500` | [x] PO |
| 11 | Hover fila Mesas | `hover:bg-neutral-50/80` | [x] PO |

## Smoke

| # | Pantalla | E2E / notas | Manual |
|---|----------|-------------|--------|
| 12 | Config | E2E: bloqueo nombre + autoguardado OK | [x] PO |
| 13 | Invitados | E2E: alta manual OK | [x] PO |
| 14 | Afinidades | — | [x] PO |
| 15 | MEJ-08 19–24 | Reconfirmado en sesión Sprint 07 | [x] PO |

## Tests automatizados (2026-06-21)

| Test | Resultado |
|------|-----------|
| A–G flujo completo | ❌ timeout plano → mesas (no bloquea cierre PO) |
| Patrones UX alta manual | ✅ |
| Tarjetas bloqueado | ✅ |

## Cierre

- [x] PO marca OK manual en guion §B–E
- [ ] Investigar E2E plano → mesas (backlog técnico)
