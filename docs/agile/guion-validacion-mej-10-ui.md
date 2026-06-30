# Guion de validación manual — MEJ-10 cohesión UI (post-implementación)

- **Estado:** Validado PO — 2026-06-21
- **Precondición:** Implementación MEJ-10 en `main` @ `6645bef`
- **Spec:** `MEJ-10-cohesion-ui-feedback-y-tablas.md`
- **Entorno:** API `:3000`, Web `:3001`
- **Evidencias:** `evidencias-mej-10-validacion.md`

> Este guion valida **regresiones y criterios visuales** tras el desarrollo. La aprobación de alcance es el guion de **propuesta**.

---

## B — Feedback contextual (Fase B)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 1 | Distribución → separar pareja (warning) | Mensaje junto a pills; **misma paleta** que `Alert` warning en otra pantalla | [x] |
| 2 | Plano → mismo caso | Warning en panel invitados; plano visible | [x] |
| 3 | Distribución → error 409 (mesa llena) | Error contextual en fila/panel; no banner global duplicado | [x] |

---

## C — Mesas (Fase C)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 4 | Editar etiqueta → vacía → Guardar | Mensaje **bajo el input**; sin toast error | [x] |
| 5 | Editar etiqueta → duplicada | Igual que #4 | [x] |
| 6 | Eliminar mesa con invitados asignados | `ConfirmDialog` modal; no `window.confirm` nativo | [x] |
| 7 | Añadir mesa con éxito | Toast éxito; fila en tabla | [x] |

---

## D — Chips (Fase D)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 8 | Invitados → chip filtro activo | Mismo estilo que Distribución/plano (variante PO elegida) | [x] |
| 9 | Distribución → chips estado mesa | Coherente con #8 | [x] |

---

## E — Tablas (Fase E, si aplica)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 10 | Mesas ↔ Invitados cabecera | Tipografía thead consistente | [x] |
| 11 | Mesas hover fila | Hover suave si Fase E aprobada | [x] |

---

## Smoke — sin regresión

| # | Pantalla | OK |
|---|----------|-----|
| 12 | Config | [x] |
| 13 | Invitados (alta, filtro, eliminar) | [x] |
| 14 | Afinidades | [x] |
| 15 | MEJ-08 pasos 19–24 (drag + warning) | [x] |

---

## Evidencias

`evidencias-mej-10-validacion.md`
