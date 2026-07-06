# SDD piloto — Enmienda HU-05 Fase 2c: distribución por sillas, estrella presidencial y mejoras UX plano

- **Fecha:** 2026-07-07
- **Estado:** Implementada (sesión PO 2026-07-06/07)
- **Relacionado:** `SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md`, `ADR-009`, `ADR-022`
- **Ámbito:** UX / UI admin; sin cambio de API ni motor de distribución

---

## 1. Contexto

Esta enmienda recoge las mejoras acordadas en la sesión PO del 6-7 de julio de 2026, avanzando la **Fase C** de asientos S1…Sn descrita en la Fase 2b como backlog, y añadiendo nuevas funcionalidades de marcado presidencial y correcciones de estabilidad.

---

## 2. Funcionalidades implementadas

### 2.1 Renombrado: "Ver plano" → "Ver mesas"

- El botón de la pantalla de distribución que navega al plano pasa a llamarse **"Ver mesas"** (o "Ver mesas en plano" en desktop).
- Mejora la coherencia con la acción real del usuario.
- **Fichero:** `floor-plan-setup-view.tsx`, `ui-copy.ts`

---

### 2.2 Panel flotante de sillas — Mejoras visuales

| Elemento | Antes | Después |
|---|---|---|
| Ancho panel desktop | 288 px | 384 px (`w-96`) — nombres sin salto de línea |
| Sillas ocupadas | texto plano | Fondo naranja suave `bg-primary-500/5`, badge `S1` naranja sólido |
| Sillas vacías | "Vacía" estático | Botón `"+ Añadir"` (desktop) / `"+"` (móvil) cuando hay plazas libres |
| Z-index panel | `z-30` | `z-[60]` — siempre sobre sidebar |

**Ficheros:** `floor-plan-layout-view.tsx`

---

### 2.3 Botón "Añadir invitado" en silla vacía — Asignación específica

- Al pulsar `"+ Añadir"` en una silla vacía, el modal de selección se abre recordando el **chairId** concreto (`S1`, `S2`, …).
- Al confirmar, el invitado queda guardado en esa silla exacta en `localStorage` (clave `taulamic:guestChairs:{eventId}`).
- Al desasignar un invitado (`[×]`), su mapeado de silla se **borra** completamente para evitar efectos fantasma.
- **Corrige el bug** donde el invitado reasignado volvía a la silla anterior en lugar de a la seleccionada.

**Ficheros:** `floor-plan-layout-view.tsx`, `distribution-table-list.tsx`

---

### 2.4 Botón "Añadir" en pantalla de Distribución (Lista de Mesas)

- Se extiende el mismo concepto al desglose expandido de cada mesa en la lista de distribución.
- El botón `"+ Añadir"` aparece en cada silla vacía del desglose, vinculando al modal de invitados sin asignar.
- **Requisito:** `editable && group.freeSeats > 0` (no requiere que haya invitados sin asignar — el modal lo gestiona).

**Fichero:** `distribution-table-list.tsx`

---

### 2.5 Distribución por sillas en pantalla Distribución

- El desglose expandido de cada fila de mesa en la lista de distribución sustituye la lista horizontal simple de invitados por la misma **distribución vertical por sillas** del panel del plano.
- Ocupadas: badge naranja `S1`, nombre completo, botón `[×]`.
- Vacías: borde discontinuo + botón `"+ Añadir"`.
- Admite arrastrar y soltar (drag & drop) un pill sobre una silla vacía.

**Fichero:** `distribution-table-list.tsx`

---

### 2.6 Representación visual de la mesa (Desktop only)

- Columna derecha en el desglose expandido de la lista de distribución (oculta en móvil: `hidden lg:flex`).
- Componente `TableVisualRepresentation` dibuja la mesa en miniatura con sillas radiales (`S1`, `S2`...) y nombres de invitados en texto de 9px.
- Se actualiza reactivamente al cambiar cualquier asignación.

