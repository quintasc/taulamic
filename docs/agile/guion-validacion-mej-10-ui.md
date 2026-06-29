# Guion de validación manual — MEJ-10 cohesión UI (post-implementación)

- **Estado:** Borrador — **no usar** hasta completar implementación MEJ-10
- **Precondición:** `guion-validacion-mej-10-propuesta-ui.md` aprobado por PO
- **Spec:** `MEJ-10-cohesion-ui-feedback-y-tablas.md`
- **Entorno:** API `:3000`, Web `:3001`

> Este guion valida **regresiones y criterios visuales** tras el desarrollo. La aprobación de alcance es el guion de **propuesta**.

---

## B — Feedback contextual (Fase B)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 1 | Distribución → separar pareja (warning) | Mensaje junto a pills; **misma paleta** que `Alert` warning en otra pantalla | [ ] |
| 2 | Plano → mismo caso | Warning en panel invitados; plano visible | [ ] |
| 3 | Distribución → error 409 (mesa llena) | Error contextual en fila/panel; no banner global duplicado | [ ] |

---

## C — Mesas (Fase C)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 4 | Editar etiqueta → vacía → Guardar | Mensaje **bajo el input**; sin toast error | [ ] |
| 5 | Editar etiqueta → duplicada | Igual que #4 | [ ] |
| 6 | Eliminar mesa con invitados asignados | `ConfirmDialog` modal; no `window.confirm` nativo | [ ] |
| 7 | Añadir mesa con éxito | Toast éxito; fila en tabla | [ ] |

---

## D — Chips (Fase D)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 8 | Invitados → chip filtro activo | Mismo estilo que Distribución/plano (variante PO elegida) | [ ] |
| 9 | Distribución → chips estado mesa | Coherente con #8 | [ ] |

---

## E — Tablas (Fase E, si aplica)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 10 | Mesas ↔ Invitados cabecera | Tipografía thead consistente | [ ] |
| 11 | Mesas hover fila | Hover suave si Fase E aprobada | [ ] |

---

## Smoke — sin regresión

| # | Pantalla | OK |
|---|----------|-----|
| 12 | Config | [ ] |
| 13 | Invitados (alta, filtro, eliminar) | [ ] |
| 14 | Afinidades | [ ] |
| 15 | MEJ-08 pasos 19–24 (drag + warning) | [ ] |

---

## Evidencias

Documentar en `evidencias-mej-10-validacion.md` (crear al cerrar).
