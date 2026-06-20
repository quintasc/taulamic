# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-20
- Hito activo: **MVP julio (piloto)** — ver `DECISION-002-mvp-julio-piloto-funcional.md`
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic` — rebrand **cerrado 100 %** (`DECISION-003`; commits `c3183c1`, `fc790c0`, `d2749d0`)
- Workspace local: carpeta **`taulamic`** (renombrar desde `taulame` si aun no lo hiciste; ver abajo)

## Al reabrir Cursor (leer primero)

1. **Abrir carpeta:** `...\PROYECTO\taulamic` (no `taulame`).
2. **Comprobar git:** `git status -sb` → debe mostrar `## main...origin/main`.
3. **Pegar en el chat** la frase clave de abajo.
4. **Siguiente trabajo:** issue **#36** — suite E2E consolidada EP-13 (modo + permisos + acompanantes + auditoria).
5. **Patron de cierre:** implementar → `npm run build && npm test && npm run test:e2e` → commit + push → cerrar issue en GitHub → actualizar este archivo.

## Frase clave para Cursor

```text
Retomo Taulamic. MVP julio piloto (31 jul). Sprint 02 activo. Rebrand cerrado 100%. Workspace taulamic. EP-13 #32-#35 hechas. Siguiente: #36 E2E consolidado EP-13. SDD manda.
```

## Donde estamos ahora

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) |
| Issue actual | **#36** (E2E EP-13) — **abierta** |
| EP-11 | **#22–#26 cerradas** |
| EP-12 | **#27–#31 cerradas** |
| EP-13 implementacion | **#32–#35 cerradas** (modo, permisos, acompanantes, auditoria gobernanza) |
| EP-13 pruebas E2E | **#36 pendiente** |
| Rebrand Taulame → Taulamic | **Cerrado** (codigo, docs, GitHub, README) |
| Carpeta local | Renombrar `taulame` → `taulamic` al reabrir (opcional cosmético; git no cambia) |
| Plan detallado | `docs/agile/mvp-julio-plan.md` |
| Roadmap grafico | `docs/agile/roadmap-mvp-julio.md` |

## Issue #36 — que hay que hacer

**Objetivo:** una suite E2E que valide EP-13 de punta a punta (SDD HU-38, HU-39, HU-40 + trazabilidad de auditoria).

**Ya existen** suites separadas (no sustituyen #36):

| Archivo | Issue |
|---------|-------|
| `apps/api/test/events.e2e-spec.ts` | #32 modo preferencias |
| `apps/api/test/guest-preferences.e2e-spec.ts` | #33 permisos por modo |
| `apps/api/test/guest-companions.e2e-spec.ts` | #34 acompanantes |
| `apps/api/test/event-governance-audit.e2e-spec.ts` | #35 auditoria |

**Entregable #36:** nuevo spec consolidado (p. ej. `ep-13-governance.e2e-spec.ts`) o ampliacion coordinada que recorra el flujo completo en un solo escenario: modo → restricciones segun rol → grupos acompañantes → `GET .../governance-audit`.

**Tras #36:** cerrar EP-13; siguiente en roadmap W1–W2 → **#15** (forma de mesa).

## Dos niveles de MVP (no confundir)

| Nivel | Que es | Cuando |
|-------|--------|--------|
| **MVP julio (piloto)** | Flujo admin demostrable en evento real | **2026-07-31** |
| **MVP SDD completo** | Todo `SDD-01-borrador-mvp.md` | Post-piloto (ago 2026+) |

## Comandos utiles

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```

## Ultimos commits de referencia

| Commit | Descripcion |
|--------|-------------|
| `c3183c1` | Rebrand producto y repo Taulame → Taulamic |
| `fc790c0` | README: dominio registrado + enlace repo |
| `d2749d0` | Documentacion: rebrand cerrado al 100 % |
| `#35` | `7678825` — auditoria gobernanza modo y acompanantes |
