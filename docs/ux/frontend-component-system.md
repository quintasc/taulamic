# Sistema de componentes frontend — Taulamic Web

- Estado: **Vigente** (jun 2026)
- Guía canónica UX/UI: **`guia-estilo-taulamic.md`**
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
| `ui/` | Alert, EmptyState, PageHeader, StatCard, UploadZone, PreferenceOption, QuickAccessCard, SectionLabel, Toast, SaveStatusIndicator | Cualquier pagina |
| `marketing/` | MarketingLanding, MarketingHeader, MarketingCard, HeroFloorplan, marketing-illustrations | Landing, futuras landings verticales |
| `admin/` | AdminShell, AdminSidebar, EventDashboard, SetupChecklist, SetupNavBar, EventCountdown | Todo el panel admin |
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

## 4) Patrones de feedback (obligatorios)

Detalle completo: **`guia-estilo-taulamic.md` §7**.

| Capa | Componente | Cuándo |
|------|------------|--------|
| Validación setup | `SetupNavBar` + `Alert` error | `nextReady={false}` |
| Acción puntual | `useToast()` | Alta, import, CRUD con confirmación breve |
| Auto-guardado | `SaveStatusIndicator` en `PageHeader` | Config, Plano, Afinidades |
| Contexto persistente | `Alert` bajo header | Errores API, avisos piloto |

**Provider global:** `ToastProvider` en `app/providers.tsx`.

---

## 5) Responsive — admin, marketing e invitado

**ADR:** `docs/adr/ADR-019-responsive-y-mobile-invitado.md`

### Estrategia por superficie

| Superficie | Enfoque | Notas implementación |
|------------|---------|----------------------|
| `marketing/` | Dual | Grids `md:grid-cols-*`; nav oculta en móvil hasta hamburger (post-piloto) |
| `admin/` | Desktop-first | Sidebar fija `w-sidebar`; contenido con `p-8` y grids `sm:`/`lg:` |
| Portal invitado (futuro) | **Mobile-first** | Nuevos componentes en `components/guest/` reutilizando `ui/` |

### Breakpoints (Tailwind)

Usar utilidades estándar del proyecto: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Frame Figma invitado: **390 × 844**.

### Patrones obligatorios

1. **Tablas:** cabecera `hidden sm:grid`; fila apilada `sm:hidden` (ver `distribution-table-list.tsx`).
2. **Botones e iconos accionables en móvil:** `min-h-11 min-w-11` (44 px) o `p-3` equivalente.
3. **Formularios:** `grid-cols-1` por defecto; `sm:grid-cols-2` solo admin en pantallas amplias.
4. **Plano / canvas:** puede requerir scroll horizontal en móvil; no bloquear el resto del flujo.
5. **Componentes invitado (RSVP, afinidad):** implementar en `ui/` o exportables desde admin mock → guest portal.
6. **Colores semánticos:** usar helpers de `lib/semantic-ui.ts` (mesas, RSVP, filtros) — no duplicar clases Tailwind sueltas.

| Significado | Color token | Uso |
|-------------|-------------|-----|
| Éxito / llena / confirmado | `success-500` | Mesas llenas, RSVP ✓ |
| Atención / en uso / pendiente | `warning-500` | Mesas parciales |
| Error / rechazado | `error-500` | RSVP ✗, eliminar |
| Marca / activo / enviado | `primary-500` | CTAs, filtros activos, accesorios plano |
| Neutro / vacío | `neutral-*` | Mesas vacías, texto secundario |

### Modo colaborativo

Los invitados usarán **móvil** para RSVP y afinidades. Al añadir UI que un invitado tocará:

- Diseñar primero en 390 px.
- Probar en DevTools móvil antes de merge.
- No depender de `:hover` ni de menús solo con clic derecho.

---

## 6) Página `/sistema` (roadmap)

Placeholder en piloto. Objetivo post-MVP:

- Galeria de primitivos `ui/` con variantes (default, hover, error, empty).
- Muestra de tokens activos.
- Referencia para Ventana 2 (Figma) y Ventana 1 (implementacion).

---

## 7) Checklist al anadir componente

- [ ] ¿Feedback según `guia-estilo-taulamic.md` §7 (toast / save indicator / alert / nav)?
- [ ] ¿Es reutilizable? → `ui/` o modulo de dominio correcto
- [ ] ¿Exportado en `index.ts`?
- [ ] ¿Sin hex sueltos (salvo ilustracion)?
- [ ] ¿Assets via `brandConfig`?
- [ ] ¿Pagina en `app/` solo compone?
- [ ] ¿Usable en 390 px si lo tocara un invitado? (`ADR-019`)
- [ ] ¿Touch target ≥ 44 px en acciones primarias móvil?

---

## 8) Referencias

- `apps/web/README.md`
- `docs/adr/ADR-017-frontend-design-system-modular.md`
- `docs/adr/ADR-019-responsive-y-mobile-invitado.md`
- `docs/ux/guia-estilo-taulamic.md`
- `docs/ux/design-tokens-mvp.md`
- `docs/ux/handoff-figma-a-frontend.md`
