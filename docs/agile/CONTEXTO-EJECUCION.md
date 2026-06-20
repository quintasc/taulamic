# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-18
- Hito activo: **MVP julio (piloto)** — ver `DECISION-002-mvp-julio-piloto-funcional.md`

## Frase clave para Cursor

```text
Retomo Taulame. MVP julio piloto (31 jul). Sprint 02 activo. EP-11 cerrado (#22-#26). Siguiente: #27 Excel. Objetivo piloto: plano+Excel+evento+invitados+motor v0+UI admin minima. SDD completo post-piloto. DECISION-002. SDD manda.
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
| Issue actual | **#27** (Excel invitados) |
| EP-11 progreso | **#22–#26 cerradas** (E2E calidad importacion) |
| Plan detallado | `docs/agile/mvp-julio-plan.md` |
| Roadmap grafico | `docs/agile/roadmap-mvp-julio.md` (Gantt + fechas) |

## Proximas 2 semanas (W1–W2)

1. **#27–#31** Excel invitados
2. **#32–#36** Preferencias (si W1 va bien)

## Comandos utiles

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```
