# MEJ-12 — Validación manual (Plano Fase B)

- **Spec:** `MEJ-12-plano-marcadores-compactos.md`
- **Guion:** `guion-validacion-mej-12-ui.md`
- **Commit:** `fdc8373`
- **Entorno:** API `:3000` · Web `:3001`
- **Validación manual:** 2026-06-21 — **APROBADO** (PO)

## Resumen

| Bloque | Código | Manual PO |
|--------|--------|-----------|
| B Marcadores compactos | ✅ | ✅ pasos 1–4 |
| C Interacción | ✅ | ✅ pasos 5–7 |
| D Densidad 12+ mesas | ✅ | ✅ paso 8 |
| Smoke filtros | ✅ | ✅ pasos 9–10 |

## B — Marcadores

| # | Paso | Implementación | Manual |
|---|------|----------------|--------|
| 1 | 2+ mesas visibles M1/M2 | Marcadores compactos con borde blanco | [x] PO |
| 2 | Balance con accesorios | Distribución default accesorios perimetral | [x] PO |
| 3 | Tooltip n/cap | `tableMarkerTooltip()` | [x] PO |
| 4 | Colores ocupación | `tableStatusDotClass` alineado Distribución | [x] PO |

## C — Interacción

| # | Paso | Notas | Manual |
|---|------|-------|--------|
| 5 | Clic mesa → panel | Panel lateral invitados | [x] PO |
| 6 | Toggle mismo clic | Cierra panel | [x] PO |
| 7 | Drag pill | Sin regresión MEJ-08 | [x] PO |

## D — Densidad

| # | Paso | Notas | Manual |
|---|------|-------|--------|
| 8 | 12+ mesas | Canvas escala; sin recorte | [x] PO |

## Smoke

| # | Comprobación | Manual |
|---|--------------|--------|
| 9 | Filtros estado/forma | [x] PO |
| 10 | Volver a distribución | [x] PO |

## Cierre

- [x] PO valida `/floor-plan/layout` con distribución existente
