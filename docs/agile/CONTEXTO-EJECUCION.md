# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-20
- Hito activo: **MVP julio (piloto)** — ver `DECISION-002-mvp-julio-piloto-funcional.md`
- Naming: **Taulame** en piloto; **Taulamic** candidato post-piloto — ver `DECISION-003-naming-taulame-taulamic.md`

## Frase clave para Cursor

```text
Retomo Taulame. MVP julio piloto (31 jul). Sprint 02 activo. EP-12 cerrado (#27-#31). EP-13 #32-#35 hechas. Siguiente: #36 E2E EP-13. Naming: Taulame piloto, Taulamic candidato (DECISION-003). SDD manda.
```

## Dos niveles de MVP (no confundir)

| Nivel | Que es | Cuando |
|-------|--------|--------|
| **MVP julio (piloto)** | Flujo admin demostrable en evento real | **2026-07-31** |
| **MVP SDD completo** | Todo `SDD-01-borrador-mvp.md` | Post-piloto (ago 2026+) |

## Estado actual

| Aspecto | Estado |
|---------|--------|
| Sprint activo | Sprint 02 (#21) |
| Issue actual | **#36** (E2E EP-13) |
| EP-11 progreso | **#22–#26 cerradas** |
| EP-12 progreso | **#27–#31 cerradas** |
| EP-13 progreso | **#32–#35 cerradas** (modo + permisos + acompanantes + auditoria) |
| Plan detallado | `docs/agile/mvp-julio-plan.md` |
| Roadmap grafico | `docs/agile/roadmap-mvp-julio.md` |

## Proximas 2 semanas (W1–W2)

1. **#36** E2E consolidado EP-13
2. **#15** Forma de mesa (si W1 va bien)

## Comandos utiles

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```
