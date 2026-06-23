# Sistema de componentes frontend — Taulamic Web

- Estado: **Vigente** (jun 2026)
- ADR: `docs/adr/ADR-017-frontend-design-system-modular.md`
- Codigo: `apps/web/src/`
- Tokens: `design-tokens-mvp.md` · implementacion: `globals.css` + `tailwind.config.ts`

Este documento describe **como organizar y reutilizar** componentes, y como preparar **cambios de aspecto** en el MVP completo (no exigido en piloto julio).

---

## 1) Mapa de carpetas

```
apps/web/src/
  theme/                 # Marca y (futuro) paquetes de tema
    brand.config.ts      # Nombre producto, rutas PNG/SVG
  components/
    ui/                  # Primitivos reutilizables (sin negocio)
    marketing/           # Landing, hero, tarjetas
    admin/               # Shell, dashboard, distribution, floor-plan
    brand/               # Logo (SVG parametrizable)
    tables/              # Preview formas de mesa
    icons.tsx            # Iconos nav y UI (→ icons/ si crece)
  hooks/                 # Estado de pantalla compartido
  lib/                   # API, rutas, utilidades
  app/                   # Paginas Next.js (finas)
```

### Inventario actual (piloto)

| Modulo | Componentes clave | Reutilizable en |
|--------|-------------------|-----------------|
| `ui/` | Alert, EmptyState, PageHeader, StatCard, UploadZone, PreferenceOption, QuickAccessCard, SectionLabel | Cualquier pagina |
| `marketing/` | MarketingLanding, MarketingHeader, MarketingCard, HeroFloorplan, marketing-illustrations | Landing, futuras landings verticales |
| `admin/` | AdminShell, AdminSidebar, EventDashboard, SetupChecklist | Todo el panel admin |
| `admin/distribution/` | DistributionCalculatedView, GuestPill, DistributionTableList | Distribucion, plano Fase B |
| `admin/floor-plan/` | FloorPlanSetupView, FloorPlanLayoutView, ResizableRoomCanvas, RoomShapeDisplay | Plano |
| `brand/` | TaulamicLogo, LogoIcon | Header admin, marketing, emails futuros |
| `tables/` | TableShapePreview, utilidades forma mesa | Mesas, plano |

### Shims de compatibilidad (raiz `components/`)

Archivos que solo reexportan — **no anadir logica aqui**:

- `ui.tsx` → `ui/index.ts`
- `admin-shell.tsx` → `admin/admin-shell.tsx`
- `hero-floorplan.tsx` → `marketing/hero-floorplan.tsx`
- `taulamic-logo.tsx` → `brand/taulamic-logo.tsx`

Nuevos imports deben usar la ruta canonica (`@/components/ui`, `@/components/brand/...`).

---

## 2) Reglas para paginas nuevas

1. **Pagina fina:** en `app/`, solo composicion, datos y navegacion.
2. **UI generica** → `components/ui/` o ampliar un primitivo existente.
3. **Logica de evento/admin** → `components/admin/` o `hooks/`.
4. **Colores y tipografia** → clases Tailwind (`btn-primary`, `text-neutral-700`) o tokens CSS; evitar `#hex` en JSX salvo SVG/ilustraciones.
5. **Imagenes de marca** → `brandConfig.assets` (`src/theme/brand.config.ts`).
6. **Exportar** desde `index.ts` del modulo al anadir componente publico.

---

## 3) Tokens y aspecto visual

### Hoy (piloto)

| Fuente | Que define |
|--------|------------|
| `design-tokens-mvp.md` | Especificacion de diseno (Figma) |
| `globals.css` `:root` | Variables CSS parciales (`--color-primary`, wireframe) |
| `tailwind.config.ts` | Paleta `primary`, `neutral`, semanticos |
| `@layer components` en `globals.css` | `.btn-primary`, `.card-admin`, `.input-field` |

**Deuda conocida:** hex duplicados entre Tailwind, CSS y algun SVG inline. Convergencia planificada post-piloto.

### Futuro (MVP completo) — cambiar aspecto sin tocar pantallas

```text
1. Editar o sustituir paquete de tema (tokens.css + assets en public/brand/{themeId}/)
2. Actualizar themeId o rutas en brand.config.ts
3. Rebuild / redeploy
```

| Cambio deseado | Donde tocar | No tocar |
|----------------|-------------|----------|
| Logo PNG | `public/` + `brand.config.ts` | Componentes de pagina |
| Icono vertical bodas | `public/taulamic-icon-bodas.png` o ruta en config | `marketing-illustrations` salvo alt text |
| Color coral | `:root` / tailwind preset del tema | `admin/event-dashboard.tsx` |
| Tipografia | `--font-sans` en layout + tailwind `fontFamily` | Cada titulo individual |
| Densidad admin vs marketing | Clases utilitarias ya separadas (card-admin vs card-marketing) | — |

---

## 4) Pagina `/sistema` (roadmap)

Placeholder en piloto. Objetivo post-MVP:

- Galeria de primitivos `ui/` con variantes (default, hover, error, empty).
- Muestra de tokens activos.
- Referencia para Ventana 2 (Figma) y Ventana 1 (implementacion).

---

## 5) Checklist al anadir componente

- [ ] ¿Es reutilizable? → `ui/` o modulo de dominio correcto
- [ ] ¿Exportado en `index.ts`?
- [ ] ¿Sin hex sueltos (salvo ilustracion)?
- [ ] ¿Assets via `brandConfig`?
- [ ] ¿Pagina en `app/` solo compone?

---

## 6) Referencias

- `apps/web/README.md`
- `docs/adr/ADR-017-frontend-design-system-modular.md`
- `docs/ux/design-tokens-mvp.md`
- `docs/ux/handoff-figma-a-frontend.md`
