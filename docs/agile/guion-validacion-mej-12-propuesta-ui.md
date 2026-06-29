# Guion — Validación previa propuesta MEJ-12 (Plano Fase B)

- **Estado:** Pendiente validación PO
- **Tipo:** Aprobación de **propuesta** — no requiere implementación
- **Spec:** `MEJ-12-plano-marcadores-compactos.md`
- **Implementación:** **bloqueada** hasta marcar este guion como aprobado

---

## Preparación

- [ ] Leer `MEJ-12-plano-marcadores-compactos.md`
- [ ] Abrir «Ver mesas en plano» con distribución calculada (2+ mesas)
- [ ] Comparar tamaño mesa vs accesorios en Fase A del mismo evento

---

## A — Principio mapa vs detalle (obligatorio)

| # | Pregunta | Respuesta esperada | OK PO |
|---|----------|-------------------|-------|
| A1 | ¿El plano debe mostrar mesas **compactas** (solo M1 + color) en reposo? | Sí | [ ] |
| A2 | ¿El detalle (`n/cap`, invitados) va en **panel lateral al clic** (como ahora)? | Sí | [ ] |
| A3 | ¿Rechazamos doble clic (ampliar → invitados)? | Sí (recomendado) | [ ] |

---

## B — Marcador compacto (Fase B)

| # | Propuesta | ¿Aprobar? | OK PO |
|---|-----------|-----------|-------|
| B1 | Chip ~44 px; solo etiqueta mesa + color ocupación | | [ ] |
| B2 | `n/cap` visible en tooltip / hover, no en chip | | [ ] |
| B3 | Leyenda de colores bajo el plano | [ ] Sí · [ ] No | |

**Notas PO:** _[opcional]_

---

## C — Interacción (sin cambio funcional)

| # | Comportamiento | OK PO |
|---|----------------|-------|
| C1 | 1 clic mesa → panel invitados (toggle cerrar) | [ ] |
| C2 | Drag pill entre mesas en plano sigue igual | [ ] |

---

## D — Densidad futura (Fase C, opcional)

| # | Decisión | Elección PO |
|---|----------|-------------|
| D1 | ¿Priorizar zoom/pan para 20+ mesas en piloto? | [ ] Sí · [ ] Post-piloto |
| D2 | ¿Priorizar posiciones guardadas por mesa? | [ ] Post-piloto (ADR-016) |

---

## E — Alcance sprint

| # | Fases aprobadas | OK PO |
|---|-----------------|-------|
| E1 | [ ] A · [ ] B · [ ] C | |
| E2 | ¿Combinar con MEJ-10/11 en sprint UX? | [ ] Sí · [ ] No · [ ] MEJ-12 aparte |

---

## Resultado

| Resultado | Acción |
|-----------|--------|
| **Aprobado** | Planificar implementación Fase B |
| **Aprobado parcial** | Anotar en spec §5 fases rechazadas |
| **Rechazado / diferido** | Mantener `TablePreviewCard` actual |

**Validador:** _______________  
**Fecha:** _______________  
**Comentarios:** _[opcional]_
