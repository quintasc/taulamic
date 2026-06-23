# Guion de validacion manual — Piloto UI (MVP julio)

- **Estado:** Vigente
- **Fecha:** 2026-06-21 (actualizado tras enmienda flujo setup)
- **Referencias:** `DECISION-002`, `ADR-018`, `SDD-PILOTO-enmienda-flujo-setup-jun2026.md`, `handoff-figma-a-frontend.md`, `pilot-flow.e2e-spec.ts` (API)
- **Entorno:** API `:3000`, Web `:3001` (`npm run start:dev` + `npm run dev:clean`)
- **Orden setup piloto:** Config → Plano → Invitados → Mesas → Afinidades → Distribución

Este guion valida el **mismo flujo funcional** que el E2E backend, pero desde la interfaz admin, con el **orden y criterios** del piloto jun 2026. Marca cada paso al completarlo.

---

## Preparacion

- [ ] API y web en marcha sin errores en consola
- [ ] Navegador en ventana de incognito o sin datos previos de Taulamic (recomendado)
- [ ] **Opción A — Excel:** plantilla descargada desde la UI; 4 invitados con 2 parejas (`PAREJA_001`, `PAREJA_002`)
- [ ] **Opción B — Manual:** anotar un nombre de prueba para alta manual en paso 5

---

## A. Arranque y configuracion (pasos 1–3)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 1 | Crear evento | `/` → «Crear evento» o `/admin` | Redirige a **Configuración** (no al dashboard); API crea evento técnico | [ ] |
| 2 | Dashboard sin config | `/admin/events/[id]` (antes de guardar config) | KPI setup **0 %**; checklist: ningún paso marcado | [ ] |
| 3 | Configurar evento | `/config` | Campo nombre **vacío** (placeholder «Ej. Boda García-López»); **Invitados aproximados** visible; **sin** campo «Nº de mesas» | [ ] |
| 4 | Modo preferencias | `/config` | Solo **anfitrión exclusivo** seleccionable; colaborativo visible **deshabilitado** | [ ] |
| 5 | Guardar config | `/config` → Guardar | Mensaje éxito; nombre persistido; KPI setup sube (1/6 ≈ 17 %) | [ ] |

---

## B. Plano del salon (pasos 4–5)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 6 | Plano Fase A | `/floor-plan` | Forma + medidas; hint de **superficie recomendada** si hay invitados aprox. | [ ] |
| 7 | Guardar plano | «Guardar y continuar» | Persiste al recargar (`localStorage`); checklist paso «Plano» marcado | [ ] |
| 8 | Accesorios | `/floor-plan` | Catálogo visible (ej. mesa novios); **dentro** del perímetro del salón | [ ] |

---

## C. Invitados (pasos 6–9)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 9 | Plantilla Excel | `/guests` → Descargar | Plantilla **sin** columna `preferencia_control` | [ ] |
| 10a | Importar Excel | `/guests` → Subir | 4 invitados sin errores; checklist «Invitados» marcado | [ ] |
| 10b | *(alternativa)* Alta manual | `/guests` → Añadir invitado | Formulario crea invitado vía API; aparece en lista | [ ] |
| 11 | RSVP mock | `/guests` | Iconos confirmado / rechazado / pendiente; clic cambia estado (meta local) | [ ] |
| 12 | Menu acciones | `/guests` | Menú ⋮ global y por fila visible; acciones post-piloto **deshabilitadas** o «Próximamente» | [ ] |
| 13 | Editar / eliminar | `/guests` → ⋮ fila | Editar nombre y eliminar invitado operativos | [ ] |

---

## D. Mesas y afinidades (pasos 10–11)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 14 | Mesas | `/tables` | Crear ≥ 2 mesas (ej. M1, M2), capacidad y forma; checklist «Mesas» marcado | [ ] |
| 15 | Afinidades | `/preferences` | Pantalla afinidades + reglas genéricas (mock); guardar borrador | [ ] |
| 16 | Checklist afinidades | Dashboard | Paso «Afinidades y reglas definidas» marcado tras guardar | [ ] |

