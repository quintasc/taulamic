# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-06-29**
- Commit referencia: **`18e2615`** (`main`)
- Hito activo: **MVP julio (piloto)** — **DoD cerrado**
- Naming: producto **Taulamic**, dominio **taulamic.com**, repo `quintasc/taulamic`
- **Modo actual:** **Sprint 05 cerrado** — MEJ-02 ✅ · MEJ-08 ✅ · #53 pospuesto

## Frase clave (pegar al agente)

```text
Retomo Taulamic. main @ 18e2615. Sprint 05 cerrado (sprint-05-cierre.md): MEJ-02 (#45) y MEJ-08 Fase 1 (#51). Backlog: MEJ-08 Fase 2, #53. SDD manda.
```

---

## Estado compartido

| Aspecto | Estado |
|---------|--------|
| Sprint activo | **Por planificar** (Sprint 06) |
| Sprint 05 | **Cerrado** 2026-06-29 — `sprint-05-cierre.md` · MEJ-02, MEJ-08 |
| Sprint 04 | **Cerrado** 2026-06-28 — `sprint-04-cierre.md` |
| Sprint 03 | **Cerrado** 2026-06-26 — `sprint-03-cierre.md` |
| EP-11 / EP-12 / EP-13 | **Cerrados** |
| EP-01 / EP-02 | **Cerrados** |
| EP-03 piloto | **Motor v0 entregado** |
| Integracion E2E API | **Cerrado** |
| **E2E UI Playwright** | **Cerrado** (3 tests) |
| Frontend admin piloto | **Cerrado** |
| **DoD piloto julio** | **Cerrado** |
| **MEJ-02 (#45)** | **Cerrado** — `evidencias-mej-02-cierre.md` |
| **MEJ-08 Fase 1 (#51)** | **Cerrado** — `evidencias-mej-08-fase1-validacion.md` |

---

## Entregado Sprint 05

| MEJ | Issue | Evidencia |
|-----|-------|-----------|
| MEJ-02 | #45 | `evidencias-mej-02-cierre.md` |
| MEJ-08 Fase 1 | #51 | `evidencias-mej-08-fase1-validacion.md` |

Commits: `ae1a1fb`, `a106257`, `b79789d`, `5ab009b`, `6bfbe1a`, `18e2615` · detalle en `sprint-05-cierre.md`.

### Flujo setup vigente (ADR-018)

Config → Invitados → **Tarjetas** (🔒) → Plano → Mesas → Afinidades → Distribución

---

## Backlog activo (post-piloto)

| Prioridad | Issue | Descripcion | Estado |
|-----------|-------|-------------|--------|
| Backlog | — | MEJ-08 Fase 2 (drag, auditoría HU-05) | Abierto |
| Pospuesto | [#53](https://github.com/quintasc/taulamic/issues/53) | Organizador real julio 2026 | Abierta |

**Cerradas en Sprint 05:** #45, #51.

---

## Dev local (Windows / OneDrive)

```powershell
npm install
npm run install:apps   # primera vez
npm run dev            # API :3000 + Web :3001
```

Ruta con apóstrofo: usar `subst X:` o `git -C C:\Users\carme\ONEDRI~1\Documents\GitHub\taulamic`.

### Comandos validacion

```powershell
cd apps\api; npm run build; npm test; npm run test:e2e
cd apps\web; npm run build; npm run test:e2e
```

---

## Referencias

| Documento | Para que |
|-----------|----------|
| `docs/agile/sprint-05-cierre.md` | Cierre Sprint 05 |
| `docs/agile/evidencias-mej-02-cierre.md` | MEJ-02 (#45) |
| `docs/agile/evidencias-mej-08-fase1-validacion.md` | MEJ-08 (#51) |
| `docs/agile/guion-validacion-mej-08-ui.md` | Guion manual MEJ-08 |
| `docs/agile/sprint-05-plan.md` | Plan Sprint 05 |
| `docs/agile/mvp-julio-plan.md` | DoD piloto |
| GitHub Project | https://github.com/users/quintasc/projects/2 |
