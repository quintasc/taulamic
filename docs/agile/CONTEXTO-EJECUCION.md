# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-20
- Hito activo: **MVP julio (piloto)** — ver `DECISION-002-mvp-julio-piloto-funcional.md`
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic` — rebrand **cerrado 100 %** (`DECISION-003`; commits `c3183c1`, `fc790c0`, `d2749d0`)
- Workspace local: carpeta **`taulamic`** ✓

## Al reabrir Cursor (leer primero)

1. **Abrir carpeta:** `...\PROYECTO\taulamic`.
2. **Comprobar git:** `git status -sb` → debe mostrar `## main...origin/main`.
3. **Pegar en el chat** la frase clave de abajo.
4. **Siguiente trabajo:** issue **#15** — forma de mesa y topologia de asientos (EP-01).
5. **Patron de cierre:** implementar → `npm run build && npm test && npm run test:e2e` → commit + push → cerrar issue en GitHub → actualizar este archivo.

## Frase clave para Cursor

```text
Retomo Taulamic. MVP julio piloto (31 jul). Sprint 02 activo. Rebrand cerrado. EP-13 cerrado (#36). Siguiente: #15 forma de mesa. SDD manda.
```

## Donde estamos ahora

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) |
| Issue actual | **#15** (forma de mesa) — **abierta** |
| EP-11 | **#22–#26 cerradas** |
| EP-12 | **#27–#31 cerradas** |
| EP-13 | **#32–#36 cerradas** — gobernanza preferencias completa |
| Rebrand Taulame → Taulamic | **Cerrado** (codigo, docs, GitHub, README, workspace local) |
| Plan detallado | `docs/agile/mvp-julio-plan.md` |
| Roadmap grafico | `docs/agile/roadmap-mvp-julio.md` |

## Issue #15 — que hay que hacer

**Objetivo:** HU-29 — configurar forma de mesa y topologia de asientos (adyacencia/proximidad). EP-01.

**Referencia SDD:** `SDD-02-backlog-inicial.md` (EP-01, HU-29).

**Tras #15:** continuar EP-01 segun roadmap W1–W2.

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
| `#36` | E2E consolidado EP-13 (`ep-13-governance.e2e-spec.ts`) |
| `69b9301` | Punto de reanudacion post-rebrand |
| `d2749d0` | Documentacion: rebrand cerrado al 100 % |
| `#35` | `7678825` — auditoria gobernanza modo y acompanantes |
