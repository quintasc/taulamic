# Guion — Validación previa propuesta MEJ-10 (cohesión UI)

- **Estado:** Aprobado PO — 2026-06-21
- **Tipo:** Aprobación de **propuesta** — **no** requiere `npm run dev` ni build
- **Spec:** `MEJ-10-cohesion-ui-feedback-y-tablas.md`
- **Implementación:** **bloqueada** hasta marcar este guion como aprobado

> Validar criterios y decisiones de producto/UX **antes** de abrir sprint o escribir código.

---

## Preparación

- [ ] Leer `MEJ-10-cohesion-ui-feedback-y-tablas.md` completo
- [ ] Tener a mano capturas o sesión en vivo de: Distribución, Plano layout, Mesas, Invitados (referencia)

---

## A — Principios (obligatorio)

| # | Pregunta | Respuesta esperada | OK PO |
|---|----------|-------------------|-------|
| A1 | ¿Aceptamos que **no** se muevan los warnings de acompañantes fuera de la zona de pills? | Sí — visibilidad validada Sprint 06 | [x] |
| A2 | ¿Aceptamos **no** convertir Mesas en pantalla tipo Invitados v2? | Sí — formulario + inventario | [x] |
| A3 | ¿Aceptamos documentar la **capa 4** (feedback contextual) en la guía de estilo? | Sí | [x] |

**Si algún NO:** detener; ajustar spec antes de Fase B.

---

## B — Feedback visual (Fase B)

| # | Decisión | Opciones | Elección PO |
|---|----------|----------|-------------|
| B1 | Apariencia contextual = misma que `Alert` (sin sombra/blur extra) | Sí / No / Ajustar | [Sí] |
| B2 | Radio banners mensaje | `rounded-xl` (como Alert) / `rounded-lg` (más compacto) | [ como Alert] |

**Notas PO:** _[opcional]_

---

## C — Mesas (Fase C)

| # | Propuesta | ¿Aprobar? | OK PO |
|---|-----------|-----------|-------|
| C1 | Error etiqueta vacía/duplicada → texto bajo el input (no toast) | | [x] |
| C2 | Eliminar mesa con asignados → `ConfirmDialog` (no `window.confirm`) | | [x] |
| C3 | Mantener toast de éxito al añadir/renombrar/eliminar mesa | | [x] |

---

## D — Chips de filtro (Fase D)

Comparar en UI:

- **Invitados:** activo = borde coral + fondo `primary-500/10`
- **Distribución / plano:** activo = relleno sólido `primary-500` + texto blanco

| # | Decisión | OK PO |
|---|----------|-------|
| D1 | Variante canónica para toda la app | [x] Outline (Invitados) · [ ] Sólida (Distribución) · [ ] Otra: ___ |
| D2 | Aplicar en Distribución + Plano en el mismo sprint | [x] Sí · [ ] No · [ ] Más adelante |

---

## E — Tablas (Fase E, opcional)

| # | Propuesta | ¿Incluir en MEJ-10? | OK PO |
|---|-----------|---------------------|-------|
| E1 | Unificar cabecera tabla (Mesas ↔ Invitados) | | [ ] |
| E2 | Hover suave en filas de Mesas | | [x] |

---

## F — Alcance sprint

| # | Pregunta | OK PO |
|---|----------|-------|
| F1 | Fases aprobadas para **primer entregable** | [x] A · [x] B · [x] C · [x] D · [x] E · [x] F |
| F2 | ¿Sprint dedicado MEJ-10 o mezclar con otra feature? | Sprint x / Mezclar con ___ |

---

## Resultado

| Resultado | Acción |
|-----------|--------|
| **Aprobado** | Actualizar `MEJ-10` estado → «Aprobado PO»; crear issue GitHub; planificar Sprint 07 |
| **Aprobado parcial** | Anotar fases rechazadas en spec §3; solo implementar fases marcadas en F1 |
| **Rechazado / diferido** | Mantener spec; no implementar |

**Validador:** _______________  
**Fecha:** _______________  
**Comentarios:** _[opcional]_

---

## Post-implementación (futuro)

Tras código, validar con `guion-validacion-mej-10-ui.md` (por crear cuando exista implementación).
