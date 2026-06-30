# MEJ-10 — Cohesión UI: feedback, chips y tablas admin

- **Estado:** Implementado Sprint 07 — **pendiente validación manual PO** (`guion-validacion-mej-10-ui.md`)
- **Tipo:** Mejora UX / design system (sin cambio de alcance funcional SDD)
- **Origen:** Revisión de coherencia visual post Sprint 06 (distribución, plano Fase B, mesas)
- **Guion validación previa:** `guion-validacion-mej-10-propuesta-ui.md`
- **Referencias:** `guia-estilo-taulamic.md` §7, `design-tokens-mvp.md`, `semantic-ui.ts`

---

## 1) Objetivo

Unificar **criterios y aspecto** de mensajes, chips y tablas en el admin, **sin revertir** decisiones de ubicación ya validadas (p. ej. warning de acompañantes junto a pills).

**Principio rector:** misma piel visual, **posición según atención del usuario** (ver árbol de decisión §4).

---

## 2) Fuera de alcance

| Exclusión | Motivo |
|-----------|--------|
| Reestructurar Mesas como Invitados v2 | Familias de pantalla distintas (config vs catálogo) |
| Mover warnings de distribución/plano al `PageHeader` | Validado: pierde visibilidad |
| Componente Tooltip dedicado | Backlog; solo `title` nativo si aplica |
| Toast en assign/move/unassign exitoso | Cambio ya visible en pills/KPIs |
| Cambios de comportamiento API o reglas HU-05 | Solo UI |

---

## 3) Alcance propuesto (fases)

### Fase A — Documentación (validar primero)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-10-A1 | §7.5 en `guia-estilo-taulamic.md`: capa **feedback contextual** | Cuatro capas definidas: toast, alert página, bloqueo setup, contextual |
| MEJ-10-A2 | Árbol de decisión «¿dónde va el mensaje?» | Documentado con ejemplos Distribución / Mesas / Invitados |
| MEJ-10-A3 | §9 Mesas: patrón formulario + inventario (no clonar Invitados) | Criterio explícito para futuros sprints |

**Gate:** PO aprueba guion `guion-validacion-mej-10-propuesta-ui.md` sección A antes de código.

### Fase B — Tokens visuales de feedback

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-10-B1 | `PlacementMutationFeedback` alineado con `Alert` | Mismos tokens borde/fondo (`/30`, `/10`); `rounded-xl`; sin `shadow-md` ni `backdrop-blur` en admin |
| MEJ-10-B2 | Opcional: `Alert` con prop `inline` / `compact` | Un solo primitivo; deprecar estilos sueltos en el componente de distribución |

**No cambia:** posición contextual en fila expandida / panel plano.

### Fase C — Mesas (pulido acotado)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-10-C1 | Error validación etiqueta (vacía / duplicada) **inline** bajo input en fila | Sin `toast.error` para estos casos |
| MEJ-10-C2 | Eliminar mesa con invitados asignados → `ConfirmDialog` | Sustituye `window.confirm`; mismo copy actual |
| MEJ-10-C3 | Mantener toast de **éxito** al añadir/renombrar/eliminar | Coherente con guía §9 Mesas |

**No incluye:** search, filtros, drawer, bulk.

### Fase D — Chips de filtro (un solo estilo)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-10-D1 | Elegir variante canónica: **outline** (Invitados) o **sólida** (Distribución) | Decisión PO en guion §D |
| MEJ-10-D2 | `filterChipClass` / Invitados usan la misma variante | Distribución + plano alineados |

### Fase E — Tablas admin (opcional, baja prioridad)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-10-E1 | Cabecera `<thead>` unificada | `text-xs font-semibold uppercase tracking-wide text-neutral-500` |
| MEJ-10-E2 | Hover fila en Mesas | `hover:bg-neutral-50/80` como Invitados |

### Fase F — Targets táctiles (opcional)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-10-F1 | ✕ en `GuestPill` | Área mínima ~28–32 px o hit slop invisible |
| MEJ-10-F2 | `title` en pill draggable | «Arrastra para mover a otra mesa» (solo `draft`) |

---

## 4) Árbol de decisión (propuesta canónica)

```
1. ¿Afecta a toda la pantalla o bloquea setup?
   → Alert bajo PageHeader / banner SetupNavBar

2. ¿Acción puntual y el cambio no es obvio en pantalla?
   → Toast (arriba centro, ~4 s)

3. ¿Acción en subzona (fila, panel, input, drop)?
   → Feedback contextual EN esa subzona

4. ¿El cambio ya es visible sin texto?
   → Sin mensaje adicional
```

---

## 5) Criterios de aceptación globales

1. Ningún requisito SDD de producto se modifica; solo coherencia UI.
2. Pasos 19–24 MEJ-08 siguen válidos (warnings junto a pills).
3. Guía de estilo actualizada **antes o junto** a Fase B (según gate PO).
4. Validación manual PO con `guion-validacion-mej-10-ui.md` (post-implementación).
5. Sin regresiones visuales en Invitados, Config, Afinidades (smoke manual).

---

## 6) Estimación y prioridad sugerida

| Fase | Esfuerzo | Prioridad |
|------|----------|-----------|
| A Documentación | S | P0 — validar primero |
| B Feedback tokens | S | P1 |
| C Mesas | S | P1 |
| D Chips | S | P2 |
| E Tablas | XS | P3 |
| F Táctil / title | XS | P3 |

**Sprint sugerido:** dedicado o primer bloque de Sprint 07, **tras aprobación** del guion de propuesta.

---

## 7) Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Unificar posición y perder visibilidad | Prohibido mover feedback contextual validado en MEJ-08 |
| Sobre-unificar Mesas ↔ Invitados | Spec §2 y guion dejan explícito el «no» |
| Tercer estilo de chip | Fase D obligatoria si se añaden filtros en más pantallas |

---

## 8) Referencias de código (estado actual)

| Área | Archivos |
|------|----------|
| Feedback contextual | `placement-mutation-feedback.tsx` |
| Alert / Toast | `alert.tsx`, `toast.tsx` |
| Distribución chips | `semantic-ui.ts` → `filterChipClass` |
| Invitados chips | `guests-panel-v2.tsx` |
| Mesas | `tables-setup-view.tsx`, `use-tables-setup.ts` |

---

## 9) Historial

| Fecha | Evento |
|-------|--------|
| 2026-06-21 | Propuesta documentada tras revisión PO post Sprint 06 |
| 2026-06-21 | Fases A (guía §7.5), C, D implementadas (`4890625`); B parcial en pre-trabajo `bab758c` |
