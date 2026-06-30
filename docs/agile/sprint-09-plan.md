# Sprint 09 — Estabilización piloto (W3)

> **Inicio propuesto:** 2026-06-21  
> **Contexto:** Sprint 08 P1 cerrado (`sprint-08-cierre.md`, `main` @ `2c8362a`).  
> **SDD manda** — accesorios con posición y fondo canvas requieren gate PO/SDD explícito.

## 1) Objetivo

Mantener el piloto bodas **estable y verificable** hasta el hito 31 jul: E2E fiable en dev/CI, smoke MEJ-13 D, y fixes menores sin ampliar alcance funcional.

---

## 2) Alcance propuesto

| Prioridad | ID | Descripción | Estado |
|-----------|-----|-------------|--------|
| **P1** | E2E-robust | Helper `startPilotAdminFlow` + doc troubleshooting | ✅ |
| **P1** | — | Verificar E2E 3/3 en entorno limpio | ✅ |
| **P2** | MEJ-13-D-smoke | Validación PO Fase D (Config + Distribución `< md`) | ⏳ PO |
| **P2** | — | Repaso manual opcional `guion-validacion-piloto-ui.md` | ⏳ |
| **P3** | — | Accesorios `(x,y)` en room-setup | ⏳ Diferido — gate SDD |
| **P3** | — | Fondo canvas / IA | ⏳ Post-piloto ADR-016 |

---

## 3) Fuera de alcance

| Exclusión | Motivo |
|-----------|--------|
| PostgreSQL / auth | Post-piloto MVP SDD |
| Motor EP-08 / Top-K operativo | Post-piloto |
| Drag posiciones mesas | ADR-016 post-MVP |
| #53 Organizador real | Pospuesto |

---

## 4) Criterios de cierre Sprint 09

- [x] E2E `pilot-flow.spec.ts` 3/3 verde (local + documentado)
- [x] `observabilidad-y-e2e-web-piloto.md` con troubleshooting dev
- [ ] Smoke PO MEJ-13 D (o evidencia estática anotada)
- [ ] `sprint-09-cierre.md` + `CONTEXTO-EJECUCION.md`
- [ ] Opcional: sesión manual piloto

---

## 5) Referencias

- `spike-plano-room-setup-2026-06.md` — no reimplementar room-setup
- `roadmap-mvp-julio.md` — W3 estabilización
- `guion-validacion-mej-13-ui.md` — pasos 6–7 Fase D

---

## 6) Historial

| Fecha | Evento |
|-------|--------|
| 2026-06-21 | Plan Sprint 09 creado |
| 2026-06-21 | E2E robusto: `startPilotAdminFlow`, troubleshooting doc, 3/3 OK |
