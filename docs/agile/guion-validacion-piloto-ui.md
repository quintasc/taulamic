# Guion de validacion manual — Piloto UI (MVP julio / post-hito)

- **Estado:** Vigente (alineado a piloto evaluable CP-SAT + HU-05)
- **Fecha:** 2026-08-06
- **Referencias:** `DECISION-002`, `ADR-018`, `ADR-023`, `ADR-024`, `guia-estilo-taulamic.md` §6–7, `docs/pilot/ALCANCE-ACTUAL.md`, `apps/web/e2e/pilot-flow.spec.ts`, `CONTEXTO-EJECUCION.md`
- **Entorno:** API `:3000`, Web `:3001` (`npm run dev` desde raíz, o `dev:api` + `dev:web`)
- **Motor:** CP-SAT **v1** por defecto (`DISTRIBUTION_ENGINE`); no exigir v0
- **Orden setup piloto:** Config → Invitados → Tarjetas (🔒) → Plano → Mesas → Afinidades → Distribución

Este guion valida el **flujo admin evaluable** desde la interfaz, con patrones UX vigentes (guardado implícito, `SetupNavBar`, toasts) y capacidades ya en código (ajuste manual HU-05, sillas/estrella). Marca cada paso al completarlo.

> **Histórico:** versiones de jun 2026 asumían motor v0 y ✕/+/drag fuera de alcance. Quedan obsoletas para PO.
>
> **Detalle MEJ-08:** `guion-validacion-mej-08-ui.md` (complementario). Este guion **incluye** ✕/+/mover como esperados.

---

## Patrones UX a verificar (transversal)

Comprueba estos comportamientos en los pasos indicados:

| Patron | Donde | Resultado esperado |
|--------|-------|-------------------|
| `SetupNavBar` | Config, Invitados, Plano, Mesas, Afinidades, Distribucion | `← Anterior` + `Siguiente →` al pie; en movil, barra fija inferior |
| Bloqueo «Siguiente» | Config (sin nombre), Invitados (0), Mesas (0), Plano (cargando) | Banner rojo con hint; boton atenuado pero clicable → scroll al banner |
| `SaveStatusIndicator` | Config, Plano, Afinidades | «Guardando…» / «Guardado automaticamente» en `PageHeader`; **sin** boton «Guardar» generico |
| Toast | Invitados (import/alta/edicion), Mesas (anadir) | Confirmacion breve arriba centro (~4 s) |
| Sin «Guardar» setup | Config, Plano, Afinidades | No debe existir CTA principal «Guardar» ni «Guardar y continuar» |

---

## Preparacion

- [ ] API y web en marcha sin errores en consola
- [ ] Navegador en ventana de incognito o sin datos previos de Taulamic (recomendado)
- [ ] **Opcion A — Excel corto:** plantilla UI; 4 invitados con 2 parejas (`PAREJA_001`, `PAREJA_002`)
- [ ] **Opcion Abis — Excel demo:** [`docs/pilot/invitados-piloto-80.xlsx`](../pilot/invitados-piloto-80.xlsx) (opcional, evento grande)
- [ ] **Opcion B — Manual:** anotar un nombre de prueba para alta manual en paso 8

---

## A. Arranque y configuracion (pasos 1–6)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 1 | Crear evento | `/` → «Crear evento» o `/admin` | Redirige a **Configuracion** (no al dashboard); API crea evento tecnico | [ ] |
| 2 | Dashboard sin config | `/admin/events/[id]` (antes de completar config) | KPI setup **0 %**; checklist: ningun paso marcado | [ ] |
| 3 | Formulario config | `/config` | Campo nombre **vacio** (placeholder «Ej. Boda Garcia-Lopez»); **Invitados aproximados** visible; **sin** campo «Nº de mesas» | [ ] |
| 4 | Modo preferencias | `/config` | Solo **anfitrion exclusivo** seleccionable; colaborativo visible **deshabilitado** | [ ] |
| 5 | Auto-save config | `/config` → escribir nombre | Indicador «Guardando…» / «Guardado automaticamente» en header; **sin** boton «Guardar»; nombre persistido al recargar | [ ] |
| 6 | Avance config | `/config` → «Siguiente» | Con nombre vacio: banner bloqueo; con nombre valido: navega a **Invitados**; KPI setup sube (1/6 ≈ 17 %) | [ ] |