---

## E. Dashboard intermedio (paso 12)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 17 | KPIs coherentes | `/admin/events/[id]` | Invitados, Mesas/plazas coherentes con datos cargados | [ ] |
| 18 | Afinidad honesta | Dashboard | Texto **«No calculado en piloto»** (sin % falso) | [ ] |
| 19 | Progreso setup | Dashboard | Checklist 5/6 antes de distribuir; barra setup refleja pasos reales | [ ] |
| 20 | Nav orden | Sidebar | Orden: Config → Plano → Invitados → Mesas → Afinidades → Distribución | [ ] |

---

## F. Distribucion y plano Fase B (pasos 13–16)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 21 | Calcular | `/distribution` → Calcular | Propuesta motor v0; parejas en misma mesa | [ ] |
| 22 | Afinidad en tabla | `/distribution` | Columna Afinidad: **«N/D piloto»** (no porcentaje real) | [ ] |
| 23 | Acordeon mesas | `/distribution` | Expandir mesa → pills con nombres; mesas vacías visibles | [ ] |
| 24 | Ver en plano | `/floor-plan/layout` | Mesas con color por ocupación; contador n/cap | [ ] |
| 25 | Invitados al clic | `/floor-plan/layout` | Clic en mesa → panel con pills (**solo lectura**; sin ✕ ni drag) | [ ] |
| 26 | Botones post-MVP | `/floor-plan/layout` | «Guardar posiciones» / «Restablecer» **deshabilitados** | [ ] |
| 27 | Confirmar | `/distribution` → Confirmar | Estado confirmado; checklist setup 6/6 (100 %) | [ ] |

---

## G. Bloqueos y regresion (paso 17)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 28 | Post-confirmacion | `/tables` → intentar añadir mesa | API rechaza cambio (**409**); mensaje coherente con E2E | [ ] |
| 29 | Persistencia sesion | Recargar pestaña | Mismos datos en la misma sesión (`sessionStorage` + API) | [ ] |

---

## H. Fuera de alcance (no debe funcionar en piloto)

Marca ✅ si el comportamiento es el esperado (ausente o deshabilitado):

| Comportamiento | Esperado piloto | OK |
|----------------|-----------------|-----|
| Modo colaborativo en config | Deshabilitado | [ ] |
| ✕ / + en pills de distribución | No visible / no operativo | [ ] |
| Drag invitado entre mesas | No operativo | [ ] |
| Drag posiciones de mesas en canvas | Botones deshabilitados | [ ] |
| Lista «sin asignar» al clic KPI | No implementada (post-piloto) | [ ] |
| Bloqueo de invitados | Sin UI | [ ] |
| Recuperar eventos entre sesiones | No (decisión MVP) | [ ] |

---

## Criterios de exito (DECISION-002)

- [ ] Flujo completado en **< 30 min** con ayuda mínima
- [ ] Orden setup respetado sin saltos obligatorios confusos
- [ ] KPI setup progresa de 0 % a 100 % de forma coherente
- [ ] Sin porcentajes de afinidad presentados como dato real
- [ ] Capturas o notas en `docs/agile/evidencias-piloto/` (opcional)

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

El E2E API **no sustituye** esta validación UI; la complementa.

---

## Referencia rapida — checklist setup (6 pasos)

| # | Clave | Criterio «hecho» |
|---|-------|------------------|
| 1 | `config` | Config guardada con nombre real |
| 2 | `plano` | Plano Fase A guardado |
| 3 | `guests` | ≥ 1 invitado |
| 4 | `tables` | ≥ 1 mesa |
| 5 | `prefs` | Borrador afinidades guardado |
| 6 | `dist` | Distribución calculada o confirmada |
