# Taulamic Web — Admin piloto

Frontend Next.js del MVP julio (issue W5). Diseño según Figma Make y `docs/ux/handoff-figma-a-frontend.md`.

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
npm run dev
```

- Web: http://localhost:3001
- API: http://localhost:3000/api/v1 (proxy vía rewrite en Next)

## Flujo piloto

1. Landing `/` → «Crear evento» (`/admin/events/new`) o «Iniciar sesión» (`/admin` → último evento)
2. Dashboard y pantallas bajo `/admin/events/[id]/…` (config, floor-plan, guests, preferences, tables, distribution)

Header admin: `x-taulamic-actor-role: admin` (piloto sin JWT).

## Referencias UX

- Tokens: `docs/ux/design-tokens-mvp.md`
- Capturas: `docs/ux/exports/capturas-figma/`
- Handoff: `docs/ux/handoff-figma-a-frontend.md`