---

## B. Invitados (pasos 7–12)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 7 | Plantilla Excel | `/guests` → Descargar | Plantilla **sin** columna `preferencia_control`; toast o confirmacion de descarga | [ ] |
| 8a | Importar Excel | `/guests` → Subir | Invitados sin errores; toast exito; checklist «Invitados» marcado | [ ] |
| 8b | *(alternativa)* Alta manual | `/guests` → Añadir invitado (drawer) | Formulario crea invitado via API; toast; aparece en lista | [ ] |
| 9 | Bloqueo avance | `/guests` con 0 invitados | «Siguiente» bloqueado con hint «Añade al menos un invitado…» | [ ] |
| 10 | RSVP mock | `/guests` | Iconos confirmado / rechazado / pendiente; clic cambia estado (meta local) | [ ] |
| 11 | Menu acciones | `/guests` | Menu ⋮ global y por fila visible; acciones post-piloto **deshabilitadas** o «Proximamente» | [ ] |
| 12 | Editar / eliminar | `/guests` → ⋮ fila | Editar nombre y eliminar invitado operativos; toast en acciones | [ ] |

---

## C. Tarjetas — paso bloqueado (paso 13)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 13 | Tarjetas candado | Sidebar → «Tarjetas» / `/invitations` | Paso visible en nav y checklist con **candado**; hint piloto; no bloquea el flujo lineal («Siguiente» desde Invitados salta a Plano) | [ ] |

---

## D. Plano del salon (pasos 14–16)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 14 | Plano Fase A | `/floor-plan` | Forma + medidas; hint de **superficie recomendada** si hay invitados aprox.; `SaveStatusIndicator` activo | [ ] |
| 15 | Auto-save plano | Editar forma/medidas | Guardado automatico (API `room-setup` + meta local); **sin** «Guardar y continuar»; persiste al recargar | [ ] |
| 16 | Accesorios | `/floor-plan` | Catalogo visible (ej. mesa novios); **dentro** del perimetro del salon; checklist paso «Plano» marcado | [ ] |

---

## E. Mesas y afinidades (pasos 17–20)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 17 | Mesas | `/tables` | Crear ≥ 2 mesas (ej. M1, M2) con «Añadir mesa»; toast; checklist «Mesas» marcado | [ ] |
| 18 | Bloqueo mesas | `/tables` con 0 mesas | «Siguiente» bloqueado con hint «Añade al menos una mesa…» | [ ] |
| 19 | Afinidades | `/preferences` | Pantalla afinidades + reglas genericas (toggle); `SaveStatusIndicator` al cambiar regla; **sin** boton «Guardar borrador» | [ ] |
| 20 | Checklist afinidades | Dashboard | Paso «Afinidades y reglas definidas» marcado tras activar al menos una regla o visitar y persistir | [ ] |

---

## F. Dashboard intermedio (pasos 21–24)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 21 | KPIs coherentes | `/admin/events/[id]` | Invitados, Mesas/plazas coherentes con datos cargados | [ ] |
| 22 | Afinidad honesta | Dashboard | Texto **«No calculado en piloto»** (sin % falso) si aplica | [ ] |
| 23 | Progreso setup | Dashboard | Checklist 5/6 antes de distribuir; barra setup refleja pasos reales (Tarjetas no cuenta) | [ ] |
| 24 | Nav orden | Sidebar | Orden: Config → Invitados → Tarjetas (🔒) → Plano → Mesas → Afinidades → Distribucion | [ ] |

---

