# Sesión 2026-07-02 — Plano: corrección bug 3×3, escalado y UX

- **Tipo:** corrección de regresión + mejora UX (sin cambio SDD)
- **Commits:** `1e74d45`, `c4c55a4`
- **Sprint:** 10 (continuación)

---

## Problema raíz detectado

El commit `4d42bdb` introdujo un `useEffect` con `fitLimits` como dependencia espuria.
`fitLimits` depende de `setup`, lo que creaba un bucle:

```
setup → fitLimits → efecto clamp → setSetup → setup → ...
```

En cada iteración `useRoomCanvasBounds` recalculaba los bounds según el aspecto
actual del salón, reduciendo `maxAlongX`/`maxAlongY` hasta alcanzar `MIN_DIMENSION_M = 3`.
Resultado: salones guardados como 3 × 3 m en la API.

---

## Entregas `1e74d45` — fix: plano escalado y límites lógicos

| Cambio | Archivos |
|--------|----------|
| Elimina efecto auto-clamp: `roomPixelSizeFit` escala visualmente sin alterar medidas | `floor-plan-setup-view.tsx` |
| `updateSetup` usa `normalizeSetupForShape` (no `clampSetupToFitLimits`) | `floor-plan-setup-view.tsx` |
| `handleShapeChange` y `applyRecommendedSize` sin clamping de canvas | `floor-plan-setup-view.tsx` |
| Nueva `computeLogicalRoomLimits(guestCount, setup)` — mínimos hiperbólicos | `room-size-recommendation.ts` |
| `fieldLimits`: inputs admiten hasta 200 m (no limitados por tamaño de pantalla) | `floor-plan-setup-view.tsx` |
| Nueva `isRoomAtVisualMax(setup, fitLimits)` — detecta tope visual | `floor-plan-setup.ts` |
| Aviso "Límite visual alcanzado" en canvas y sidebar desktop | `floor-plan-setup-view.tsx` |
| Mensaje "Tamaño mínimo para los invitados actuales" al llegar al mín. lógico | `room-dimension-fields.tsx` |
| Escala redondo/ovalado: `roomPixelSizeFit` usa `budget` directamente (no interpolación lineal) | `floor-plan-setup.ts` |
| `MobileHorizontalScroll`: flechas ‹ › siempre visibles; `disabled` según posición scroll | `mobile-horizontal-scroll.tsx` |

### Detalle bug escala forma redonda

`roundDiameterPx(radiusM, budget)` interpolaba linealmente entre 120 y `budget` px
en el rango [3 m, 200 m]. Para un radio típico de recomendación (≈9 m):

```
t = (9 − 3) / (200 − 3) ≈ 0.03
diameterPx ≈ 120 + 0.03 × (380 − 120) = 128 px   ← de 380 disponibles
```

Rectangular, en cambio, siempre llenaba `availW` (≈380 px).
Solución: `diameterPx = Math.max(120, budget)` igual que rectangular llena `availW`.

---

## Entregas `c4c55a4` — feat: plano desktop paleta accesorios y UX botones

| Cambio | Archivos |
|--------|----------|
| Paleta horizontal de accesorios desktop entre alert y canvas (chips scrollables) | `floor-plan-setup-view.tsx` |
| Botón ↻ "Volver al tamaño recomendado" junto al texto de dimensiones bajo canvas | `floor-plan-setup-view.tsx` |
| Botón ✕ "Limpiar plano" al final de la paleta desktop | `floor-plan-setup-view.tsx` |
| Tarjeta "Accesorios" del sidebar desktop eliminada (reemplazada por paleta) | `floor-plan-setup-view.tsx` |
| `AccessoryChip` exportado y reutilizado en desktop | `floor-plan-mobile-controls.tsx` |
| Tooltips en botones móvil: "Limpiar plano" y "Volver al tamaño recomendado" | `floor-plan-mobile-controls.tsx` |

---

## Estado tras la sesión

- Bug 3×3 corregido; los eventos afectados (p.ej. `evt_13143c15`) tienen datos persistidos con 3×3 y deben corregirse manualmente desde la UI.
- Plano desktop y móvil muestran dimensiones recomendadas al cargar (sin clamping a canvas).
- Escala consistente entre formas rectangular, redonda y ovalada.
- Paleta de accesorios horizontal en desktop; accesorios móvil con flechas de navegación.

## Pendiente

- Corregir manualmente los room-setup guardados como 3×3 en los eventos de prueba.
- Validación PO visual de la pantalla Plano en desktop y móvil.
- `sprint-10-plan.md` ítems PLAN-01..03 ya cubiertos; los nuevos de hoy añadidos.
