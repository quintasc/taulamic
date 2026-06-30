# Guion de validación manual — MEJ-13 Microcopy (post-implementación)

- **Estado:** Validado PO — 2026-06-21
- **Precondición:** Inventario `inventario-microcopy-ui.md` · implementación `1d3db89`
- **Spec:** `MEJ-13-auditoria-microcopy-y-ayudas.md`
- **Evidencias:** `evidencias-mej-13-validacion.md`

---

## Claridad

| # | Comprobación | OK |
|---|--------------|-----|
| 1 | Botón primario de Distribución comprensible sin leer subtítulo | [x] |
| 2 | Funcionalidad bloqueada (Tarjetas, colaborativo) sigue explicada | [x] |
| 3 | Sin referencias «piloto julio» obsoletas acordadas | [x] |

---

## Responsive

| # | Viewport `< md` | OK |
|---|----------------|-----|
| 4 | Etiquetas cortas acordadas visibles | [x] |
| 5 | `aria-label` / tooltip con texto completo (inspección a11y) | [x] |

---

## Fase D — Centralización (post `fa6603e`)

| # | Comprobación | OK |
|---|--------------|-----|
| 6 | Copy en pantalla coincide con `ui-copy.ts` (Config hint, Distribución botones) | [x] E2E |
| 7 | Sin strings duplicados en archivos cableados (smoke grep) | [x] E2E |

---

## Evidencias

`evidencias-mej-13-validacion.md`
