# Panel Invitados v2

Implementación en código del rediseño (Prompt 8 / mockup concepto). **Validado por PO (jun 2026).**

## Estado actual

- Ruta canonica: `/admin/events/{eventId}/guests`
- `/guests-v2` redirige a `/guests` (compatibilidad)
- Vista tabla legacy (`guests-list-view`) **eliminada** (jun 2026)

## Cómo probarla

1. Arranca web (`npm run dev` en `apps/web`).
2. Abre un evento → **Invitados** (`/admin/events/{eventId}/guests`).

## Qué incluye

| Elemento | Comportamiento |
|----------|----------------|
| Tabla | `[ ]` RSVP · Nombre · Correo · Teléfono · **Categoría (texto)** · Alertas · Invitación · ⋮ |
| Buscador | Filtra por nombre, correo, teléfono o categoría |
| Chips | Todos · Pendientes RSVP · Menú especial · Sin categoría |
| Drawer lateral | Alta/edición con alertas logísticas (preview) |
| Bulk bar | Acciones masivas deshabilitadas (post-piloto) |
| Estilo | Componentes Taulamic existentes (`btn-*`, `card-admin`, `input-field`, colores semánticos) |

## Histórico — aislamiento inicial (jun 2026)

La entrega `b360bed` aisló el panel en `/guests-v2` con flag reversible. Consolidado en `/guests` con adopción PO.

## Datos

- CRUD: misma API que el piloto (`guestsApi`).
- RSVP e invitación: `guest-ui-meta` (localStorage compartido con v1).
- Alertas 🌾 / ♿ y notas: `guest-v2-detail-meta` (solo v2, reversible).

## Relación con Figma Prompt 8

El Prompt 8 en `docs/ux/figma-make-prompts.md` sigue pendiente de ejecución en Figma Make. Esta implementación es un **preview funcional en código** para validar UX con datos reales del piloto.
