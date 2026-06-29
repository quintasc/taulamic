# MEJ-12 — Plano Fase B: marcadores compactos de mesa

- **Estado:** Propuesta — **pendiente validación PO** (sin implementar)
- **Tipo:** Mejora UX visual (sin cambio de alcance funcional SDD piloto)
- **Origen:** Revisión PO — mesas demasiado grandes vs accesorios; riesgo de saturación con muchas mesas
- **Guion validación previa:** `guion-validacion-mej-12-propuesta-ui.md`
- **Referencias:** `SDD-01D-importacion-plano-salon.md` § Fase B, `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md` §4.2, ADR-016, `floor-plan-layout-view.tsx`

---

## 1) Principio rector

El plano Fase B es un **mapa de orientación espacial**, no una ficha de detalle por mesa. Las mesas deben leerse como **marcadores compactos** (etiqueta + estado de ocupación por color); el detalle (`n/cap`, invitados, drag de pills) vive en **panel lateral al clic** — patrón ya validado (P-HU05-01).

**Hoy en código:** `TablePreviewCard` ~88–100 px con label + `n/cap`, en `flex-wrap` centrado dentro del salón (`maxPx` 400). Escala mal con 15–25 mesas y desproporciona frente a accesorios (~22 px).

---

## 2) Objetivo

1. **Marcadores compactos** en reposo: solo `M1`/`M2` + color semántico (llena / en uso / vacía).
2. **Un clic** → selección + panel lateral con invitados (mantener SDD; **no** doble clic).
3. **Hover/focus** → tooltip con `n/cap`, forma y estado textual.
4. **Coherencia** con lista Distribución (`tableStatusCardClass`, chips de estado).
5. Preparar terreno para muchas mesas sin cambiar posicionamiento guardado (post-MVP ADR-016).

---

## 3) Fuera de alcance

| Exclusión | Motivo |
|-----------|--------|
| Doble clic (compacto → grande → invitados) | Fricción innecesaria; layout inestable en flex-wrap |
| Ampliar mesa en canvas al seleccionar | El panel lateral ya muestra detalle; evitar reflow |
| Posición por mesa persistida | ADR-016 post-MVP (drag layout) |
| Zoom/pan del canvas | Fase C de MEJ-12 o backlog aparte |
| Asientos numerados S1…Sn | Fase C HU-05 (backlog) |
| Cambiar interacción drag pill entre mesas | MEJ-08 Fase 2 ya implementada |

---

## 4) Estado actual vs propuesto

| Elemento | Hoy | Propuesto |
|----------|-----|-----------|
| Tamaño mesa en canvas | ~88–100 px, forma redonda/rect según mesa | ~40–48 px chip compacto |
| Texto visible | Label + `n/cap` | Solo label; `n/cap` en tooltip |
| Color ocupación | Sí (`tableStatusCardClass`) | Sí (mantener) |
| Clic | 1 clic → panel lateral | **Igual** (sin cambio funcional) |
| Proporción vs accesorios | Mesas dominan visualmente | Marcadores proporcionados al icono ~22 px |
| Capacidad ~20 mesas | Saturación del centro | Mejor densidad (~6×6 teórico en área útil) |

---

## 5) Alcance propuesto (fases)

### Fase A — Documentación (validar primero)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-12-A1 | § Plano ampliado en `guia-estilo-taulamic.md` | Marcador compacto; 1 clic → panel; tooltip |
| MEJ-12-A2 | Referencia cruzada SDD-01D § Fase B | Alineado con propuesta |

**Gate:** PO aprueba `guion-validacion-mej-12-propuesta-ui.md` antes de código.

### Fase B — Marcadores compactos (P1)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-12-B1 | `TablePreviewCard` modo compact | ~44 px; label bold; sin `n/cap` en chip |
| MEJ-12-B2 | Tooltip accesible | `title` + `aria-label` con `n/cap` y estado |
| MEJ-12-B3 | Selección | Ring primary; panel lateral sin cambios |
| MEJ-12-B4 | DnD pills | Target drop ≥44 px; drop highlight actual |
| MEJ-12-B5 | Leyenda opcional bajo plano | Llena / En uso / Vacía (decisión PO en guion) |

### Fase C — Densidad avanzada (P2, post-piloto opcional)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-12-C1 | Grid auto en inset del salón | Mejor empaquetado que flex-wrap puro |
| MEJ-12-C2 | Zoom +/- en canvas | Eventos con 25+ mesas legibles |
| MEJ-12-C3 | Posiciones mesa persistidas | Depende ADR-016 Fase B layout guardado |

---

## 6) Criterios de aceptación globales (Fase B)

1. Chip de mesa ocupa **≤50 px** en eje mayor (piloto).
2. Color de ocupación idéntico a semántica Distribución.
3. **Un clic** abre/cierra panel invitados (P-HU05-01 sin regresión).
4. Tooltip o `aria-label` incluye `{assigned}/{capacity}`.
5. Con 12 mesas de prueba en salón rectangular estándar, ninguna mesa queda cortada fuera del perímetro visible del canvas.
6. Drag pill invitado → otra mesa sigue funcionando (MEJ-08).

---

## 7) Alternativa descartada (registro)

**Propuesta PO inicial:** clic 1 amplía mesa al tamaño actual; clic 2 muestra invitados.

**Motivo descarte:** añade paso sin beneficio (panel ya detalla); desplaza mesas vecinas en flex-wrap; peor accesibilidad. Documentado para no reabrir sin nueva evidencia.

---

## 8) Relación con otros MEJ / ADR

| Referencia | Relación |
|------------|----------|
| MEJ-08 | Drag pills plano — no regresionar |
| MEJ-10 | Chips/pills visuales — reutilizar tokens |
| ADR-016 | Posicionamiento mesas post-MVP |
| SDD-01D §5–6 | Fase B: color ocupación, panel al clic |

---

## 9) Estimación sugerida

| Fase | Esfuerzo | Prioridad |
|------|----------|-----------|
| A Documentación | S | P0 |
| B Marcadores compactos | S | P1 |
| C Densidad/zoom | M | P2 |

---

## 10) Historial

| Fecha | Evento |
|-------|--------|
| 2026-06-21 | Propuesta documentada (feedback PO plano + valoración técnica UX) |
