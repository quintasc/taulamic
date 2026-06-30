# Spike — Persistencia plano Fase A (jun 2026)

- **Fecha:** 2026-06-21
- **Origen:** `SDD-PILOTO-alineacion-y-huecos.md` §107 · `sprint-08-plan.md` P2
- **Rama revisada:** `main` @ `fa6603e`

## Pregunta

¿Falta implementar «API persistencia layout salón (Fase A)» o solo hay huecos parciales?

## Hallazgos

| Capa | Estado | Referencia |
|------|--------|------------|
| API `GET/PUT /events/:id/room-setup` | ✅ Operativo | `event-config.controller.ts`, `room-setup.use-case.ts` |
| Persistencia fichero | ✅ `room-setup.json` por evento | `file-room-setup.repository.ts` |
| Web Fase A auto-save | ✅ Debounce 600 ms → API + localStorage | `floor-plan-setup-view.tsx` |
| Modelo dominio | ✅ `shape`, medidas, `placedAccessories[]` (ids) | `room-setup.ts` |
| E2E / piloto | ✅ Flujo A–G cubre plano (Playwright) | `pilot-flow.spec.ts` |

## Huecos reales (no bloquean piloto julio)

| Hueco | SDD / ADR | Prioridad sugerida |
|-------|-----------|------------------|
| Posiciones `(x,y)` de accesorios en canvas | ADR-016 post-piloto (drag accesorios) | Sprint 09+ / post-MVP |
| Fondo imagen / IA opcional | SDD-01D · ADR-016 | Post-piloto |
| Sincronización multi-dispositivo sin localStorage | Mejora robustez | P3 |
| Layout Fase B (posiciones mesas API) | EP-11 legacy + ADR-016 | Post-MVP |

## Conclusión

**No abrir epic «crear room-setup API»** — ya existe (`ADR-020` implícito en código).

**Sprint 09 opciones (PO):**

1. **Estabilización** — repaso manual piloto + fixes menores (W3 roadmap).
2. **Accesorios con posición** — ampliar contrato `room-setup` (requiere diseño + gate SDD).
3. **Pospuesto** — ir a post-piloto MVP SDD (PostgreSQL, auth).

## Recomendación técnica

Actualizar `SDD-PILOTO-alineacion-y-huecos.md` §107: marcar item 1 como 🟡 parcial (room-setup OK; posiciones/fondo pendientes).

## Referencias

- `docs/adr/ADR-016-plano-espacial-salon-dos-fases.md`
- `docs/sdd/SDD-01D-importacion-plano-salon.md`
- `apps/web/src/lib/floor-plan-setup.ts`
