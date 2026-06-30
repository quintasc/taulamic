# Guion de validación manual — MEJ-12 Plano Fase B (post-implementación)

- **Estado:** Validado PO — 2026-06-21
- **Precondición:** Implementación MEJ-12 en `main` @ `6645bef`
- **Spec:** `MEJ-12-plano-marcadores-compactos.md`
- **Evidencias:** `evidencias-mej-12-validacion.md`

---

## B — Marcadores compactos

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 1 | Abrir plano con 2+ mesas | Chips pequeños; label M1/M2 visible | [x] |
| 2 | Comparar con accesorios | Mesas no dominan visualmente el salón | [x] |
| 3 | Hover/focus en mesa | Tooltip o aria con `n/cap` y estado | [x] |
| 4 | Colores | Llena / en uso / vacía coherentes con Distribución | [x] |

---

## C — Interacción

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 5 | Clic en mesa | Panel lateral invitados | [x] |
| 6 | Segundo clic misma mesa | Panel se cierra (toggle) | [x] |
| 7 | Drag pill a otra mesa | Mueve invitado; sin regresión MEJ-08 | [x] |

---

## D — Densidad (si evento de prueba con muchas mesas)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 8 | 12+ mesas en salón estándar | Ninguna mesa cortada fuera del perímetro | [x] |

---

## Smoke

| # | Comprobación | OK |
|---|--------------|-----|
| 9 | Filtros estado/forma siguen funcionando | [x] |
| 10 | «Volver a distribución» sin cambios | [x] |

---

## Evidencias

`evidencias-mej-12-validacion.md`
