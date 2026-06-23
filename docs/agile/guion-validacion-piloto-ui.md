# Guion de validacion manual — Piloto UI (MVP julio)

- Estado: **Vigente**
- Fecha: 2026-06-24
- Referencias: `DECISION-002`, `pilot-flow.e2e-spec.ts` (API), `handoff-figma-a-frontend.md`
- Entorno: API `:3000`, Web `:3001` (`npm run start:dev` + `npm run dev:clean`)

Este guion valida el **mismo flujo** que el E2E backend, pero desde la interfaz admin. Marca cada paso al completarlo.

---

## Preparacion

- [ ] API y web en marcha sin errores en consola
- [ ] Navegador en ventana de incognito o sin datos previos de Taulamic (opcional)
- [ ] Archivo Excel de prueba: descargar plantilla desde la UI o usar 4 invitados con 2 parejas (`PAREJA_001`, `PAREJA_002`)

---

## Flujo punta a punta

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 1 | Crear evento | `/` → «Crear evento» o `/admin` | Redirige a dashboard de evento nuevo | [ ] |
| 2 | Configurar evento | `/admin/events/[id]/config` | Nombre y metadatos guardables | [ ] |
| 3 | Plano Fase A | `/floor-plan` | Forma + medidas; «Guardar y continuar» persiste al recargar | [ ] |
| 4 | Mesas | `/tables` | Crear mesas (ej. M1, M2), capacidad y forma | [ ] |
| 5 | Preferencias | `/preferences` | Elegir modo y guardar | [ ] |
| 6 | Plantilla Excel | `/guests` → Descargar | Plantilla **sin** columna `preferencia_control` | [ ] |
| 7 | Importar invitados | `/guests` → Subir Excel | 4 invitados importados sin errores | [ ] |
| 8 | Dashboard KPIs | `/admin/events/[id]` | Invitados, Mesas/plazas coherentes; Afinidad «No calculado en piloto» | [ ] |
| 9 | Checklist setup | Dashboard | Pasos marcados segun progreso real | [ ] |
| 10 | Calcular distribucion | `/distribution` → Calcular | Propuesta motor v0; parejas en misma mesa | [ ] |
| 11 | Afinidad en tabla | Distribucion | Columna Afinidad: «N/D piloto» (no % falso) | [ ] |
| 12 | Ver en plano | `/floor-plan/layout` | Mesas visibles; clic → invitados | [ ] |
| 13 | Confirmar | Distribucion → Confirmar | Estado confirmado; evento `plan_approved` | [ ] |
| 14 | Bloqueo post-confirmacion | Mesas → intentar añadir mesa | API rechaza cambio (409) coherente con E2E | [ ] |

---

## Criterios de exito (DECISION-002)

- [ ] Flujo completado en **< 30 min** con ayuda minima
- [ ] Datos persisten al recargar la misma pestaña
- [ ] Sin porcentajes de afinidad presentados como dato real
- [ ] Capturas o notas adjuntas como evidencia (opcional: carpeta `docs/agile/evidencias-piloto/`)

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

El E2E API **no sustituye** esta validacion UI; la complementa.