## G. Distribucion, ajuste manual y plano (pasos 25–34)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 25 | Calcular | `/distribution` → Calcular | Propuesta **CP-SAT** (async + progreso); parejas Excel en misma mesa cuando aplica | [ ] |
| 26 | Compatibilidad / score | `/distribution` | Columna o indicadores de compatibilidad/score de mesa coherentes (no inventar % falso de «afinidad global») | [ ] |
| 27 | Acordeon mesas | `/distribution` | Expandir mesa → pills / sillas S1…Sn; mesas vacias visibles | [ ] |
| 28 | Sillas / estrella | `/distribution` | Asientos visibles; estrella presidencial operable (meta local OK) | [ ] |
| 29 | Desasignar (✕) | Mesa con invitado | ✕ desasigna; persiste en API (`draft`) | [ ] |
| 30 | Asignar / mover | + o drag / dialogo | Mover entre mesas o asignar desde sin asignar; score se recalcula | [ ] |
| 31 | Ver en plano | `/floor-plan/layout` | Mesas con color por ocupacion; contador n/cap | [ ] |
| 32 | Panel invitados | `/floor-plan/layout` | Clic en mesa → panel con invitados; **ajuste manual** coherente con distribucion (no solo lectura) | [ ] |
| 33 | Posiciones canvas | `/floor-plan/layout` | Guardar/restablecer posiciones segun UI vigente (si habilitado; si no, anotar) | [ ] |
| 34 | Confirmar | `/distribution` → Confirmar | Estado confirmado; checklist setup 6/6 (100 %); PDF descargable (jsPDF) | [ ] |

---

## H. Bloqueos y regresion (pasos 35–36)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 35 | Post-confirmacion | `/tables` → intentar añadir mesa | API rechaza cambio (**409**); mensaje coherente con E2E | [ ] |
| 36 | Persistencia sesion | Recargar pestaña | Mismos datos en la misma sesion (`sessionStorage` + API) | [ ] |

---

## I. Fuera de alcance / deshabilitado (piloto)

Marca ✅ si el comportamiento es el esperado:

| Comportamiento | Esperado piloto | OK |
|----------------|-----------------|-----|
| Boton «Guardar» en Config / Plano / Afinidades | Ausente (auto-save) | [ ] |
| Modo colaborativo en config | Deshabilitado | [ ] |
| Top-K / comparador de candidatas | No en UI | [ ] |
| Drag posiciones de mesas en canvas (si botones deshabilitados) | Coherente con UI | [ ] |
| Bloqueo de invitados | Sin UI | [ ] |
| Recuperar eventos entre sesiones (multi-dispositivo) | No (sin auth/BD) | [ ] |
| Tarjetas / invitaciones diseno | Candado (HU-10 post-piloto) | [ ] |

**Nota:** ✕ / + / drag entre mesas **sí** forman parte del piloto evaluable (sección G).

---

## Criterios de exito

- [ ] Flujo completado en **< 30 min** con ayuda minima
- [ ] Orden setup respetado sin saltos obligatorios confusos
- [ ] KPI setup progresa de 0 % a 100 % de forma coherente
- [ ] Motor CP-SAT / async verificados; sin exigir v0
- [ ] Ajuste manual (✕/+/mover) verificado
- [ ] Patrones UX § transversal verificados (nav, auto-save, toasts, bloqueos)
- [ ] Evidencias en `docs/agile/evidencias-piloto/` (nueva sesion)

---

## Incidencias

| Paso | Descripcion | Severidad |
|------|-------------|-----------|
| | | |

---

## Relacion con CI

| Capa | Comando |
|------|---------|
| API E2E | `cd apps/api && npm run test:e2e` |
| Web build | `cd apps/web && npm run build` |
| **Web E2E (Playwright)** | `cd apps/web && npm run test:e2e` → `pilot-flow.spec.ts` |

El E2E API usa el motor segun `DISTRIBUTION_ENGINE` (default **v1**). **No sustituye** esta validacion UI; la complementa.

### Playwright vs validacion manual

| | Playwright | Guion manual + evidencias |
|---|------------|---------------------------|
| **Proposito** | Regresion automatica del flujo feliz | Cierre DoD / validacion PO |
| **Documentacion** | `docs/agile/observabilidad-y-e2e-web-piloto.md` | `docs/agile/evidencias-piloto/` |

**Regla:** ejecuta Playwright en desarrollo/CI; la **validacion manual con evidencias** sigue siendo requisito de cierre PO.

---

## Referencia rapida — checklist setup (6 pasos contables)

| # | Clave | Criterio «hecho» |
|---|-------|------------------|
| 1 | `config` | Nombre del evento guardado (auto-save) |
| 2 | `guests` | ≥ 1 invitado |
| 3 | `plano` | Plano Fase A guardado (API + meta) |
| 4 | `tables` | ≥ 1 mesa |
| 5 | `prefs` | Reglas de afinidad persistidas |
| 6 | `dist` | Distribucion calculada o confirmada |

*Tarjetas (`invitations`) visible en nav pero **excluida** del conteo piloto.*
