# ADR-020 — API persistencia room setup (plano Fase A)

- **Estado:** Aceptado (contrato; implementación pendiente)
- **Fecha:** 2026-06-21
- **Relacionado:** `ADR-016`, `SDD-01D`, validación piloto `evidencias-piloto/sesion-2026-06-21.md`
- **Sustituye en piloto:** solo `localStorage` web (`taulamic:floorPlanSetup`)

## Contexto

Fase A del plano (forma, medidas, accesorios) persiste hoy en **localStorage** del navegador. Eso impide:

- Recuperar el salón entre dispositivos o sesiones futuras (post-auth).
- Validar consistencia servidor-side antes de distribución.
- Marcar checklist setup con fuente única de verdad.

El roadmap W2 (jun 2026) prioriza este endpoint.

## Decisión

Exponer recurso REST **por evento**, independiente del flujo legacy `floor-plans` (detección mesas).

### Contrato

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/events/{eventId}/room-setup` | Lee configuración Fase A |
| `PUT` | `/api/v1/events/{eventId}/room-setup` | Crea o reemplaza configuración Fase A |

### Cuerpo (PUT) / respuesta (GET)

```json
{
  "shape": "rectangular",
  "widthM": 25,
  "lengthM": 15,
  "radiusM": 12,
  "placedAccessories": ["mesa-novios", "pista-baile"],
  "updatedAt": "2026-06-21T12:00:00.000Z"
}
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `shape` | `rectangular` \| `round` \| `oval` | Igual que web `FloorPlanSetup` |
| `widthM` | number | Rectangular / oval |
| `lengthM` | number | Rectangular / oval |
| `radiusM` | number | Redonda |
| `placedAccessories` | string[] | IDs catálogo (`mesa-novios`, …) |
| `updatedAt` | ISO string | Solo respuesta |

### Validación

- Dimensiones entre 3 y 200 m (alineado con web).
- `404` si evento no existe.
- `409` si evento `plan_approved` (mismo criterio que mesas).

### Persistencia

- Archivo: `uploads/events/{eventId}/room-setup.json` (patrón `FileEventConfigRepository`).
- Módulo: `events` o submódulo `room-setup` en `apps/api`.

### Web (tras implementación)

1. `PUT` al guardar plano Fase A.
2. `GET` al cargar `/floor-plan` y `/floor-plan/layout`.
3. Mantener `localStorage` como **cache offline** opcional hasta post-piloto.

## Fuera de alcance (este ADR)

- Fondo JPG/PNG/PDF (upload separado).
- Posiciones `(x,y,rotation)` de mesas Fase B.
- Posiciones de accesorios en canvas (post-piloto).

## Criterios de aceptación

1. Tras `PUT`, `GET` devuelve mismos valores.
2. E2E piloto puede opcionalmente assert room-setup tras crear evento.
3. Web muestra plano guardado tras recargar sin depender solo de localStorage.
