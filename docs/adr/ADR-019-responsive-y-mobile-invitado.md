# ADR-019 — Web responsive y mobile-first para invitado (modo colaborativo)

- **Estado:** Aceptado
- **Fecha:** 2026-06-21
- **Relacionado:** `SDD-00-vision-y-estrategia.md`, `SDD-01C`, `ADR-017`, `ADR-018`, HU-02, HU-10–11

## Contexto

Taulamic es **web responsive** (`SDD-00`: «web responsive primero»). El piloto julio centra el panel **organizador** en escritorio (sidebar fija, plano ancho, tablas). En **modo colaborativo**, los invitados deberán:

- responder **RSVP**,
- indicar **afinidades e incompatibilidades**,
- consultar su mesa publicada,

con alta probabilidad desde **móvil** (enlace en correo, WhatsApp, QR).

Si el admin se diseña solo para desktop y el portal invitado se añade después sin criterios comunes, se duplica trabajo y se rompe la coherencia visual.

## Decisión

### 1. Dos superficies, dos prioridades de viewport

| Superficie | Usuario | Prioridad diseño | Piloto julio |
|------------|---------|------------------|--------------|
| **Admin** (`/admin`) | Organizador | Desktop-first (≥ 1024 px); **debe degradar** sin romper en tablet/móvil | Funcional en tablet; sidebar completa en desktop |
| **Invitado** (futuro `/guest`, `/rsvp`, enlace token) | Invitado | **Mobile-first** (base 390 px); escala a tablet/desktop | No implementado; **criterio obligatorio** al diseñar/implementar |
| **Marketing** (`/`) | Visitante | Responsive dual (ya en curso) | ✅ |

### 2. Principios transversales (todas las pantallas)

1. **Layout fluido:** grids con `sm:` / `md:` / `lg:`; evitar anchos fijos que desborden en 390 px.
2. **Touch targets:** mínimo **44 × 44 px** en acciones primarias móvil (botones, iconos RSVP, toggles).
3. **Tablas → listas:** en `< md`, tablas densas pasan a filas apiladas o cards (patrón ya usado en `distribution-table-list.tsx`).
4. **Formularios:** una columna en móvil; labels visibles; inputs `font-size` ≥ 16 px para evitar zoom iOS.
5. **Primitivos compartidos:** RSVP, chips de estado y botones deben nacer en `components/ui/` reutilizables en admin (mock) y portal invitado (futuro).
6. **Sin hover-only:** toda acción crítica debe ser usable sin `:hover` (tap / teclado).

### 3. Modo colaborativo — implicaciones UX

Cuando `preference-control-mode = colaborativo`:

- El invitado es **co-autor** de restricciones de seating; la UI debe completarse en **≤ 45 s** en móvil (`SDD-01C` objetivo RSVP).
- Flujos invitado **cortos y lineales** (máx. 3–4 pantallas): confirmar asistencia → preferencias opcionales → resumen.
- Copy y controles **no técnicos**; sin sidebar admin ni jerga de «distribución».

### 4. Breakpoints de referencia (Tailwind + Figma)

| Token | Ancho | Uso |
|-------|-------|-----|
| Base | 390 px | Frame Figma móvil invitado; diseño mobile-first |
| `sm` | 640 px | Ajustes marketing / formularios admin |
| `md` | 768 px | Tablas → layout híbrido |
| `lg` | 1024 px | Admin sidebar + plano lado a lado |
| `xl` | 1280 px | Dashboard 4 columnas |

### 5. Piloto vs post-MVP

| Ámbito | Piloto | Post-MVP |
|--------|--------|----------|
| Admin responsive | Grids y listas adaptativas; sidebar fija (deuda conocida) | Drawer / bottom nav móvil admin (opcional) |
| Portal invitado | No operativo | Mobile-first obligatorio |
| RSVP mock en lista admin | Iconos táctiles ≥ 44 px | Misma pieza UI en portal real |
| Figma | Desktop admin 1280; móvil invitado en backlog | Frames 390 para RSVP + afinidades invitado |

## Consecuencias

- **Positivas:** Una sola stack web; componentes RSVP/afinidad reutilizables; alineación con SDD-00 y objetivos de fricción baja.
- **Negativas:** Admin piloto no optimiza cada pantalla para móvil (plano, mesas); aceptable si el organizador usa principalmente PC.
- **Deuda piloto:** `AdminSidebar` ancho fijo; valorar drawer en post-piloto solo si hay demanda organizador-móvil.

## Referencias

- `docs/sdd/SDD-PILOTO-enmienda-flujo-setup-jun2026.md` §8
- `docs/ux/frontend-component-system.md` §5
- `docs/ux/handoff-figma-a-frontend.md` — Responsive y portal invitado
