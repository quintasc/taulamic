# MEJ-02 — Cierre (#45)

- **Fecha cierre:** 2026-06-21
- **Issue:** [#45](https://github.com/quintasc/taulamic/issues/45)
- **Commits:** `ae1a1fb` (implementación) · `a106257` (solo plantilla v1 + IA en `notas_internas`)
- **Especificación:** `docs/product/especificacion-plantilla-excel-v1.md`

## Criterios de aceptación

| # | Criterio | Evidencia |
|---|----------|-----------|
| 1 | Plantilla con `menu_especial`, `movilidad_reducida`, `notas_internas` | E2E `descarga plantilla xlsx con contrato de columnas v1` · `GUEST_TEMPLATE_DOWNLOAD_COLUMNS` |
| 2 | Solo plantilla v1 (sin columna `observaciones`) | Validator rechaza headers legacy (XLS-001) · `guest-row.validator.spec.ts` |
| 3 | Tras import, iconos 🌾 / ♿ en Invitados v2 | `detailMetaByCorreo` en API · `use-guests-page.ts` · `guests-panel-v2.tsx` |
| 4 | `notas_internas` → drawer; IA sobre notas (afinidad/incompatibilidad/intolerancia) | Mapper + E2E sugerencias desde `notas_internas` · sin autoaplicar |

## Validación automatizada

- API unitarios guest-import: **32/32** OK
- API e2e `guest-import`: **15/15** OK
- Pilot flow e2e: incluye columnas MEJ-02

## Validación manual recomendada (UI)

1. Descargar plantilla → comprobar columnas MEJ-02 (sin `observaciones`).
2. Importar filas con `menu_especial` = `X` y `movilidad_reducida` = `X` → iconos en tabla.
3. `notas_internas` con texto → visible en drawer «Notas internas».

## Fuera de alcance (post-piloto / otro issue)

- Pantalla UI para revisar sugerencias IA (API operativa).
- Matriz de afinidades derivada de IA (MEJ-08 / afinidades).
