# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-28**
- Commit referencia: **`8a851da`** (`main`)
- Hito activo: **MVP julio (piloto)** — **DoD cerrado**
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic`
- **Modo actual:** **Sprint 05 en curso** — MEJ-02 (#45) · MEJ-08 (#51) · #53 pospuesto

## Frase clave (pegar al agente)

```text
Retomo Taulamic. main @ 7d147cf. Sprint 05 en curso: MEJ-02 Excel (#45) y MEJ-08 distribución manual (#51). Lee sprint-05-plan.md y CONTEXTO-EJECUCION.md. SDD manda.
```

---

## Estado compartido

| Aspecto | Estado |
|---------|--------|
| Sprint activo | **Sprint 05** — `sprint-05-plan.md` · #45, #51 |
| Sprint 04 | **Cerrado** 2026-06-28 — `sprint-04-cierre.md` · MEJ-05, MEJ-07 |
| Sprint 03 | **Cerrado** 2026-06-26 — `sprint-03-cierre.md` · commits `6d0b074`, `21d249e` |
| Sprint 02 | **Cerrado** 2026-06-24 ([#21](https://github.com/quintasc/taulamic/issues/21)) |
| EP-11 / EP-12 / EP-13 | **Cerrados** |
| EP-01 / EP-02 | **Cerrados** |
| EP-03 piloto | **Motor v0 entregado** (EP-03 completo = post-piloto) |
| Integracion E2E API | **Cerrado** (`pilot-flow.e2e-spec.ts`) |
| **E2E UI Playwright** | **Cerrado** (`apps/web/e2e/pilot-flow.spec.ts`, 3 tests) |
| OpenAPI piloto | **Cerrado** (`/api/docs`, `/api-json`) |
| API room-setup Fase A | **Cerrado** (ADR-020) |
| Frontend admin piloto | **Cerrado** (flujo setup + pantallas) |
| **MEJ-01…09 (Sprint 03)** | **5/9 cerradas** — #44, #46, #47, #49, #52 · resto en backlog |
| **Marca wordmark PNG** | **Cerrado** — `taulamic-wordmark.png` 2 colores |
| **Footer admin + countdown** | **Cerrado** — sidebar no solapada; animación separadores |
| **Observabilidad** | **Preparada** — Sentry opcional (web+API) |
| **Dev unificado** | **Cerrado** — `npm run dev` en raiz |
| **DoD piloto julio** | **Cerrado** — validación simulada PO; usuario real pospuesto (#53) |
| Plan piloto | `mvp-julio-plan.md` · Gantt `roadmap-mvp-julio.md` |

---

## Entregado en Sprint 03 (`main`)

| Commit | Que aporta |
|--------|------------|
| **`21d249e`** | Wordmark PNG 2 colores; footer fijo alineado a sidebar; animación cuenta atrás |
| **`6d0b074`** | MEJ-01 plantilla Excel persistente; MEJ-03 filtros invitados; MEJ-04 confirm delete; MEJ-06 iconos plano; MEJ-09 fix flash F5; fix Sentry dev |
| **`d137a4c`** | Fix alertas drawer; Excel piloto; Playwright; Sentry; `npm run dev` raiz |
| **#40–#43** | SetupNavBar, feedback UX, guia estilo, clean architecture frontend |

Detalle completo: **`docs/agile/sprint-03-cierre.md`**.

### Flujo setup vigente (ADR-018)

Config → Invitados → **Tarjetas** (🔒) → Plano → Mesas → Afinidades → Distribución

---

## Backlog activo (post-piloto)

| Prioridad | Issue | Descripcion | Estado |
|-----------|-------|-------------|--------|
| Backlog | [#45](https://github.com/quintasc/taulamic/issues/45) | MEJ-02 — Excel ampliado + IA observaciones | Abierta |
| Backlog | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 — distribución manual HU-05 | Abierta |
| Pospuesto | [#53](https://github.com/quintasc/taulamic/issues/53) | Organizador real julio 2026 | Abierta |

**Cerradas en Sprint 04:** #48, #50.

**Cerradas en Sprint 03:** #44, #46, #47, #49, #52.

---

## Pendiente menor (no bloquea)

| Tarea | Estado |
|-------|--------|
| Verificar OpenAPI vs UI | ⏳ Revisión puntual recomendada |
| Batería tests pre-Sprint 04 | ✅ API build+test+e2e; web build + Playwright 3/3 (2026-06-26) |
| Capturas opcionales piloto | ⏳ `evidencias-piloto/capturas-2026-06-24/` |

---

## Dev local (Windows / OneDrive)

```powershell
npm install
npm run install:apps   # primera vez
npm run dev            # API :3000 + Web :3001
```

Ruta con apóstrofo: usar `subst X:` apuntando al repo o `git -C X:\`.

### Comandos validacion

```powershell
cd apps\api; npm run build; npm test; npm run test:e2e
cd apps\web; npm run build; npm run test:e2e
```

---

## Referencias

| Documento | Para que |
|-----------|----------|
| `docs/agile/sprint-03-cierre.md` | Registro entregas Sprint 03 |
| `docs/agile/sprint-03-plan.md` | Plan original Sprint 03 |
| `docs/agile/mvp-julio-plan.md` | DoD piloto §4 · epicas agosto §5 |
| `docs/agile/guion-validacion-piloto-ui.md` | Validacion manual UI |
| `docs/agile/evidencias-piloto/sesion-2026-06-24.md` | Evidencias cierre post-UX |
| `docs/agile/observabilidad-y-e2e-web-piloto.md` | Playwright + Sentry |
| GitHub Project | https://github.com/users/quintasc/projects/2 |

---

## Ultimos commits de referencia (`main`)

| Commit | Descripcion |
|--------|-------------|
| 02f1a5b | docs(agile): cerrar Sprint 03 y actualizar contexto |
| 21d249e | feat(web): wordmark PNG, footer admin y animacion cuenta atras |
| 6d0b074 | feat(web): Sprint 03 piloto, iconos del plano y fix Sentry |
| fd57185 | docs(agile): cerrar Sprint 02 e iniciar Sprint 03 |
| f498e90 | docs(agile): cerrar DoD piloto sin usuario real |
| d137a4c | fix(web): alertas invitado, Excel piloto, Playwright, Sentry, dev raiz |
