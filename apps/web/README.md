# Taulamic Web — Admin piloto

Frontend Next.js del MVP julio (issue W5). Diseño según Figma Make y `docs/ux/handoff-figma-a-frontend.md`.

## Estructura modular (`src/`)

```
app/              Rutas Next.js (páginas finas)
  (marketing)/    Landing → /
  admin/          Panel organizador
  sistema/        Design system (placeholder)
components/
  ui/             Piezas reutilizables (Alert, StatCard, PageHeader…)
  marketing/      Landing, header, tarjetas, hero
  admin/          Shell, sidebar, dashboard, checklist, distribution
  brand/          Logo Taulamic
  icons/          Iconos SVG (nav, formas mesa…)
  tables/         Preview y utilidades de mesas
hooks/            Lógica de pantalla (p. ej. useEventDashboard)
lib/              API, rutas, contexto evento, nav admin
```

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

## Referencias UX

- Tokens: `docs/ux/design-tokens-mvp.md`
- Capturas: `docs/ux/exports/capturas-figma/`
- Handoff: `docs/ux/handoff-figma-a-frontend.md`
