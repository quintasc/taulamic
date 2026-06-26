# Taulamic Web — Admin piloto

Frontend Next.js del MVP julio (issue W5). Diseño según **`docs/ux/guia-estilo-taulamic.md`** y `docs/ux/handoff-figma-a-frontend.md`.

## Estructura modular (`src/`)

Ver inventario completo: `docs/ux/frontend-component-system.md` · guía UX/UI: `docs/ux/guia-estilo-taulamic.md` · ADR: `docs/adr/ADR-017-frontend-design-system-modular.md`

```
app/              Rutas Next.js (páginas finas)
  (marketing)/    Landing → /
  admin/          Panel organizador
  sistema/        Design system (placeholder → galería post-MVP)
theme/            Marca y rutas de assets (`brand.config.ts`)
components/
  ui/             Piezas reutilizables (Alert, StatCard, PageHeader…)
  marketing/      Landing, header, tarjetas, hero, ilustraciones
  admin/          Shell, sidebar, dashboard, distribution, floor-plan
  brand/          Logo Taulamic
  tables/         Preview y utilidades de mesas
  icons.tsx       Iconos SVG (nav, formas mesa…)
hooks/            Lógica de pantalla (p. ej. useEventDashboard)
lib/              API, rutas, contexto evento, nav admin
```

**Cambiar imagen de marca (piloto):** sustituir PNG en `public/` y actualizar `src/theme/brand.config.ts`. Colores/tipografía modular completa: post-MVP (ADR-017).

## Arranque local

Terminal 1 — API:

```bash
cd apps/api
npm run start:dev
```

Terminal 2 — Web:

```bash
cd apps/web
npm install
npm run dev:clean
```

(`dev:clean` borra `.next` antes de arrancar; recomendado si el proyecto está en OneDrive.)

Si el puerto 3001 está ocupado o ves **Internal Server Error**: `netstat -ano | findstr :3001` → `taskkill /PID <pid> /F` → `npm run dev:clean` (sin argumentos extra).

- Web: http://localhost:3001
- API: http://localhost:3000/api/v1 (proxy vía rewrite en Next)

## Flujo piloto

1. Landing `/` → CTAs a `/admin` (crea **evento nuevo** cada vez)
2. Dashboard y pantallas bajo `/admin/events/[id]/…` (config, floor-plan, guests, preferences, tables, distribution)
3. Recarga en la misma pestaña: OK. Enlace guardado en otra sesión: «Evento no disponible» → crear nuevo.

Header admin: `x-taulamic-actor-role: admin` (piloto sin JWT).

## Tests E2E (Playwright)

Automatizan el **flujo feliz** del guion `docs/agile/guion-validacion-piloto-ui.md`. **No sustituyen** la validación manual con evidencias.

```bash
cd apps/web
npm run test:e2e          # headless
npm run test:e2e:ui       # modo interactivo
npm run test:e2e:report   # informe HTML
```

Detalle: `docs/agile/observabilidad-y-e2e-web-piloto.md`

## Sentry (opcional)

Errores en web y API. Sin `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` no se envían eventos.

Variables: `apps/web/.env.example` · `apps/api/.env.example`

## Referencias UX

- Tokens: `docs/ux/design-tokens-mvp.md`
- **Componentes y theming:** `docs/ux/frontend-component-system.md`
- Capturas: `docs/ux/exports/capturas-figma/`
- Handoff: `docs/ux/handoff-figma-a-frontend.md`
