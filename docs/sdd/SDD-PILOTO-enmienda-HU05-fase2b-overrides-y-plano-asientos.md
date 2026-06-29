# SDD piloto — Enmienda HU-05 Fase 2b: overrides manuales y plano por asientos

- **Fecha:** 2026-06-21
- **Estado:** Aprobada (PO 2026-06-21)
- **Relacionado:** `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`, `SDD-01-borrador-mvp.md` §7.1, `ADR-012`, `ADR-009`, `ADR-016`, `ADR-022`
- **Supersede parcial:** RF-HU05-05.3 para separación de acompañantes **solo** en mutaciones manuales HU-05

---

## 1. Contexto

Sprint 06 entregó drag invitado mesa↔mesa (PP-HU05-03). En validación manual:

1. Separar pareja sin `separar_acompanante` en Excel bloqueaba con error y **sustituía** la vista del plano.
2. El panel flotante de invitados **tapa** mesas del canvas y limita el drop.
3. La visión producto exige asignación por **asiento** S1…Sn con rotación de mesa (post-Fase 2).

Esta enmienda fija comportamiento **sin rebajar** reglas duras del motor automático (HU-04).

---

## 2. Principio rector (ver ADR-022)

| Ámbito | Acompañantes juntos |
|--------|---------------------|
| Motor v0 (HU-04) | Regla **dura** — no propone separación |
| Excel `separar_acompanante` | Excepción **estructural** — grupo `keepTogether: false` |
| Ajuste manual admin (HU-05) en `draft` | **Advertencia** no bloqueante + auditoría; el cambio **persiste** |

Incompatibilidades obligatorias y capacidad de mesa siguen siendo **bloqueo duro** en HU-05.

---

## 3. Requisitos funcionales

### RF-HU05-05.5 — Override manual de acompañantes

- **RF-HU05-05.5.1** Tras assign, unassign o move manual que deje acompañantes (`keepTogether`) en mesas distintas o uno sin asignar y otro asignado, la API responde **200** con la propuesta actualizada.
- **RF-HU05-05.5.2** La respuesta incluye `manualWarnings[]` con al menos `{ code: 'COMPANION_SEPARATED', message, guestIds }`. No se persiste en almacenamiento; solo en la respuesta de mutación.
- **RF-HU05-05.5.3** UI: `Alert variant="warning"` **inline** (banner superior de la sección). **No** sustituir el canvas ni la lista de mesas.
- **RF-HU05-05.5.4** Auditoría: entrada `distribution_placement_changed` con `companionSeparationWarning: true` cuando aplica.
- **RF-HU05-05.5.5** Si el grupo tiene excepción Excel (`separar_acompanante`), no se emite warning (comportamiento ya esperado).

### RF-HU05-03.5 — Plano Fase B+ (interino)

- **RF-HU05-03.5.1** Panel «Invitados en mesa» en lateral (derecha en viewport ≥ sm), colapsable; no debe cubrir la zona central de drop de mesas.
- **RF-HU05-03.5.2** Drag invitado válido hacia cualquier `TablePreviewCard` del canvas (scroll/pan del contenedor si aplica).
- **RF-HU05-03.5.3** Fuera de alcance aquí: asientos numerados, rotación, drop por silla.

### RF-HU05-03.6 — Plano Fase C (visión backlog)

- Pills pequeñas en asientos **S1, S2, S3…** según topología ADR-009.
- Círculo interior concéntrico en mesa redonda; **rotación** orientable hacia mesa presidencial.
- Clic mesa: pills en posición de asiento; drag intra-mesa (silla↔silla) o inter-mesa (silla destino o plaza libre según zona de drop).
- Requiere `placement.seatId`, API y Figma dedicados — **no** Sprint 06.

---

## 4. API

| Campo | Tipo | Persistido | Descripción |
|-------|------|------------|-------------|
| `manualWarnings` | `ManualPlacementWarning[]` | No | Solo respuestas POST/PUT move, assign, unassign |

```ts
type ManualPlacementWarning = {
  code: 'COMPANION_SEPARATED';
  message: string;
  guestIds: string[];
};
```

---

## 5. Criterios de aceptación

1. Drag que separa pareja sin excepción Excel → invitado se mueve; warning visible; plano/distribución siguen operativos.
2. Drag a mesa llena o incompatibilidad → sigue bloqueando (409 / Alert error).
3. Motor v0 no asigna parejas en mesas distintas (sin cambio).
4. Panel plano no tapa el centro del canvas en desktop.
5. Entrada de auditoría por override con flag de warning.

---

## 6. Orden de implementación

```text
1. ADR-022 + esta enmienda (documentación)
2. API: warning en lugar de 409 COMPANION_SEPARATED (manual)
3. Web: banner warning inline; panel plano lateral
4. Validación manual guion MEJ-08 Fase 2b
5. (Backlog) Fase C asientos S1…Sn
```

---

## 7. Referencias

- `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`
- `docs/agile/sprint-06-plan.md`
- `docs/agile/guion-validacion-mej-08-ui.md`
