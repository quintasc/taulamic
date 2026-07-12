> [!IMPORTANT]
> **Estado documental: especificación de fases posteriores al corte inicial.**
> Este documento planificó HU-05 como post-piloto; parte de su contenido ya está implementada (MEJ-08, enmiendas 2b/2c).
> No constituye por sí solo la referencia vigente del piloto evaluable.
> Consulta [`docs/pilot/README.md`](../pilot/README.md) y [`docs/pilot/EVOLUCION-DEL-ALCANCE.md`](../pilot/EVOLUCION-DEL-ALCANCE.md).

# SDD piloto — Enmienda HU-05 ajuste manual de asignaciones (post-piloto)

- **Fecha:** 2026-06-21
- **Estado:** Aprobada (documentación; implementación **fuera** del piloto julio)
- **Relacionado:** `SDD-01-borrador-mvp.md` (HU-05, §7.1), `SDD-01A-figma-ui-ux.md`, `ADR-016`, `handoff-figma-a-frontend.md` §7–§8, `SDD-PILOTO-alineacion-y-huecos.md`
- **No sustituye** HU-05 del SDD-01; la **operacionaliza** para UI y API.

---

## 1. Contexto

En el **piloto julio** el organizador puede:

- Calcular distribución (motor v0).
- **Consultar** invitados por mesa (lista Distribución, plano Fase B al clic) — solo lectura.

Quedan **fuera del piloto** las acciones de **ajuste manual** que el producto ya anticipó en sesiones de diseño:

| Acción | Dónde se mencionó |
|--------|-------------------|
| ✕ quitar invitado de una mesa | Handoff §7 |
| + añadir invitado sin asignar a una mesa | Handoff §7 |
| Arrastrar invitado a otra mesa | HU-05, SDD-01A (drag o selector) |
| Actualizar KPIs coherentemente | Implícito HU-05 + dashboard v2 |

Esta enmienda fija alcance, requisitos y criterios de aceptación para **post-piloto**, sin rebajar HU-05 del SDD-01.

---

## 2. Alcance piloto vs post-piloto

### 2.1 Piloto julio (sin cambio)

| ID | Comportamiento | Estado |
|----|----------------|--------|
| P-HU05-01 | Clic en mesa (plano Fase B) → panel con invitados (pills) | ✅ Implementado |
| P-HU05-02 | Acordeón Distribución → pills por mesa | ✅ Implementado |
| P-HU05-03 | KPI «sin asignar» y progreso invitados en dashboard (lectura) | ✅ Implementado |
| P-HU05-04 | Botones «Guardar posiciones» / drag **mesas** en canvas | 🚫 Deshabilitados (ADR-016 post-MVP) |

### 2.2 Post-piloto (esta enmienda)

| ID | Comportamiento | Fase sugerida |
|----|----------------|---------------|
| PP-HU05-01 | ✕ en pill → desasignar invitado | **Fase 1** |
| PP-HU05-02 | + en mesa → asignar desde bolsa sin asignar | **Fase 1** |
| PP-HU05-03 | Arrastrar pill invitado → otra mesa en plano o lista | **Fase 2** |
| PP-HU05-04 | Sincronización KPIs y estados mesa tras cada cambio | **Fase 1** |
| PP-HU05-05 | Validación reglas duras + feedback UI | **Fase 1** |
| PP-HU05-06 | Auditoría de cambios manuales (HU-05) | **Fase 2** |
| PP-HU05-07 | Lista invitados sin asignar (clic KPI — handoff §8) | **Fase 1** (paralelo) |

### 2.3 Distinción obligatoria (no mezclar)

| Concepto | Descripción | Documento |
|----------|-------------|-----------|
| **Ajuste de asignaciones** (invitado ↔ mesa) | HU-05; esta enmienda | — |
| **Posicionamiento de mesas** en canvas | Drag `(x,y,rotation)` de mesas | ADR-016 post-MVP |
| **Bloqueo de invitado** (excluir del motor) | Handoff §6; regla SDD §7.1 | Enmienda aparte |

---

## 3. Requisitos funcionales (post-piloto)

### RF-HU05-01 — Desasignar (✕)

- **RF-HU05-01.1** En cada pill de invitado (Distribución expandida y panel plano Fase B), icono **✕** visible al hover o siempre en piloto extendido.
- **RF-HU05-01.2** Al pulsar ✕: el invitado pasa a `unassignedGuestIds`; desaparece de la mesa origen.
- **RF-HU05-01.3** Solo permitido si la propuesta está en estado `draft` (no confirmada).
- **RF-HU05-01.4** Si la mesa queda vacía, su chip pasa a **Vacía**; si pierde plazas libres, recalcula **En uso**.

### RF-HU05-02 — Asignar (+)

- **RF-HU05-02.1** En fila/panel de mesa con capacidad libre, control **+** o «Añadir invitado».
- **RF-HU05-02.2** Abre selector (lista o buscador) de invitados en `unassignedGuestIds`.
- **RF-HU05-02.3** Al confirmar: nuevo `placement`; invitado sale de sin asignar.
- **RF-HU05-02.4** Rechazar si mesa **llena** (capacidad alcanzada).

### RF-HU05-03 — Mover por arrastre (drag invitado)

- **RF-HU05-03.1** El organizador puede arrastrar un pill desde mesa origen a mesa destino (plano Fase B o lista Distribución).
- **RF-HU05-03.2** Equivalente a desasignar + reasignar en una operación atómica (API).
- **RF-HU05-03.3** Feedback visual: zona destino válida resaltada; inválida (mesa llena) rechaza con mensaje.
- **RF-HU05-03.4** Alternativa aceptable en Fase 1: **selector** destino sin drag (SDD-01A); drag en Fase 2.

