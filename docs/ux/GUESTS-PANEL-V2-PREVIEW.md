# Panel Invitados v2

Implementación en código del rediseño (Prompt 8 / mockup concepto). **Validado por PO (jun 2026).**

## Estado actual

- Ruta temporal: `/admin/events/{eventId}/guests-v2`
- La vista tabla legacy (`guests-list-view`, `/guests` actual) **queda descartada**.

## Próximo paso (pendiente)

1. **Eliminar avisos azules** de preview (panel v2 y enlace desde `/guests`).
2. **Promover v2 a `/guests`** y retirar ruta `/guests-v2` + flag de preview.
3. **Retirar** `guests-list-view.tsx` tras migrar importación Excel al panel nuevo.
4. **Feedback único** por acción (mensajes de éxito que se sustituyen, no persisten).

Ver `docs/agile/CONTEXTO-EJECUCION.md` § Siguiente sesión 2026-06-24.

## Cómo probarla (hasta el corte)

1. Arranca web (`npm run dev` en `apps/web`).
2. Abre un evento con invitados importados.
3. Navega a:

   `/admin/events/{eventId}/guests-v2`

   O usa el enlace «vista previa del panel Invitados v2» en la página **Invitados** piloto.

## Qué incluye

| Elemento | Comportamiento |
|----------|----------------|
| Tabla | `[ ]` RSVP · Nombre · Correo · Teléfono · **Categoría (texto)** · Alertas · Invitación · ⋮ |
| Buscador | Filtra por nombre, correo, teléfono o categoría |
| Chips | Todos · Pendientes RSVP · Menú especial · Sin categoría |
| Drawer lateral | Alta/edición con alertas logísticas (preview) |
| Bulk bar | Acciones masivas deshabilitadas (post-piloto) |
| Estilo | Componentes Taulamic existentes (`btn-*`, `card-admin`, `input-field`, colores semánticos) |

## Histórico — aislamiento inicial (ya superado)

La primera entrega (`b360bed`) aisló v2 en ruta paralela con flag reversible. PO confirmó adopción del rediseño; el bloque siguiente describe el rollback solo si hiciera falta antes del corte:

Para **desactivar** sin borrar código (obsoleto tras promoción a `/guests`):

```ts
// apps/web/src/lib/pilot-features.ts
export const PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED = false;
```

Para **eliminar por completo**, borrar solo:

- `apps/web/src/app/admin/events/[eventId]/guests-v2/`
- `apps/web/src/components/admin/guests/v2/`
- `apps/web/src/lib/guest-v2-detail-meta.ts`
- Entrada `guestsV2Preview` en `routes.ts` y el banner en `guests/page.tsx`
- Flag en `pilot-features.ts`

La ruta `/guests` legacy y `guests-list-view.tsx` se retirarán al consolidar v2.

## Datos

- CRUD: misma API que el piloto (`guestsApi`).
- RSVP e invitación: `guest-ui-meta` (localStorage compartido con v1).
- Alertas 🌾 / ♿ y notas: `guest-v2-detail-meta` (solo v2, reversible).

## Relación con Figma Prompt 8

El Prompt 8 en `docs/ux/figma-make-prompts.md` sigue pendiente de ejecución en Figma Make. Esta implementación es un **preview funcional en código** para validar UX con datos reales del piloto.
