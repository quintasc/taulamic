# MEJ-13 — Validación manual (Microcopy)

- **Spec:** `MEJ-13-auditoria-microcopy-y-ayudas.md`
- **Inventario:** `inventario-microcopy-ui.md`
- **Guion:** `guion-validacion-mej-13-ui.md`
- **Commit:** `1d3db89`, `a4fee82`
- **Validación manual:** 2026-06-21 — **APROBADO** (PO)

## Resumen

| Bloque | Código / grep | Manual PO |
|--------|---------------|-----------|
| Claridad | ✅ | ✅ pasos 1–3 |
| Responsive | ✅ | ✅ pasos 4–5 |

## Claridad

| # | Comprobación | Evidencia estática | Manual |
|---|--------------|-------------------|--------|
| 1 | Botón Distribución comprensible | `PageHeader` + contexto pantalla; corto «Confirmar» solo `< md` | [x] PO |
| 2 | Bloqueados explicados | Tarjetas, colaborativo, matriz afinidades mantienen copy | [x] PO |
| 3 | Sin «piloto julio» obsoleto | grep admin: solo `nav-map` (mapa dev, diferido) | [x] PO |

## Responsive

| # | Viewport `< md` | Código | Manual |
|---|----------------|--------|--------|
| 4 | Etiquetas cortas | Confirmar / Calcular / Ver plano | [x] PO |
| 5 | aria-label completo | DevTools inspección a11y | [x] PO |

## Strings clave verificados

| Antes | Después | Archivo |
|-------|---------|---------|
| Piloto julio… | En el piloto actual… | `event-config-view.tsx` |
| Comparador Top-K — post-piloto | …próximamente | `distribution-calculated-view.tsx` |
| Posicionar drag post-MVP | (eliminado) | `floor-plan-setup-view.tsx` |
| Párrafo autoguardado Config | (eliminado) | `event-config-view.tsx` |

## Cierre

- [x] PO revisa Distribución y Plano en viewport estrecho
- [ ] Opcional: actualizar copy `nav-map` en sprint futuro