**Fichero:** `distribution-table-list.tsx`

---

### 2.7 Estrella de silla orientada a mesa principal

#### Descripción funcional

Permite al organizador marcar qué sillas de cada mesa están **orientadas hacia la mesa de honor** (novios, presidencia, etc.) con una **estrella ☆/★**.

#### Comportamiento

| Estado | Visual estrella | Fila silla | Badge `S1` | Nombre invitado |
|---|---|---|---|---|
| Sin marcar | ☆ gris claro | Borde estándar / naranja (según ocupación) | Naranja o gris | Blanco/neutro |
| Marcada | ★ ámbar dorada | Borde ámbar `border-amber-400/60`, fondo `bg-amber-50/50` | Ámbar `bg-amber-400 text-amber-900` | `text-amber-800 bg-amber-50` |

#### Interacción

- **Tooltip** sin marcar: *"Orientar a mesa principal"*
- **Tooltip** marcada: *"Quitar orientación a mesa principal"*
- La representación visual de la mesa también refleja el color ámbar en el círculo y la etiqueta del nombre.

#### Persistencia

- `localStorage`: clave `taulamic:presidentialChairs:{eventId}`, formato `string[]` con valores `"tableId:chairId"` (e.g. `"t1:S3"`).
- Sobrevive recargas y cambios de mesa/pantalla.

#### Disponibilidad

- Panel flotante del **Plano** (desktop): `floor-plan-layout-view.tsx`
- Desglose expandido de **Lista de Mesas** (distribución): `distribution-table-list.tsx`

---

### 2.8 Corrección z-index panel flotante y límites de arrastre

- **Z-index elevado:** `z-[60]` — igual al nivel del drawer móvil; garantiza que el panel siempre se muestre sobre el sidebar en desktop, incluso al arrastrar hacia la izquierda.
- **Bounds de drag:** el handler `handlePanelHeaderPointerDown` calcula `getBoundingClientRect()` del `canvasCardRef` y restringe el translate a los límites del card, evitando que el panel se pierda fuera del área visible.

**Fichero:** `floor-plan-layout-view.tsx`

---

## 3. Cambios de componentes

| Fichero | Tipo de cambio |
|---------|---------------|
| `floor-plan-setup-view.tsx` | Renombrado botón "Ver plano" → "Ver mesas" |
| `floor-plan-layout-view.tsx` | Panel sillas, botón Añadir, estrella presidencial, z-index, bounds drag |
| `distribution-table-list.tsx` | Distribución vertical sillas, visual mesa, estrella presidencial, botón Añadir |
| `icons.tsx` | Nuevo `IconStar` con prop `filled` |
| `ui-copy.ts` | Actualización copy botón plano |

---

## 4. Fuera de alcance (en esta enmienda)

| Exclusión | Motivo |
|-----------|--------|
| API `placement.seatId` persistida en servidor | Requiere ADR + sprint dedicado |
| Rotación animada de mesa hacia presidencia | Backlog Fase D |
| Arrastre intra-mesa silla↔silla desde canvas | Backlog Fase D |

---

## 5. Criterios de aceptación

1. Panel flotante siempre se muestra sobre el sidebar; no se puede arrastrar fuera del card del canvas.
2. Al pulsar `"+ Añadir"` en silla `S2`, el invitado queda asignado en `S2`, no en otra.
3. Al eliminar un invitado, el badge de silla queda libre y puede reasignarse.
4. Estrella ☆ → ★: fila y representación visual cambian a ámbar; se persiste entre recargas.
5. Estrella ★ → ☆: todo vuelve a los colores estándar de ocupación.
6. `npx tsc --noEmit` sin errores.

---

## 6. Referencias

- `SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md`
- `docs/agile/sprint-10-plan.md`
- `apps/web/src/components/admin/floor-plan/floor-plan-layout-view.tsx`
- `apps/web/src/components/admin/distribution/distribution-table-list.tsx`
