# Componentes — convenciones

Mapa completo: `docs/ux/frontend-component-system.md`

- **`ui/`** — primitivos sin lógica de negocio
- **`admin/`**, **`marketing/`**, **`tables/`**, **`brand/`** — composición por dominio
- **`theme/`** — `brand.config.ts` (assets y nombre de marca)
- Archivos en la raíz de `components/` con `@deprecated` son shims; no añadir lógica ahí

Nuevas páginas: importar desde `@/components/ui` y el módulo de dominio correspondiente.
