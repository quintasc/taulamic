# Guion de validación manual — MEJ-12 Plano Fase B (post-implementación)

- **Estado:** Listo para validación manual PO
- **Precondición:** Implementación MEJ-12 en `main` @ `6645bef`
- **Spec:** `MEJ-12-plano-marcadores-compactos.md`

---

## B — Marcadores compactos

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 1 | Abrir plano con 2+ mesas | Chips pequeños; label M1/M2 visible | [ ] |
| 2 | Comparar con accesorios | Mesas no dominan visualmente el salón | [ ] |
| 3 | Hover/focus en mesa | Tooltip o aria con `n/cap` y estado | [ ] |
| 4 | Colores | Llena / en uso / vacía coherentes con Distribución | [ ] |

---

## C — Interacción

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 5 | Clic en mesa | Panel lateral invitados | [ ] |
| 6 | Segundo clic misma mesa | Panel se cierra (toggle) | [ ] |
| 7 | Drag pill a otra mesa | Mueve invitado; sin regresión MEJ-08 | [ ] |

---

## D — Densidad (si evento de prueba con muchas mesas)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 8 | 12+ mesas en salón estándar | Ninguna mesa cortada fuera del perímetro | [ ] |

---

## Smoke

| # | Comprobación | OK |
|---|--------------|-----|
| 9 | Filtros estado/forma siguen funcionando | [ ] |
| 10 | «Volver a distribución» sin cambios | [ ] |

---

## Evidencias

Documentar en `evidencias-mej-12-validacion.md` (crear al cerrar).
