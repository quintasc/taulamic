# Vista previa Invitados v2 (reversible)

Propuesta de UI basada en el Prompt 8 de Figma Make y en el mockup de concepto (Gemini), **sin sustituir** la pantalla piloto actual.

## Cómo probarla

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

## Aislamiento / revertir

Para **desactivar** sin borrar código:

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

La ruta `/guests` y `guests-list-view.tsx` **no se modifican** salvo el banner informativo opcional.

## Datos

- CRUD: misma API que el piloto (`guestsApi`).
- RSVP e invitación: `guest-ui-meta` (localStorage compartido con v1).
- Alertas 🌾 / ♿ y notas: `guest-v2-detail-meta` (solo v2, reversible).

## Relación con Figma Prompt 8

El Prompt 8 en `docs/ux/figma-make-prompts.md` sigue pendiente de ejecución en Figma Make. Esta implementación es un **preview funcional en código** para validar UX con datos reales del piloto.