### RF-HU05-04 — Coherencia de KPIs y UI

Tras **cualquier** cambio manual exitoso, sin recargar página:

| Superficie | Qué actualiza |
|------------|----------------|
| **Dashboard** | KPI invitados: hint «X de Y asignados · Z sin asignar»; barra progreso si aplica |
| **Distribución** | `stats.unassignedCount`, chips Llena/En uso/Vacía, barras capacidad, pills |
| **Plano Fase B** | Contador mesa `n/cap`, color ocupación, panel invitados si abierto |
| **Confirmar distribución** | Deshabilitado o advertencia si `unassignedCount > 0` (regla existente API) |

**RF-HU05-04.1** Una sola fuente de verdad: `GET /events/{id}/distribution` tras mutación.
**RF-HU05-04.2** Optimistic UI opcional; en error, revertir y mostrar `Alert` error.

### RF-HU05-05 — Reglas duras y validación

- **RF-HU05-05.1** Antes de persistir, validar capacidad de mesa destino.
- **RF-HU05-05.2** Validar reglas duras SDD §7.1 aplicables en MVP (acompañantes, restricciones cuando existan en API).
- **RF-HU05-05.3** Si el cambio rompe regla dura (capacidad, incompatibilidad): **bloquear** con mensaje claro.
- **RF-HU05-05.4** Cambios que solo degradan afinidad: permitir con advertencia no bloqueante.
- **RF-HU05-05.5** Separación de acompañantes en manual HU-05: ver `SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md` (advertencia + allow; motor sin cambio).

### RF-HU05-06 — Auditoría (HU-05)

- **RF-HU05-06.1** Cada mutación manual registra entrada en gobernanza/auditoría: actor, guestId, mesa origen/destino, timestamp.
- **RF-HU05-06.2** Fase 1 puede limitarse a log API; UI historial en Fase 2.

---

## 4. Superficies de UI

### 4.1 Distribución (lista acordeón)

- Pills con ✕ (post-piloto).
- Botón + en cabecera expandida si `assignedCount < capacity`.
- Opcional Fase 2: drag pill entre filas de mesa.

### 4.2 Plano Fase B (panel al clic)

- Mismo comportamiento que Distribución en el panel flotante `TableGuestsPanel`.
- ✕ y + en pills / cabecera mesa.
- Fase 2: arrastrar pill hacia otra `TablePreviewCard` en el canvas.

### 4.3 Lista sin asignar (handoff §8)

- Clic en KPI «Z sin asignar» → modal o panel con lista.
- Desde ahí: asignar a mesa (selector) o arrastrar a mesa en plano.
- Comparte bolsa `unassignedGuestIds`.

---

## 5. API (borrador contrato — post-piloto)

Estado actual: solo `POST .../distribution/run`, `GET .../distribution`, `POST .../confirm`. **No hay** mutación de `placements`.

Propuesta mínima Fase 1:

| Método | Ruta | Acción |
|--------|------|--------|
| `DELETE` | `/events/{id}/distribution/placements/{guestId}` | Desasignar (→ unassigned) |
| `PUT` | `/events/{id}/distribution/placements/{guestId}` | Body `{ tableId }` — mover/asignar |
| `GET` | `/events/{id}/distribution` | Refrescar estado (ya existe) |

Reglas:

- Rechazar si `status === 'confirmed'`.
- Rechazar `409` si mesa llena o regla dura.
- Respuesta: propuesta completa actualizada (`placements`, `unassignedGuestIds`, `stats`).

Fase 2: endpoint batch o WebSocket no requerido en MVP.

---

## 6. Criterios de aceptación (post-piloto)

1. Con distribución en `draft`, el organizador quita un invitado con ✕; el KPI dashboard refleja +1 sin asignar en &lt; 2 s.
2. Con mesa con plazas libres, + asigna un invitado de la bolsa; mesa y KPIs actualizados.
3. Intento de asignar a mesa llena → error visible; estado sin cambios.
4. Plano Fase B y Distribución muestran la **misma** lista de invitados por mesa tras mutación.
5. Con propuesta confirmada, ✕ y + están deshabilitados o devuelven error API coherente.
6. (Fase 2) Drag invitado entre dos mesas válidas persiste y actualiza KPIs.
7. (Fase 2) Entrada de auditoría por cada cambio manual.

---

## 7. Entregables Figma (post-piloto)

| Frame | Contenido |
|-------|-----------|
| Distribución — mesa expandida | Pills con ✕; botón +; estado vacía |
| Plano Fase B — panel mesa | Misma interacción en card flotante |
| Error / advertencia | Mesa llena, regla dura |
| Lista sin asignar | Modal desde KPI (§8 handoff) |
| (Fase 2) Drag invitado | Ghost pill, drop target mesa |

---

## 8. Orden de implementación sugerido

```text
1. API DELETE/PUT placements + tests reglas capacidad
2. UI ✕/+ en DistributionTableList + refresh KPIs
3. UI ✕/+ en FloorPlanLayoutView (panel mesa)
4. Lista sin asignar (handoff §8)
5. Drag invitado (plano y/o lista)
6. Auditoría HU-05
```

**No mezclar** con drag de posiciones de mesa (ADR-016) en el mismo sprint salvo dependencia técnica clara.

---

## 9. Referencias cruzadas

- Piloto actual: `SDD-PILOTO-alineacion-y-huecos.md` — HU-05 ⬜
- Handoff producto: `handoff-figma-a-frontend.md` §7, §8, § «Fuera de alcance piloto»
- Plano solo lectura Fase B: `ADR-016` criterios aceptación piloto
