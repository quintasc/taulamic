# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-24**
- Commit referencia: **`f498e90`** (`main`)
- Hito activo: **MVP julio (piloto)** — **DoD cerrado**
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic`
- **Modo actual:** post-piloto — Sprint 03 (backlog UX + preparacion MVP SDD)

## Frase clave (pegar al agente)

```text
Retomo Taulamic. main @ f498e90. Sprint 02 CERRADO (#21). Piloto DoD cerrado. Sprint 03 post-piloto activo. Lee CONTEXTO-EJECUCION.md y sprint-03-plan.md. SDD manda.
```

---

## Estado compartido

| Aspecto | Estado |
|---------|--------|
| Sprint activo | **Sprint 03** — post-piloto (ver `sprint-03-plan.md`) |
| Sprint 02 | **Cerrado** 2026-06-24 ([#21](https://github.com/quintasc/taulamic/issues/21), [milestone](https://github.com/quintasc/taulamic/milestone/2)) |
| EP-11 / EP-12 / EP-13 | **Cerrados** |
| EP-01 / EP-02 | **Cerrados** |
| EP-03 piloto | **Motor v0 entregado** (EP-03 completo = post-piloto) |
| Integracion E2E API | **Cerrado** (`pilot-flow.e2e-spec.ts`) |
| **E2E UI Playwright** | **Cerrado** (`apps/web/e2e/pilot-flow.spec.ts`, 3 tests) |
| OpenAPI piloto | **Cerrado** (`/api/docs`, `/api-json`) |
| API room-setup Fase A | **Cerrado** (ADR-020) |
| Frontend admin piloto | **Cerrado** (flujo setup + pantallas) |
| Barra setup + guardado implicito | **Cerrado** (#40) |
| Feedback UX (toast, auto-save) | **Cerrado** (#41) |
| Guia estilo canonica | **Cerrado** (#42) |
| Clean architecture frontend | **Cerrado** (#43, ADR-021) |
| Invitados v2 en `/guests` | **Cerrado** |
| **Guion validacion post-UX** | **Cerrado** (`guion-validacion-piloto-ui.md`) |
| **Validacion manual post-UX** | **Cerrada** — `evidencias-piloto/sesion-2026-06-24.md` (apta cierre; H parcial 409/F5) |
| **Observabilidad** | **Preparada** — Sentry opcional (web+API); doc `observabilidad-y-e2e-web-piloto.md` |
| **Dev unificado** | **Cerrado** — `npm run dev` en raiz |
| **DoD piloto julio** | **Cerrado** — validación simulada PO; usuario real pospuesto (#53) |
| Plan piloto | `mvp-julio-plan.md` · Gantt `roadmap-mvp-julio.md` |

---

## Entregado reciente en `main` (jun 2026)

| PR / commit | Que aporta |
|-------------|------------|
| **`d137a4c`** | Fix alertas drawer invitado manual; Excel piloto alineado; Playwright E2E; Sentry opcional; `npm run dev` raiz; evidencias sesion 2026-06-24 |
| **#40–#43** | SetupNavBar, feedback UX, guia estilo, clean architecture frontend |
| `f188c21` | CONTEXTO post-PRs #40–#43 |
| PR #37 | UX Figma / docs piloto |

### Flujo setup vigente (ADR-018)

Config → Invitados → **Tarjetas** (🔒) → Plano → Mesas → Afinidades → Distribución

---

## Pendiente — cierre DoD (`mvp-julio-plan.md` §4)

**Estado 24 jun 2026:** DoD **cerrado**. No hay organizador real disponible en esta fase; se aplica el criterio DECISION-002 «organizador real **o simulado**» mediante `sesion-2026-06-24.md` (PO, < 30 min) + E2E API/Playwright.

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Guion validacion post-UX | ✅ |
| 2 | Validacion manual E2E UI | ✅ `sesion-2026-06-24.md` |
| 3 | Evidencias finales | ✅ |
| 4 | Tests/CI piloto | ✅ API build+test+e2e; web build + Playwright |
| 5 | **Issues `post-piloto` en GitHub** | ✅ #44–#52 (MEJ-01…09) |
| 6 | **Organizador real** | ⏭️ **Pospuesto** — sin disponibilidad; [#53](https://github.com/quintasc/taulamic/issues/53) → post-piloto |
| 7 | Verificar OpenAPI vs UI | ⏳ Revisión puntual recomendada (no bloquea cierre) |

### Fuera de alcance piloto (backlog GitHub `post-piloto`)

Ver issues GitHub **#44–#52** (`post-piloto`, MEJ sesion 2026-06-24) y epicos agosto en `mvp-julio-plan.md` §5.

---

## Dev local (Windows / OneDrive)

```powershell
npm install
npm run install:apps   # primera vez
npm run dev            # API :3000 + Web :3001
```

### Comandos validacion

```powershell
cd apps\api; npm run build; npm test; npm run test:e2e
cd apps\web; npm run build; npm run test:e2e
```

---

## Referencias

| Documento | Para que |
|-----------|----------|
| `docs/agile/mvp-julio-plan.md` | DoD piloto §4 |
| `docs/agile/sprint-03-plan.md` | Sprint activo post-piloto |
| `docs/agile/guion-validacion-piloto-ui.md` | Validacion manual UI |
| `docs/agile/evidencias-piloto/sesion-2026-06-24.md` | Evidencias cierre post-UX |
| `docs/agile/observabilidad-y-e2e-web-piloto.md` | Playwright + Sentry |
| `docs/ux/spec-invitados-panel-v2-post-piloto.md` | Invitados v2 post-piloto |
| GitHub Project | https://github.com/users/quintasc/projects/2 |

---

## Ultimos commits de referencia (`main`)

| Commit | Descripcion |
|--------|-------------|
| f498e90 | docs(agile): cerrar DoD piloto sin usuario real |
| e46067a | docs(agile): planificacion post-validacion piloto |
| d137a4c | fix(web): alertas invitado, Excel piloto, Playwright, Sentry, dev raiz |
