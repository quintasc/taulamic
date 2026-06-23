# ADR-017 - Frontend: sistema de componentes modular y theming

- Estado: **Aceptado**
- Fecha: 2026-06-24
- Alcance piloto julio: **documentar y preparar**; theming completo **post-MVP**
- Relacionado: `SDD-01C`, `docs/ux/design-tokens-mvp.md`, `docs/ux/frontend-component-system.md`

## Contexto

El piloto julio ya modularizo `apps/web` en carpetas por dominio (`ui/`, `marketing/`, `admin/`, `brand/`, `tables/`). El producto necesitara:

1. **Reutilizar** piezas de UI en paginas futuras (marketing, admin, portal invitado, salon).
2. **Cambiar aspecto** (colores, tipografia, imagenes) sin reescribir pantallas — p. ej. sustituir PNG de marca o activar un paquete de tema.

Hasta ahora los tokens viven repartidos entre `design-tokens-mvp.md`, `tailwind.config.ts`, `globals.css` y valores inline en componentes (logo SVG). No habia decision formal de arquitectura frontend ni punto unico de configuracion de marca.

## Decision

Adoptar un **sistema de capas** en el frontend web:

| Capa | Ubicacion | Responsabilidad |
|------|-----------|-----------------|
| **Tema / marca** | `src/theme/` | IDs de tema, rutas de assets, futuros overrides de tokens |
| **Tokens** | `globals.css` (`:root`) + `tailwind.config.ts` | Colores, tipografia, espaciado como variables CSS y clases Tailwind |
| **Primitivos UI** | `src/components/ui/` | Botones (clases), Alert, StatCard, PageHeader… sin logica de negocio |
| **Dominio visual** | `admin/`, `marketing/`, `tables/`, `brand/` | Composicion de primitivos + iconos + copy de producto |
| **Paginas** | `src/app/` | Rutas finas; fetch y estado; **no** estilos ad hoc repetidos |

### Reglas de importacion

- Paginas importan desde `@/components/ui`, `@/components/admin`, `@/components/marketing`, etc.
- **No** duplicar componentes en `app/` salvo prototipos temporales.
- Assets de marca referenciados via `brandConfig` (`src/theme/brand.config.ts`), no rutas hardcodeadas dispersas.
- Iconos SVG centralizados en `components/icons.tsx` (futuro: `icons/` si crece).

### Theming (post-MVP — fuera del piloto julio)

Para permitir cambiar aspecto **solo con configuracion/assets**:

1. **Tokens CSS** en `:root` como fuente de verdad en runtime (`--color-primary`, `--font-sans`, …).
2. **Tailwind** mapea utilidades a esas variables (no hex duplicados en componentes).
3. **Paquetes de tema** (futuro): carpeta `public/brand/{themeId}/` o `src/theme/packs/{themeId}/tokens.css` con PNG/SVG y overrides.
4. **Cambio de imagen:** sustituir archivo en `public/` y actualizar ruta en `brand.config.ts` (o un solo `themeId` que resuelva rutas).
5. **Cambio de tipografia/colores:** editar tokens del paquete activo; **no** tocar componentes de dominio.

El piloto **no** implementa selector de tema en runtime ni white-label multi-tenant; solo deja la estructura y `brandConfig`.

### Pagina `/sistema`

Reservada como **catalogo vivo** de componentes y tokens (storybook ligero o galeria interna) en fase post-piloto. En julio permanece placeholder.

## Alcance IN piloto (julio)

- Mantener estructura modular actual y barrels (`index.ts`).
- `src/theme/brand.config.ts` como punto unico de nombre de producto y rutas de assets.
- Documentacion: este ADR + `frontend-component-system.md`.
- Consolidar componentes huerfanos en su carpeta de dominio.

## Alcance OUT piloto (agosto+)

- Theme switcher / multi-marca en runtime.
- Extraer todos los hex inline del logo SVG a tokens (refactor visual).
- Storybook o `/sistema` completo.
- Paquetes de tema alternativos desplegables sin rebuild (opcional largo plazo).

## Consecuencias

### Positivas

- Nuevas paginas reutilizan `ui/` y dominio sin copiar CSS.
- Cambio de PNG de marca acotado a `public/` + `brand.config.ts`.
- Camino claro hacia white-label o verticales (bodas vs empresa) sin redisenar admin.

### Negativas

- Deuda: Tailwind aun duplica algunos hex de `design-tokens-mvp.md`; convergencia gradual a CSS variables.
- Shims en raiz de `components/` (`ui.tsx`, `taulamic-logo.tsx`) se mantienen por compatibilidad tooling hasta limpieza.

## Referencias

- `apps/web/README.md`
- `docs/ux/design-tokens-mvp.md`
- `docs/ux/frontend-component-system.md`
- `docs/ux/handoff-figma-a-frontend.md` § Sistema de componentes
