# Observabilidad y E2E web — Piloto julio

- **Estado:** Vigente (jun 2026)
- **Relacionado:** `guion-validacion-piloto-ui.md`, `pilot-flow.spec.ts` (web), API E2E, `CONTEXTO-EJECUCION.md`

## Modelo en dos capas (obligatorio para cierre piloto)

| Capa | Herramienta | Rol |
|------|-------------|-----|
| **Automática** | Playwright (`apps/web`) | Regresión rápida del flujo feliz del guion; CI y desarrollo |
| **Manual con evidencias** | Guion + `docs/agile/evidencias-piloto/` | Cierre DoD piloto (DECISION-002); UX, criterios subjetivos, feedback PO |
| **Errores producción/dev** | Sentry (web + API) | Monitorización; no sustituye validación funcional |

**Regla:** Playwright **complementa** el guion manual; **no lo sustituye** para el cierre del piloto julio.

---

## Playwright (E2E UI)

### Ubicación

- Config: `apps/web/playwright.config.ts`
- Tests: `apps/web/e2e/pilot-flow.spec.ts`
- Helpers: `apps/web/e2e/helpers/pilot-flow.ts`
- Excel fixture: `docs/pilot/invitados-validacion-manual.xlsx`

### Comandos

Con API y web ya en marcha (recomendado en dev):

```powershell
cd apps\web
npm run test:e2e
```

Playwright puede arrancar API + web automáticamente si los puertos están libres (`webServer` en config).

### Troubleshooting (dev local)

| Síntoma | Causa habitual | Acción |
|---------|----------------|--------|
| `/admin` no redirige a `/config` | API caída (`:3000`) | `npm run dev` desde raíz del repo |
| `GET /admin` → 500 | `.next` inconsistente tras `npm run build` con dev activo | Parar dev, borrar `apps/web/.next`, reiniciar |
| Playwright reutiliza web rota | `reuseExistingServer: true` fuera de CI | Parar dev y relanzar tests, o `CI=1 npm run test:e2e` (puertos libres) |
| Timeout en Config | API lenta o evento no creado | Ver consola API; helper `startPilotAdminFlow` muestra mensaje accionable |

**Regla:** no ejecutar `npm run build` en `apps/web` mientras `npm run dev` está activo en el mismo directorio.

Modo interactivo:

```powershell
npm run test:e2e:ui
```

Informe HTML tras fallo:

```powershell
npm run test:e2e:report
```

### Qué cubre

- Flujo feliz A→G del guion (config → invitados → plano → mesas → afinidades → distribución)
- Patrones UX: auto-save, sin «Guardar», bloqueo «Siguiente»
- Paso Tarjetas bloqueado (HU-10)

### Qué no cubre (sigue en guion manual)

- Juicio visual / usabilidad (< 30 min, fricción)
- Capturas y notas PO
- Fuera de alcance (sección I del guion)
- Prueba con organizador real → **pospuesta** post-piloto ([#53](https://github.com/quintasc/taulamic/issues/53)); cierre piloto con validación simulada PO

---

## Sentry

### Activación

Sentry está **integrado pero inactivo** sin DSN. Copia variables desde:

- `apps/web/.env.example`
- `apps/api/.env.example`

Crea `apps/web/.env.local` y/o `apps/api/.env` con tu proyecto en [sentry.io](https://sentry.io).

| Variable | Capa | Uso |
|----------|------|-----|
| `NEXT_PUBLIC_SENTRY_DSN` | Web cliente | Errores en navegador |
| `SENTRY_DSN` | Web servidor + API | Errores SSR y NestJS |
| `SENTRY_ENVIRONMENT` | Ambas | `development`, `staging`, `production` |
| `SENTRY_TRACES_SAMPLE_RATE` | Ambas | Trazas performance (0–1) |

### Implementación

| App | Archivos |
|-----|----------|
| Web | `instrumentation.ts`, `sentry.*.config.ts`, `next.config.ts`, `app/error.tsx` |
| API | `src/instrument.ts`, `SentryModule` + `SentryGlobalFilter` en `app.module.ts` |

### Verificación local

1. Configura DSN de un proyecto de prueba.
2. Provoca un error en web (`error.tsx` captura excepciones de ruta).
3. Comprueba el evento en el panel Sentry.

---

## Validación manual (sin cambios)

Sigue el procedimiento en `docs/agile/guion-validacion-piloto-ui.md` y documenta en:

`docs/agile/evidencias-piloto/sesion-YYYY-MM-DD.md`

**MEJ-08 (distribucion manual post-piloto):** `docs/agile/guion-validacion-mej-08-ui.md` · evidencias en `docs/agile/evidencias-mej-08-fase1-validacion.md`.

La sesión `sesion-2026-06-21.md` queda como referencia histórica (guion pre auto-save).

---

## CI sugerido (post-configuración)

```yaml
# Fragmento orientativo
- run: cd apps/api && npm run build && npm test && npm run test:e2e
- run: cd apps/web && npm run build && npm run test:e2e
```

En CI, define `CI=true` para que Playwright no reutilice servidores locales y reintente una vez.
