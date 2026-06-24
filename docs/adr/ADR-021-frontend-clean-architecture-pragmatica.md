# ADR-021 - Clean Architecture pragmatica en frontend web

- **Estado:** Aceptado
- **Fecha:** 2026-06-24
- **Relacionado:** ADR-015 (API), ADR-017 (design system), `docs/ux/guia-estilo-taulamic.md`

## Contexto

El backend adopta Clean Architecture pragmatica (ADR-015). El frontend (`apps/web`) ya tiene capas informales (`ui/`, `admin/`, `lib/`, `hooks/`, `app/`) pero varias paginas concentran logica, estado y markup (p. ej. `tables/page.tsx`, `config/page.tsx`).

Se necesita una convencion explicita para modularidad y reutilizacion sin sobreestructurar el piloto.

## Decision

Adoptar **capas con dependencias hacia dentro** en el frontend Next.js:

| Capa | Ubicacion | Responsabilidad |
|------|-----------|-----------------|
| **Presentacion (rutas)** | `src/app/` | Rutas finas; solo composicion de vistas |
| **Presentacion (vistas)** | `src/components/admin/`, `marketing/` | UI por feature; sin llamadas API directas salvo prototipos |
| **Presentacion (primitivos)** | `src/components/ui/` | Piezas reutilizables sin negocio |
| **Aplicacion** | `src/hooks/` | Orquestacion: estado, efectos, casos de uso de pantalla |
| **Dominio** | `src/lib/domain/` | Reglas puras, tipos, transformaciones sin React ni fetch |
| **Infraestructura** | `src/lib/api.ts`, `src/lib/event-meta/` | HTTP, localStorage, adaptadores externos |
| **Tema / marca** | `src/theme/` | Assets y tokens de marca |

### Reglas de dependencia

```
app/  -->  components/  -->  ui/
  |            |
  v            v
hooks/  -->  lib/domain/
  |
  v
lib/api, lib/event-meta (infra)
```

- **`lib/` no importa desde `components/`** (excepcion historica `admin-nav` migrada a `components/admin/`).
- **Paginas** no superan ~40 LOC: delegan en `*View` + hook.
- **Hooks** encapsulan API + toast + navegacion; vistas reciben props y callbacks.
- **Dominio** sin `useState`, sin `fetch`, sin JSX.

### Convencion por feature admin

```text
components/admin/<feature>/
  <feature>-view.tsx      # UI
hooks/
  use-<feature>.ts        # logica de pantalla
app/.../<feature>/page.tsx  # 5-20 LOC
```

### Aplicacion progresiva

| Fase | Alcance |
|------|---------|
| Piloto (ahora) | Extraer paginas gordas; primitivos `Button`, `FormField`, `Stepper`, etc.; dividir `event-ui-meta` |
| Post-piloto | Partir `guests-panel-v2`; `lib/domain/` para reglas mesa/distribucion; eliminar shims deprecados |
| MVP completo | `/sistema` galeria; theme packs (ADR-017) |

No se exige refactor retroactivo de modulos ya delgados (`preferences`, `floor-plan` page).

## Consecuencias

### Positivas

- Componentes visuales reutilizables y testeables.
- Nuevas pantallas siguen el mismo patron que Config/Tables/Guests.
- Alineacion conceptual con ADR-015 sin duplicar carpetas `application/domain` en cada feature.

### Negativas

- Mas archivos por pantalla compleja.
- Migracion gradual: deuda residual en componentes grandes (`guests-panel-v2`).

## Referencias

- `docs/ux/frontend-component-system.md`
- `docs/ux/guia-estilo-taulamic.md`
